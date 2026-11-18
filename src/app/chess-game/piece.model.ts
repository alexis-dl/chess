export type Color = 'white' | 'black';

export type PieceType =
  'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';

/** Pieces a pawn can be promoted to. */
export type PromotionPieceType = Exclude<PieceType, 'pawn' | 'king'>;

/** A piece, e.g. 'white-pawn'. Also used as the image file name. */
export type PieceName = `${Color}-${PieceType}`;

/** Content of a board square: a piece, or '' when the square is empty. */
export type Square = PieceName | '';

export function toPieceName(color: Color, type: PieceType): PieceName {
  return `${color}-${type}`;
}

export function getOpponentColor(color: Color): Color {
  return color === 'white' ? 'black' : 'white';
}
