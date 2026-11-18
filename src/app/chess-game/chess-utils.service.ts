import { Injectable } from '@angular/core';
import { Chessboard } from './chessboard.model';
import {
  Color,
  PieceName,
  PieceType,
  Square,
  toPieceName,
} from './piece.model';

const BACK_RANK: PieceType[] = [
  'rook',
  'knight',
  'bishop',
  'queen',
  'king',
  'bishop',
  'knight',
  'rook',
];

@Injectable({
  providedIn: 'root',
})
export class ChessUtilsService {
  isPawn(square: Square): boolean {
    return this.getType(square) === 'pawn';
  }

  /** Type of the piece, or null for an empty square. */
  getType(piece: PieceName): PieceType;
  getType(square: Square): PieceType | null;
  getType(square: Square): PieceType | null {
    return square ? (square.split('-')[1] as PieceType) : null;
  }

  /** Color of the piece, or null for an empty square. */
  getColor(piece: PieceName): Color;
  getColor(square: Square): Color | null;
  getColor(square: Square): Color | null {
    return square ? (square.split('-')[0] as Color) : null;
  }

  isPieceMovableByColor(
    pieceColor: Color | null,
    chessBoard: Chessboard
  ): boolean {
    return pieceColor === chessBoard.getCurrentPlayerColor();
  }

  getInitialChessPiece(rowIndex: number, colIndex: number): Square {
    switch (rowIndex) {
      case 0:
        return toPieceName('white', BACK_RANK[colIndex]);
      case 1:
        return 'white-pawn';
      case 6:
        return 'black-pawn';
      case 7:
        return toPieceName('black', BACK_RANK[colIndex]);
      default:
        return '';
    }
  }

  getPieceImagePath(square: Square): string | null {
    return square ? `assets/chess-pieces/${square}.png` : null;
  }
}
