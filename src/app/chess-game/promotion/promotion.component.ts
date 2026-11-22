import { Component, Input } from '@angular/core';
import { ChessUtilsService } from '../chess-utils.service';
import { Color, PromotionPieceType, toPieceName } from '../piece.model';
import { PromotionService } from './promotion.service';
import { TranslationKey } from 'src/app/i18n/translations';

@Component({
    selector: 'app-promotion',
    templateUrl: './promotion.component.html',
    styleUrls: ['./promotion.component.scss'],
    standalone: false
})
export class PromotionComponent {
  @Input() pieceColor: Color = 'white';
  /** Open towards the top (when promoting on the bottom edge of the board). */
  @Input() upward = false;
  pieces: PromotionPieceType[] = ['queen', 'rook', 'knight', 'bishop'];

  constructor(
    private chessUtilsService: ChessUtilsService,
    private promotionService: PromotionService
  ) {}

  onSelect(pieceType: PromotionPieceType): void {
    this.promotionService.selectPiece(toPieceName(this.pieceColor, pieceType));
  }

  /** Translation key of a piece name, for the button labels. */
  pieceNameKey(pieceType: PromotionPieceType): TranslationKey {
    return `piece.${pieceType}`;
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
