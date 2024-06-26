import { Component, Input } from '@angular/core';
import { ChessUtilsService } from '../chess-utils.service';
import { PromotionService } from './promotion.service';

@Component({
  selector: 'app-promotion',
  templateUrl: './promotion.component.html',
  styleUrls: ['./promotion.component.scss'],
})
export class PromotionComponent {
  @Input() pieceColor?: string;
  pieces = ['queen', 'rook', 'knight', 'bishop'];

  constructor(
    private chessUtilsService: ChessUtilsService,
    private promotionService: PromotionService
  ) {}

  onSelect(piece: string): void {
    this.promotionService.selectPiece(piece);
  }

  onCancel(): void {
    this.promotionService.cancelPromotion();
  }

  getPieceImagePath(piece: string): string | null {
    return this.chessUtilsService.getPieceImagePath(
      this.pieceColor + '-' + piece
    );
  }
}
