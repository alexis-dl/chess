import { Component, Input } from '@angular/core';
import { ChessUtilsService } from '../chess-utils.service';

@Component({
  selector: 'app-chess-piece',
  templateUrl: './chess-piece.component.html',
  styleUrls: ['./chess-piece.component.scss'],
})
export class ChessPieceComponent {
  @Input() pieceType!: string;
  constructor(private chessUtilsService: ChessUtilsService) {}

  getPieceImagePath(pieceType: string): string | null {
    return this.chessUtilsService.getPieceImagePath(pieceType);
  }
}
