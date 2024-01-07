import { Injectable } from '@angular/core';
import { ChessUtilsService } from '../chess-game/chess-utils.service';
import { Chessboard } from '../chess-game/chessboard.model';
import { Move } from '../chess-game/move.model';
import { RulesService } from '../chess-game/rules.service';
import { PlayerType } from '../player/player-type.enum';

@Injectable({
  providedIn: 'root',
})
export class BotService {
  constructor(
    private rulesService: RulesService,
    private chessUtilsService: ChessUtilsService
  ) {}

  /**
   * Make the bot play on the given chessboard, according to the botType.
   * @returns boolean that indicates if the move could have been played.
   */
  play(chessBoard: Chessboard, botType: PlayerType): boolean {
    const move: Move = this.generateBotMove(chessBoard, botType);

    return this.rulesService.playMove(move.oldPos, move.newPos, chessBoard);
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
