import { Component, Input } from '@angular/core';
import { ChessUtilsService } from '../chess-utils.service';
import { Square } from '../piece.model';

@Component({
  selector: 'app-chess-piece',
  templateUrl: './chess-piece.component.html',
  styleUrls: ['./chess-piece.component.scss'],
})
export class ChessPieceComponent {
  @Input() pieceType!: Square;
  constructor(private chessUtilsService: ChessUtilsService) {}

  getPieceImagePath(pieceType: Square): string | null {
    return this.chessUtilsService.getPieceImagePath(pieceType);
  }
}
