import { Injectable } from '@angular/core';
import { GameImportService } from '../analysis/game-import.service';
import { ChessUtilsService } from '../chess-game/chess-utils.service';
import { Chessboard } from '../chess-game/chessboard.model';
import { parseFen, toFen } from '../chess-game/fen';
import { Color, toPieceName } from '../chess-game/piece.model';
import { PromotionService } from '../chess-game/promotion/promotion.service';
import { RulesService } from '../chess-game/rules.service';
import { Opening } from '../openings/openings';
import { OpeningService } from '../openings/opening.service';
import { gameKey } from '../puzzles/generator/game-puzzle.model';
import { SourceGame } from '../puzzles/generator/game-sources';
import { winChances } from '../puzzles/generator/puzzle-finder';
import { parseUci } from '../puzzles/puzzle-moves';
import { EngineQueueService } from './engine-queue.service';

/** Quick look at every position of a game (enough to spot the mistakes). */
export const SCAN_DEPTH = 11;
const CACHE_KEY = 'chess.gameAnalyses';
/** Games kept in the cache at most; the oldest analyses are dropped. */
const CACHE_SIZE = 3000;

/** A game replayed: every position, its moves and clocks. */
export interface ReplayedGame {
  /** fens[k]: position before the ply k (fens[moves.length]: the final one). */
  fens: string[];
  /** UCI notation. */
  moves: string[];
  sans: string[];
  /** Time left after each ply, in seconds; empty when the PGN has none. */
  clocks: (number | null)[];
  /** White's winning chances in the final position if it is over (mate...). */
  finalValue: number | null;
  startsWithWhite: boolean;
  fullmoveNumber: number;
  opening: Opening | null;
}

/** Color of a player in a game, null when they did not play it. */
export function colorOf(game: SourceGame, username: string): Color | null {
  const name = username.trim().toLowerCase();
  if (game.white.toLowerCase() === name) {
    return 'white';
  }
  return game.black.toLowerCase() === name ? 'black' : null;
}

/**
 * Replays and analyses games, for the statistics and the puzzle generator.
 * An analysis is White's winning chances in every position of the game
 * (winChances, from -1 to 1), kept in localStorage so that a game is
 * analysed only once.
 */
@Injectable({
  providedIn: 'root',
})
export class GameAnalysisService {
  /**
   * Own instance of the rules: replaying games must not send the game events
   * (checkmate, next turn...) that the Play page listens to.
   */
  readonly rules: RulesService;
  private readonly importer: GameImportService;
  private cache: Record<string, number[]> | null = null;
  private replays = new Map<string, ReplayedGame | null>();

  constructor(
    private chessUtils: ChessUtilsService,
    private openings: OpeningService,
    private engine: EngineQueueService
  ) {
    this.rules = new RulesService(chessUtils, new PromotionService());
    this.importer = new GameImportService(this.rules, chessUtils);
  }

  /** Every position of a game; null if its PGN cannot be read. */
  replay(game: SourceGame): ReplayedGame | null {
    const key = gameKey(game.platform, game.id);
    if (!this.replays.has(key)) {
      this.replays.set(key, this.computeReplay(game));
    }
    return this.replays.get(key)!;
  }

  /** The cached analysis of a game, if any. */
  cached(game: SourceGame): number[] | null {
    return this.getCache()[gameKey(game.platform, game.id)] ?? null;
  }

  /**
   * White's winning chances in every position of the game, from the cache or
   * computed with Stockfish. Null if the game cannot be read.
   * @throws when the engine is stopped (EngineQueueService.stop) or crashes
   */
  async analyse(game: SourceGame): Promise<number[] | null> {
    const cached = this.cached(game);
    if (cached) {
      return cached;
    }
    const replayed = this.replay(game);
    if (!replayed) {
      return null;
    }
    const values: number[] = [];
    const last = replayed.moves.length;
    for (let ply = 0; ply <= last; ply++) {
      const whiteToMove = replayed.startsWithWhite === (ply % 2 === 0);
      if (ply === last && replayed.finalValue !== null) {
        values.push(replayed.finalValue);
        continue;
      }
      const [best] = await this.engine.evaluate(replayed.fens[ply], SCAN_DEPTH);
      const sideToMove = best ? winChances(best) : 0;
      // two decimals: enough, and the cache stays small
      values.push(Math.round((whiteToMove ? 1 : -1) * sideToMove * 100) / 100);
    }
    this.store(gameKey(game.platform, game.id), values);
    return values;
  }

  /** Plays a UCI move; false if it is illegal. */
  play(board: Chessboard, uci: string): boolean {
    let move;
    try {
      move = parseUci(uci);
    } catch {
      return false;
    }
    const piece = move.promotion
      ? toPieceName(board.getCurrentPlayerColor(), move.promotion)
      : undefined;
    return this.rules.playMoveWithPromotion(move.from, move.to, board, piece);
  }

  boardFromFen(fen: string): Chessboard {
    return new Chessboard(this.chessUtils, parseFen(fen).state);
  }

  /** -1 if the side to move is mated, 0 if stalemated, null if not over. */
  finishedValue(board: Chessboard): number | null {
    if (this.rules.getAvailableMoves(board).length) {
      return null;
    }
    return this.rules.isInCheck(board) ? -1 : 0;
  }

  /** FEN of a board (whose history starts at the position given). */
  fen(board: Chessboard, startFullmove = 1, startsWithWhite = true): string {
    const plies = board.getHistory().length + (startsWithWhite ? 0 : 1);
    return toFen(board.saveState(), startFullmove + Math.floor(plies / 2));
  }

  private computeReplay(game: SourceGame): ReplayedGame | null {
    let imported;
    try {
      imported = this.importer.import(game.pgn);
    } catch {
      return null;
    }
    const { start, moves, clocks } = imported;
    const board = new Chessboard(this.chessUtils, start.state);
    const whiteStarts = start.state.isWhiteTurn;
    const fens: string[] = [];
    for (const move of moves) {
      fens.push(this.fen(board, start.fullmoveNumber, whiteStarts));
      this.play(board, move);
    }
    fens.push(this.fen(board, start.fullmoveNumber, whiteStarts));
    const finished = this.finishedValue(board);
    return {
      fens,
      moves,
      sans: board.getHistory().map(entry => entry.san),
      clocks,
      // from the side to move to White's point of view
      finalValue:
        finished === null ? null : board.getIsWhiteTurn() ? finished : -finished,
      startsWithWhite: whiteStarts,
      fullmoveNumber: start.fullmoveNumber,
      opening: this.openings.identify(board),
    };
  }

  private getCache(): Record<string, number[]> {
    if (!this.cache) {
      try {
        this.cache = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}');
      } catch {
        this.cache = {};
      }
    }
    return this.cache!;
  }

  private store(key: string, values: number[]): void {
    const cache = this.getCache();
    delete cache[key]; // re-added last: the order of the keys is the age
    cache[key] = values;
    const keys = Object.keys(cache);
    for (const old of keys.slice(0, Math.max(0, keys.length - CACHE_SIZE))) {
      delete cache[old];
    }
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {
      // storage full or unavailable: kept for this visit only
    }
  }
}
