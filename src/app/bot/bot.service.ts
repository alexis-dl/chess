import { Injectable } from '@angular/core';
import { Chessboard } from '../chess-game/chessboard.model';
import { Move } from '../chess-game/move.model';
import { PromotionService } from '../chess-game/promotion/promotion.service';
import { RulesService } from '../chess-game/rules.service';
import { PlayerType } from '../player/player-type.enum';

@Injectable({
  providedIn: 'root',
})
export class BotService {
  constructor(
    private rulesService: RulesService,
    private promotionService: PromotionService
  ) {}

  /**
   * Make the bot play on the given chessboard, according to the botType.
   * @returns boolean that indicates if the move could have been played.
   */
  play(chessBoard: Chessboard, botType: PlayerType) {
    const move: Move = this.generateBotMove(chessBoard, botType);

    this.rulesService.playMove(move.oldPos, move.newPos, chessBoard);
    if (
      this.rulesService.isPawnPromotion(move.oldPos, move.newPos, chessBoard)
    ) {
      this.promotionService.selectPiece(
        chessBoard.getCurrentPlayerColor() + '-queen'
      );
    }
  }

  generateBotMove(chessBoard: Chessboard, botType: PlayerType): Move {
    switch (botType) {
      case PlayerType.Random:
        return this.generateRandomMove(chessBoard);

      default:
        throw new Error('Unsupported bot type');
    }
  }

  generateRandomMove(chessBoard: Chessboard): Move {
    const availableMoves = this.rulesService.getAvailableMoves(chessBoard);

    if (availableMoves.length === 0) {
      throw new Error('Not any move available');
    }

    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }
}
