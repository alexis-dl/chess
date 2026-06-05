import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Position } from '../position.model';

@Injectable({
  providedIn: 'root',
})
export class PromotionService {
  private promotionPositionSubject = new Subject<Position | null>();
  promotionPosition$ = this.promotionPositionSubject.asObservable();

  private promotionPieceSubject = new Subject<string | null>();
  promotionPiece$ = this.promotionPieceSubject.asObservable();

  constructor() {}

  showPromotionUI(pos: Position) {
    this.promotionPositionSubject.next(pos);
  }

  selectPiece(piece: string) {
    this.promotionPositionSubject.next(null);
    this.promotionPieceSubject.next(piece);
  }

  cancelPromotion() {
    this.promotionPositionSubject.next(null);
    this.promotionPieceSubject.next(null);
  }
}
