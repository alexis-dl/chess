import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { Position } from '../position';
import { RulesService } from '../rules.service';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss'],
})
export class ChessBoardComponent implements OnInit {
  chessBoard: string[][] = [];
  highlightedSquares: Position[] = [];

  constructor(private rulesService: RulesService) {}

  ngOnInit(): void {
    this.initializeChessBoard();
  }

  private initializeChessBoard(): void {
    for (let i = 0; i < 8; i++) {
      this.chessBoard[i] = [];
      for (let j = 0; j < 8; j++) {
        // Initial chess pieces setup can be adjusted based on your needs
        this.chessBoard[i][j] = this.getInitialChessPiece(i, j);
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

  getSquareClass(x: number, y: number): { [key: string]: boolean } {
    const currentPosition: Position = new Position(x, y);
    return {
      'white-square': (x + y) % 2 === 0,
      'black-square': (x + y) % 2 !== 0,
      'highlight-square': this.highlightedSquares.some(square =>
        currentPosition.equals(square)
      ),
    };
  }

  highlightAllowedMoves(x: number, y: number) {
    const piecePos = new Position(x, y);
    const squaresToHighlight = this.rulesService.getMovesByPieceType(
      piecePos,
      this.chessBoard[piecePos.y][piecePos.x]
    );

    this.highlightedSquares = squaresToHighlight;
  }

  onDrop(event: CdkDragDrop<any>): void {
    const oldPos: Position = event.item.data;
    const newPos: Position = event.container.data;
    // if(rulesService.isMoveValid())
    if (
      this.rulesService
        .getMovesByPieceType(
          new Position(oldPos.x, oldPos.y),
          this.chessBoard[oldPos.y][oldPos.x]
        )
        .some(move => move.equals(newPos))
    ) {
      this.chessBoard[newPos.y][newPos.x] = this.chessBoard[oldPos.y][oldPos.x];
      this.chessBoard[oldPos.y][oldPos.x] = '';
    }
  }
}
