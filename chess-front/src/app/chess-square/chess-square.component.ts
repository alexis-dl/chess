import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chess-square',
  templateUrl: './chess-square.component.html',
  styleUrls: ['./chess-square.component.scss'],
})
export class ChessSquareComponent {
  @Input() isSquareWhite!: boolean;
  @Input() pieceType!: string;
}
