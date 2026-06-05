import { Injectable } from '@angular/core';
import { Chessboard } from './chessboard.model';

@Injectable({
  providedIn: 'root',
})
export class ChessUtilsService {
  constructor() {}

  isPawn(pieceName: string) {
    return pieceName.split('-')[1] === 'pawn';
  }

  getType(pieceName: string) {
    return pieceName.split('-')[1];
  }

  getColor(pieceName: string) {
    return pieceName.split('-')[0];
  }

  isPieceMovableByColor(pieceColor: string, chessBoard: Chessboard): boolean {
    const isWhiteTurn = chessBoard.getIsWhiteTurn();
    if (
      (pieceColor == 'white' && isWhiteTurn) ||
      (pieceColor == 'black' && !isWhiteTurn)
    ) {
      return true;
    } else {
      return false;
    }
  }

  // Return true if colors are white and black, false otherwise
  areColorsOpposite(color1: string, color2: string): boolean {
    return color1 !== '' && color2 !== '' && color1 !== color2;
  }
  // Return true if colors are differents (colors can be empty )
  areColorsDifferent(color1: string, color2: string): boolean {
    return color1 !== color2;
  }

  getOpponentColor(pieceColor: string): string {
    if (pieceColor == 'white') {
      return 'black';
    } else {
      return 'white';
    }
  }

  getInitialChessPiece(rowIndex: number, colIndex: number): string {
    //static board with the initial position of pieces
    const row = rowIndex;

    if (row === 0) {
      switch (colIndex) {
        case 0:
        case 7:
          return 'white-rook';
        case 1:
        case 6:
          return 'white-knight';
        case 2:
        case 5:
          return 'white-bishop';
        case 3:
          return 'white-queen';
        case 4:
          return 'white-king';
      }
    } else if (row === 1) {
      return 'white-pawn';
    } else if (row === 6) {
      return 'black-pawn';
    } else if (row === 7) {
      switch (colIndex) {
        case 0:
        case 7:
          return 'black-rook';
        case 1:
        case 6:
          return 'black-knight';
        case 2:
        case 5:
          return 'black-bishop';
        case 3:
          return 'black-queen';
        case 4:
          return 'black-king';
      }
    }
    return ''; // for squares without any pieces
  }

  getPieceImagePath(pieceType: string): string | null {
    if (pieceType === '') {
      return null;
    }
    return `assets/chess-pieces/${pieceType}.png`;
  }
}
