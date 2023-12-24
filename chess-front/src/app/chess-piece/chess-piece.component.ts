import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chess-piece',
  templateUrl: './chess-piece.component.html',
  styleUrls: ['./chess-piece.component.scss'],
})
export class ChessPieceComponent {
  @Input() pieceType!: string;

  getPieceImagePath(pieceType: string): string | null {
    if (pieceType === '') {
      return null;
    }
    return `assets/chess-pieces/${pieceType}.png`;
  }
}
