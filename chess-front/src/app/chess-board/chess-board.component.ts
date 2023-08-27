import { Component } from '@angular/core';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss'],
})
export class ChessBoardComponent {
  getPieceTypeBySquare(rowIndex: number, colIndex: number): string {
    //static board with the initial position of pieces
    const row = rowIndex;

    if (row === 1) {
      switch (colIndex) {
        case 1:
        case 8:
          return 'black-rook';
        case 2:
        case 7:
          return 'black-knight';
        case 3:
        case 6:
          return 'black-bishop';
        case 4:
          return 'black-queen';
        case 5:
          return 'black-king';
      }
    } else if (row === 2) {
      return 'black-pawn';
    } else if (row === 7) {
      return 'white-pawn';
    } else if (row === 8) {
      switch (colIndex) {
        case 1:
        case 8:
          return 'white-rook';
        case 2:
        case 7:
          return 'white-knight';
        case 3:
        case 6:
          return 'white-bishop';
        case 4:
          return 'white-queen';
        case 5:
          return 'white-king';
      }
    }

    return ''; // for squares without any pieces
  }
}
