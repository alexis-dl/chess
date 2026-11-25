import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameImportService } from '../../analysis/game-import.service';
import { ChessUtilsService } from '../../chess-game/chess-utils.service';
import { Chessboard } from '../../chess-game/chessboard.model';
import { parseFen, toFen } from '../../chess-game/fen';
import { toPieceName } from '../../chess-game/piece.model';
import { PromotionService } from '../../chess-game/promotion/promotion.service';
import { RulesService } from '../../chess-game/rules.service';
import { parseUci } from '../puzzle-moves';
import { BatchEngine, EngineLine } from './batch-engine';
import { gameKey, GamePuzzle, GamePuzzleGoal } from './game-puzzle.model';
import { GamePuzzleStoreService } from './game-puzzle-store.service';
import {
  FetchErrorKey,
  FetchGamesError,
  FetchOptions,
  GamePlatform,
  GameSourcesService,
  SourceGame,
} from './game-sources';
import {
  classifyMove,
  GamePuzzleKind,
  isOnlyMove,
  WINNING,
  winChances,
} from './puzzle-finder';

/** Quick look at every position of a game, to spot the mistakes. */
const SCAN_DEPTH = 11;
/** Deeper look at the positions that may become puzzles. */
const CHECK_DEPTH = 16;
/** Longest solution, in moves of the solver. */
const MAX_MATE_MOVES = 5;
const MAX_MOVES = 2;

export type GeneratorErrorKey = FetchErrorKey | 'puzzles.mine.error.engine';

export interface GeneratorState {
  status: 'idle' | 'fetching' | 'analysing' | 'done' | 'error';
  /** From 0 to 1, while analysing. */
  progress: number;
  /** Games to analyse (those not analysed before). */
  gamesTotal: number;
  gamesDone: number;
  /** Games fetched but already analysed by a previous run. */
  gamesSkipped: number;
  /** Puzzles found by this run. */
  found: number;
  error: GeneratorErrorKey | null;
}

const IDLE: GeneratorState = {
  status: 'idle',
  progress: 0,
  gamesTotal: 0,
  gamesDone: 0,
  gamesSkipped: 0,
  found: 0,
  error: null,
};

/** A game replayed: every position, and who the player is. */
interface ReplayedGame {
  /** fens[k]: position before the ply k (fens[moves.length]: the final one). */
  fens: string[];
  moves: string[];
  sans: string[];
  /** Winning chances of the side to move, for finished positions only. */
  finished: (number | null)[];
  playerIsWhite: boolean;
  startsWithWhite: boolean;
  fullmoveNumber: number;
}

/**
 * Turns the player's recent games into puzzles: fetches them, scans them with
 * Stockfish for the moves that lost a lot (classifyMove), then keeps the
 * positions where the best move is the only good one (isOnlyMove).
 * Runs in the background: the generation goes on when leaving the page.
 */
@Injectable({
  providedIn: 'root',
})
export class PuzzleGeneratorService implements OnDestroy {
  private readonly stateSubject = new BehaviorSubject<GeneratorState>(IDLE);
  readonly state$ = this.stateSubject.asObservable();

  /**
   * Own instance of the rules: replaying games must not send the game events
   * (checkmate, next turn...) that the Play page listens to.
   */
  private readonly rules: RulesService;
  private readonly importer: GameImportService;
  private abort: AbortController | null = null;
  private engine: BatchEngine | null = null;

  constructor(
    private chessUtils: ChessUtilsService,
    private sources: GameSourcesService,
    private store: GamePuzzleStoreService
  ) {
    this.rules = new RulesService(chessUtils, new PromotionService());
    this.importer = new GameImportService(this.rules, chessUtils);
  }

  get running(): boolean {
    const { status } = this.stateSubject.value;
    return status === 'fetching' || status === 'analysing';
  }

