import { PromotionPieceType } from '../chess-game/piece.model';
import { Position } from '../chess-game/position.model';

const PROMOTION_LETTERS: Record<string, PromotionPieceType> = {
  q: 'queen',
  r: 'rook',
  b: 'bishop',
  n: 'knight',
};

export interface UciMove {
  from: Position;
  to: Position;
  promotion?: PromotionPieceType;
}

const toPosition = (square: string) =>
  new Position(square.charCodeAt(0) - 'a'.charCodeAt(0), +square[1] - 1);

/** 'e7e8q' -> { from: e7, to: e8, promotion: 'queen' } */
export function parseUci(uci: string): UciMove {
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci)) {
    throw new Error(`Invalid UCI move: ${uci}`);
  }
  return {
    from: toPosition(uci.slice(0, 2)),
    to: toPosition(uci.slice(2, 4)),
    promotion: uci[4] ? PROMOTION_LETTERS[uci[4]] : undefined,
  };
}

/** Inverse of parseUci. */
export function toUci(
  from: Position,
  to: Position,
  promotion?: PromotionPieceType
): string {
  const letter = promotion ? (promotion === 'knight' ? 'n' : promotion[0]) : '';
  return from.toAlgebraic() + to.toAlgebraic() + letter;
}
