import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { Position } from '../position';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss'],
})
export class ChessBoardComponent implements OnInit {
  isDragging: boolean = false;
  chessBoard: string[][] = [];

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
    } else if (row === 1) {
      return 'black-pawn';
    } else if (row === 6) {
      return 'white-pawn';
    } else if (row === 7) {
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
    }
    return ''; // for squares without any pieces
  }
  onDragStart(): void {
    this.isDragging = true;
  }

  onDragEnd(): void {
    this.isDragging = false;
  }

  onDrop(event: CdkDragDrop<any>): void {
    const oldPos: Position = event.item.data;
    const newPos: Position = event.container.data;
    // if(rulesService.isMoveValid())
    //move and eat piece
    this.chessBoard[newPos.row][newPos.col] =
      this.chessBoard[oldPos.row][oldPos.col];
    this.chessBoard[oldPos.row][oldPos.col] = '';
  }
}