  async generate(
    platform: GamePlatform,
    username: string,
    options: FetchOptions
  ): Promise<void> {
    if (this.running) {
      return;
    }
    const abort = new AbortController();
    this.abort = abort;
    this.setState({ ...IDLE, status: 'fetching' });
    try {
      const games = await this.sources.fetchGames(
        platform,
        username,
        options,
        abort.signal
      );
      const fresh = games.filter(
        game => !this.store.isAnalysed(gameKey(game.platform, game.id))
      );
      this.setState({
        status: 'analysing',
        gamesTotal: fresh.length,
        gamesSkipped: games.length - fresh.length,
      });
      this.engine = new BatchEngine();
      for (const game of fresh) {
        if (abort.signal.aborted) {
          return;
        }
        await this.analyseGame(game, username);
        this.store.markAnalysed(gameKey(game.platform, game.id));
        const gamesDone = this.stateSubject.value.gamesDone + 1;
        this.setState({ gamesDone, progress: gamesDone / fresh.length });
      }
      this.setState({ status: 'done', progress: 1 });
    } catch (error) {
      if (abort.signal.aborted) {
        return; // cancelled: the state was already reset
      }
      this.setState({
        status: 'error',
        error:
          error instanceof FetchGamesError
            ? error.key
            : 'puzzles.mine.error.engine',
      });
    } finally {
      this.engine?.terminate();
      this.engine = null;
      if (this.abort === abort) {
        this.abort = null;
      }
    }
  }

  /** Stop the running generation; the puzzles found so far are kept. */
  cancel(): void {
    if (!this.running) {
      return;
    }
    this.abort?.abort();
    this.engine?.terminate();
    this.setState({ status: 'done' });
  }

  ngOnDestroy(): void {
    this.cancel();
  }

  private async analyseGame(game: SourceGame, username: string): Promise<void> {
    const replayed = this.replay(game, username);
    if (!replayed) {
      return; // not a game of the player, or a PGN that cannot be read
    }
    const engine = this.engine!;
    engine.newGame();
    const { fens, moves, finished, playerIsWhite, startsWithWhite } = replayed;

    // winning chances of the player in every position
    const player: number[] = [];
    for (let k = 0; k <= moves.length; k++) {
      const whiteToMove = startsWithWhite === (k % 2 === 0);
      const sign = whiteToMove === playerIsWhite ? 1 : -1;
      const done = finished[k];
      if (done !== null) {
        player.push(sign * done);
      } else {
        const [best] = await engine.evaluate(fens[k], SCAN_DEPTH);
        player.push(sign * (best ? winChances(best) : 0));
      }
      const plyProgress = (k + 1) / (moves.length + 1);
      const { gamesDone, gamesTotal } = this.stateSubject.value;
      this.setState({ progress: (gamesDone + plyProgress) / gamesTotal });
    }

    for (let k = 0; k < moves.length; k++) {
      const whiteToMove = startsWithWhite === (k % 2 === 0);
      if (whiteToMove !== playerIsWhite) {
        continue; // the opponent's move
      }
      const kind = classifyMove(
        k > 0 ? player[k - 1] : null,
        player[k],
        player[k + 1]
      );
      if (kind) {
        const puzzle = await this.makePuzzle(game, replayed, k, kind, player);
        if (puzzle) {
          this.store.add(puzzle);
          this.setState({ found: this.stateSubject.value.found + 1 });
        }
      }
    }
  }

