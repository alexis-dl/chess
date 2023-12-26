import { ChessUtilsService } from './chess-utils.service';
import { Position } from './position';

export class Chessboard {
  static readonly BOARD_SIZE = 8;
  pieces: string[][] = [];
  highlightedSquares: Position[] = [];

  constructor(private chessUtilsService: ChessUtilsService) {
    this.initializeChessBoard();
  }

  getPiece(position: Position): string {
    return this.pieces[position.y][position.x];
  }

  setPiece(pieceName: string, position: Position) {
    this.pieces[position.y][position.x] = pieceName;
  }

  findPiecePosition(pieceName: string): Position | null {
    for (let row = 0; row < this.pieces.length; row++) {
      const col = this.pieces[row].findIndex(value => value === pieceName);
      if (col !== -1) {
        return new Position(col, row);
      }
    }
    return null; // Element not found, but shouldn't happen
  }

  private initializeChessBoard(): void {
    for (let i = 0; i < 8; i++) {
      this.pieces[i] = [];
      for (let j = 0; j < 8; j++) {
        // Initial chess pieces setup can be adjusted based on your needs
        this.pieces[i][j] = this.chessUtilsService.getInitialChessPiece(i, j);
      }
    }
  }
}
