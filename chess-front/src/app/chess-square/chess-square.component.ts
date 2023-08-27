import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chess-square',
  templateUrl: './chess-square.component.html',
  styleUrls: ['./chess-square.component.scss'],
})
export class ChessSquareComponent {
<<<<<<< HEAD
  @Input() isSquareWhite!: boolean;
=======
  @Input() isWhite!: boolean;
>>>>>>> c77e5f1fd9297f2e0ffa2bea7ee7b5d2d13c4ec7
  @Input() pieceType!: string;
}