  /** Checks a candidate position deeply, and builds its solution. */
  private async makePuzzle(
    game: SourceGame,
    replayed: ReplayedGame,
    ply: number,
    scanKind: GamePuzzleKind,
    player: number[]
  ): Promise<GamePuzzle | null> {
    const engine = this.engine!;
    const fen = replayed.fens[ply];
    let lines = await engine.evaluate(fen, CHECK_DEPTH, 2);
    const [best] = lines;
    if (!best || best.pv[0] === replayed.moves[ply] || !isOnlyMove(lines)) {
      return null;
    }
    // the deeper look must confirm the mistake
    const kind = classifyMove(
      ply > 0 ? player[ply - 1] : null,
      winChances(best),
      player[ply + 1]
    );
    if (kind !== scanKind) {
      return null;
    }

    const board = this.boardFromFen(fen);
    const solution = [best.pv[0]];
    this.play(board, best.pv[0]);
    const maxMoves =
      best.mate !== null && best.mate > 0
        ? Math.min(best.mate, MAX_MATE_MOVES)
        : MAX_MOVES;
    let last: EngineLine = best;
    // extend the line while the solver's next move is again the only one
    for (let moves = 1; moves < maxMoves; moves++) {
      const reply = lines[0].pv[1];
      if (!reply || !this.play(board, reply) || this.isOver(board)) {
        break;
      }
      lines = await engine.evaluate(this.fen(board), CHECK_DEPTH, 2);
      if (!isOnlyMove(lines) || !this.play(board, lines[0].pv[0])) {
        break;
      }
      solution.push(reply, lines[0].pv[0]);
      last = lines[0];
    }

    const goal: GamePuzzleGoal = this.isCheckmate(solution, fen)
      ? 'mate'
      : winChances(last) >= WINNING
        ? 'advantage'
        : 'defend';
    const whiteToMove = replayed.startsWithWhite === (ply % 2 === 0);
    const fullmove =
      replayed.fullmoveNumber +
      Math.floor((ply + (replayed.startsWithWhite ? 0 : 1)) / 2);
    return {
      id: `${gameKey(game.platform, game.id)}-${ply}`,
      kind,
      goal,
      fen,
      solution,
      played: replayed.sans[ply],
      moveNumber: `${fullmove}${whiteToMove ? '.' : '...'}`,
      game: {
        platform: game.platform,
        url: game.url,
        opponent: replayed.playerIsWhite ? game.black : game.white,
        speed: game.speed,
        date: game.date,
      },
    };
  }

  /** Every position of a game, or null if it is not one of the player's. */
  private replay(game: SourceGame, username: string): ReplayedGame | null {
    const name = username.trim().toLowerCase();
    const playerIsWhite = game.white.toLowerCase() === name;
    if (!playerIsWhite && game.black.toLowerCase() !== name) {
      return null;
    }
    let imported;
    try {
      imported = this.importer.import(game.pgn);
    } catch {
      return null;
    }
    const { start, moves } = imported;
    const board = new Chessboard(this.chessUtils, start.state);
    const fens: string[] = [];
    const finished: (number | null)[] = [];
    for (const move of moves) {
      fens.push(this.fen(board, start.fullmoveNumber, start.state.isWhiteTurn));
      finished.push(null);
      this.play(board, move);
    }
    fens.push(this.fen(board, start.fullmoveNumber, start.state.isWhiteTurn));
    finished.push(this.finishedValue(board));
    return {
      fens,
      moves,
      sans: board.getHistory().map(entry => entry.san),
      finished,
      playerIsWhite,
      startsWithWhite: start.state.isWhiteTurn,
      fullmoveNumber: start.fullmoveNumber,
    };
  }

  /** -1 if the side to move is mated, 0 if stalemated, null if not over. */
  private finishedValue(board: Chessboard): number | null {
    if (this.rules.getAvailableMoves(board).length) {
      return null;
    }
    return this.rules.isInCheck(board) ? -1 : 0;
  }

  private isOver(board: Chessboard): boolean {
    return this.finishedValue(board) !== null;
  }

  /** The solution, played from the start, ends with a checkmate. */
  private isCheckmate(solution: string[], fen: string): boolean {
    const replay = this.boardFromFen(fen);
    return (
      solution.every(move => this.play(replay, move)) &&
      this.finishedValue(replay) === -1
    );
  }

  private boardFromFen(fen: string): Chessboard {
    return new Chessboard(this.chessUtils, parseFen(fen).state);
  }

  /**
   * FEN of the board. Its full move number is counted from the start of the
   * game (the board's history), so that move numbers read as in the game.
   */
  private fen(
    board: Chessboard,
    startFullmove = 1,
    startsWithWhite = true
  ): string {
    const plies = board.getHistory().length + (startsWithWhite ? 0 : 1);
    return toFen(board.saveState(), startFullmove + Math.floor(plies / 2));
  }

  /** Plays a UCI move; false if it is illegal. */
  private play(board: Chessboard, uci: string): boolean {
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

  private setState(change: Partial<GeneratorState>): void {
    this.stateSubject.next({ ...this.stateSubject.value, ...change });
  }
}
