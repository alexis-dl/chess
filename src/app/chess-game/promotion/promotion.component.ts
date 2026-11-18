import { Component, Input } from '@angular/core';
import { ChessUtilsService } from '../chess-utils.service';
import { Color, PromotionPieceType, toPieceName } from '../piece.model';
import { PromotionService } from './promotion.service';

@Component({
  selector: 'app-promotion',
  templateUrl: './promotion.component.html',
  styleUrls: ['./promotion.component.scss'],
})
export class PromotionComponent {
  @Input() pieceColor: Color = 'white';
  pieces: PromotionPieceType[] = ['queen', 'rook', 'knight', 'bishop'];

  constructor(
    private chessUtilsService: ChessUtilsService,
    private promotionService: PromotionService
  ) {}

  onSelect(pieceType: PromotionPieceType): void {
    this.promotionService.selectPiece(toPieceName(this.pieceColor, pieceType));
  }

  onCancel(): void {
    this.promotionService.cancelPromotion();
  }

  getPieceImagePath(pieceType: PromotionPieceType): string | null {
    return this.chessUtilsService.getPieceImagePath(
      toPieceName(this.pieceColor, pieceType)
    );
  }
}
