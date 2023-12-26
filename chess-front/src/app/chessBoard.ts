import { Position } from './position';

export class ChessBoard {
  pieces: string[][] = [];
  highlightedSquares: Position[] = [];

  constructor() {
    this.initializeChessBoard();
  }

  getPiece(position: Position): string {
    return this.pieces[position.y][position.x];
  }

  setPiece(pieceName: string, position: Position) {
    this.pieces[position.y][position.x] = pieceName;
  }

  private initializeChessBoard(): void {
    for (let i = 0; i < 8; i++) {
      this.pieces[i] = [];
      for (let j = 0; j < 8; j++) {
        // Initial chess pieces setup can be adjusted based on your needs
        this.pieces[i][j] = this.getInitialChessPiece(i, j);
      }
    }
  }
  private getInitialChessPiece(rowIndex: number, colIndex: number): string {
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
}
