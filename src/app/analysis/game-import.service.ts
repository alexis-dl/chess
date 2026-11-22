import { Injectable } from '@angular/core';
import { ChessUtilsService } from '../chess-game/chess-utils.service';
import { Chessboard } from '../chess-game/chessboard.model';
import { FenPosition, parseFen } from '../chess-game/fen';
import {
  PieceName,
  PromotionPieceType,
  toPieceName,
} from '../chess-game/piece.model';
import { Position } from '../chess-game/position.model';
import { RulesService } from '../chess-game/rules.service';
import { toUci } from '../puzzles/puzzle-moves';

/** A PGN header, e.g. [White "Magnus"]: name 'White', value 'Magnus'. */
export interface GameTag {
  name: string;
  value: string;
}

/** A game to analyse: a start position and the moves played from it. */
export interface ImportedGame {
  start: FenPosition;
  /** UCI notation, e.g. 'e2e4', 'e7e8q'. */
  moves: string[];
  /** Headers of the PGN, in their order (none for a FEN). */
  tags: GameTag[];
  /**
   * Time left after each move, in seconds, from [%clk] comments; empty when
   * the PGN has none.
   */
  clocks: (number | null)[];
}

/** Why a pasted text could not be read (keys of the translations). */
export type ImportError = 'analysis.import.empty' | 'analysis.import.invalid';

export class GameImportError extends Error {
  constructor(
    readonly key: ImportError,
    /** The move that could not be played, if any. */
    readonly move?: string
  ) {
    super(key);
  }
}

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const PROMOTIONS: PromotionPieceType[] = ['queen', 'rook', 'bishop', 'knight'];

/** Looks like the piece placement field of a FEN (8 ranks). */
const FEN_PATTERN = /^\s*([1-8pnbrqkPNBRQK]+\/){7}[1-8pnbrqkPNBRQK]+(\s|$)/;

/** Reads a pasted FEN or PGN, checking every move with the rules engine. */
@Injectable({
  providedIn: 'root',
})
export class GameImportService {
  constructor(
    private rulesService: RulesService,
    private chessUtilsService: ChessUtilsService
  ) {}

  /** @throws GameImportError */
  import(text: string): ImportedGame {
    if (!text.trim()) {
      throw new GameImportError('analysis.import.empty');
    }
    if (FEN_PATTERN.test(text)) {
      return {
        start: this.readFen(text.trim()),
        moves: [],
        tags: [],
        clocks: [],
      };
    }
    const tags = pgnTags(text);
    const fenTag = tags.find(tag => tag.name.toUpperCase() === 'FEN');
    const start = this.readFen(fenTag ? fenTag.value : INITIAL_FEN);
    const board = new Chessboard(this.chessUtilsService, start.state);
    const pgn = pgnMoves(text);
    const moves = pgn.map(move => this.playSan(board, move.san));
    const clocks = pgn.some(move => move.clock !== null)
      ? pgn.map(move => move.clock)
      : [];
    return { start, moves, tags, clocks };
  }

  private readFen(fen: string): FenPosition {
    try {
      return parseFen(fen);
    } catch {
      throw new GameImportError('analysis.import.invalid');
    }
  }

  /** Play the legal move written `san`, and return it in UCI notation. */
  private playSan(board: Chessboard, san: string): string {
    const wanted = normalizeSan(san);
    const color = board.getCurrentPlayerColor();
    for (const { oldPos, newPos } of this.rulesService.getAvailableMoves(
      board
    )) {
      const promotions = this.rulesService.isPawnPromotion(
        oldPos,
        newPos,
        board
      )
        ? PROMOTIONS.map(type => toPieceName(color, type))
        : [undefined];
      for (const piece of promotions) {
        const candidate = this.rulesService.getSanWithoutCheck(
          oldPos,
          newPos,
          board,
          piece
        );
        if (normalizeSan(candidate) === wanted) {
          this.rulesService.playMoveWithPromotion(oldPos, newPos, board, piece);
          return uciOf(oldPos, newPos, piece, this.chessUtilsService);
        }
      }
    }
    throw new GameImportError('analysis.import.invalid', san);
  }
}

/** Headers of a PGN ([Name "value"]), with \" and \\ unescaped. */
export function pgnTags(pgn: string): GameTag[] {
  const tags: GameTag[] = [];
  for (const match of pgn.matchAll(/\[\s*(\w+)\s+"((?:[^"\\]|\\.)*)"\s*\]/g)) {
    tags.push({ name: match[1], value: match[2].replace(/\\(["\\])/g, '$1') });
  }
  return tags;
}

/** Moves of a PGN: headers, comments, variations, numbers and results removed. */
export function sanTokens(pgn: string): string[] {
  return pgnMoves(pgn).map(move => move.san);
}

/** A move of a PGN, with the clock comment that follows it, if any. */
export interface PgnMove {
  san: string;
  /** Time left to the player after the move ([%clk 0:09:58]), in seconds. */
  clock: number | null;
}

/**
 * Moves of a PGN, with their clock: headers, comments, variations, numbers
 * and results removed.
 */
export function pgnMoves(pgn: string): PgnMove[] {
  let text = pgn
    // headers [Name "value"] ([%clk ...] in comments has no quoted value)
    .replace(/\[\s*\w+\s+"(?:[^"\\]|\\.)*"\s*\]/g, ' ')
    // comments: replaced by their clock, in tenths of a second (no dot, so
    // that it cannot be mistaken for a move number)
    .replace(/\{([^}]*)\}/g, (_, comment: string) => {
      const clock = /\[%clk\s+(\d+):(\d+):(\d+(?:\.\d+)?)\]/.exec(comment);
      if (!clock) {
        return ' ';
      }
      const seconds = +clock[1] * 3600 + +clock[2] * 60 + +clock[3];
      return ` CLK${Math.round(seconds * 10)} `;
    })
    .replace(/;[^\n]*/g, ' '); // end-of-line comments
  // variations, possibly nested: remove the innermost ones until none is left
  let previous;
  do {
    previous = text;
    text = text.replace(/\([^()]*\)/g, ' ');
  } while (text !== previous);
  const tokens = text
    .replace(/\$\d+/g, ' ') // numeric annotations
    .replace(/\d+\.(\.\.)?/g, ' ') // move numbers: '1.', '1...'
    .split(/\s+/)
    .filter(token => token && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token));

  const moves: PgnMove[] = [];
  for (const token of tokens) {
    const clock = /^CLK(\d+)$/.exec(token);
    if (clock) {
      if (moves.length) {
        moves[moves.length - 1].clock = +clock[1] / 10;
      }
    } else {
      moves.push({ san: token, clock: null });
    }
  }
  return moves;
}

/** SAN without check marks, annotations or '=' (so 'e8Q' matches 'e8=Q'). */
function normalizeSan(san: string): string {
  return san
    .replace(/0-0-0/g, 'O-O-O')
    .replace(/0-0/g, 'O-O')
    .replace(/e\.p\./g, '')
    .replace(/[+#!?=]/g, '');
}

function uciOf(
  from: Position,
  to: Position,
  piece: PieceName | undefined,
  utils: ChessUtilsService
): string {
  const promotion = piece
    ? (utils.getType(piece) as PromotionPieceType)
    : undefined;
  return toUci(from, to, promotion);
}
