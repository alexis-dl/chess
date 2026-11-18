import { Injectable } from '@angular/core';
import { ChessUtilsService } from '../chess-game/chess-utils.service';
import { Chessboard } from '../chess-game/chessboard.model';
import { Move } from '../chess-game/move.model';
import { PieceType, toPieceName } from '../chess-game/piece.model';
import { PromotionService } from '../chess-game/promotion/promotion.service';
import { RulesService } from '../chess-game/rules.service';
import { PlayerType } from '../player/player-type.enum';

/** Search depth of the minimax bot, in plies. */
export const MINIMAX_DEPTH = 4;

const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 0,
};

/** Bonus per centrality level (0 on the edge, 3 in the 4 central squares). */
const CENTRALITY_BONUS: Record<PieceType, number> = {
  pawn: 5,
  knight: 10,
  bishop: 5,
  rook: 0,
  queen: 2,
  king: 0,
};

/** Bonus per row a pawn has advanced. */
const PAWN_ADVANCE_BONUS = 5;

/** Above any material score; reduced by the ply so that faster mates win. */
const MATE_SCORE = 100000;

@Injectable({
  providedIn: 'root',
})
export class BotService {
  constructor(
    private rulesService: RulesService,
    private promotionService: PromotionService,
    private chessUtilsService: ChessUtilsService
  ) {}

  /**
   * Make the bot play on the given chessboard, according to the botType.
   * Pawns are always promoted to a queen.
   */
  play(chessBoard: Chessboard, botType: PlayerType) {
    const move: Move = this.generateBotMove(chessBoard, botType);
    const isPromotion = this.rulesService.isPawnPromotion(
      move.oldPos,
      move.newPos,
      chessBoard
    );
    const color = chessBoard.getCurrentPlayerColor();

    this.rulesService.playMove(move.oldPos, move.newPos, chessBoard);
    if (isPromotion) {
      this.promotionService.selectPiece(toPieceName(color, 'queen'));
    }
  }

  generateBotMove(chessBoard: Chessboard, botType: PlayerType): Move {
    switch (botType) {
      case PlayerType.Random:
        return this.generateRandomMove(chessBoard);
      case PlayerType.Minimax:
        return this.generateMinimaxMove(chessBoard);
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

  /**
   * Best move found by a negamax search with alpha-beta pruning.
   * Among equally good moves, one is picked at random.
   */
  generateMinimaxMove(chessBoard: Chessboard, depth = MINIMAX_DEPTH): Move {
    const moves = this.orderMoves(
      chessBoard,
      this.rulesService.getAvailableMoves(chessBoard)
    );
    if (moves.length === 0) {
      throw new Error('Not any move available');
    }

    let bestScore = -Infinity;
    let bestMoves: Move[] = [];
    for (const move of moves) {
      // window starting just below the best score: equal scores are exact,
      // so ties can be detected
      const score = -this.negamax(
        this.simulateMove(chessBoard, move),
        depth - 1,
        -Infinity,
        -(bestScore - 1),
        1
      );
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    }
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }

  /** Score of the position for the player to move (fail-hard alpha-beta). */
  private negamax(
    chessBoard: Chessboard,
    depth: number,
    alpha: number,
    beta: number,
    ply: number
  ): number {
    if (depth === 0) {
      return this.evaluate(chessBoard);
    }
    const moves = this.rulesService.getAvailableMoves(chessBoard);
    if (moves.length === 0) {
      return this.rulesService.isInCheck(chessBoard) ? -MATE_SCORE + ply : 0;
    }
    for (const move of this.orderMoves(chessBoard, moves)) {
      const score = -this.negamax(
        this.simulateMove(chessBoard, move),
        depth - 1,
        -beta,
        -alpha,
        ply + 1
      );
      if (score >= beta) {
        return beta;
      }
      if (score > alpha) {
        alpha = score;
      }
    }
    return alpha;
  }

  /**
   * Static evaluation for the player to move: material, centralization of
   * minor pieces and pawn advancement.
   */
  evaluate(chessBoard: Chessboard): number {
    let whiteScore = 0;
    for (let y = 0; y < Chessboard.BOARD_SIZE; y++) {
      for (let x = 0; x < Chessboard.BOARD_SIZE; x++) {
        const piece = chessBoard.getPiece(x, y);
        if (!piece) {
          continue;
        }
        const type = this.chessUtilsService.getType(piece);
        const isWhite = this.chessUtilsService.getColor(piece) === 'white';
        const centrality =
          3 - Math.floor(Math.max(Math.abs(x - 3.5), Math.abs(y - 3.5)));
        let value = PIECE_VALUES[type] + CENTRALITY_BONUS[type] * centrality;
        if (type === 'pawn') {
          value += PAWN_ADVANCE_BONUS * (isWhite ? y - 1 : 6 - y);
        }
        whiteScore += isWhite ? value : -value;
      }
    }
    return chessBoard.getIsWhiteTurn() ? whiteScore : -whiteScore;
  }

  /** Play the move on a copy of the board (promotion to queen). */
  private simulateMove(chessBoard: Chessboard, move: Move): Chessboard {
    const copy = chessBoard.clone();
    const isPromotion = this.rulesService.isPawnPromotion(
      move.oldPos,
      move.newPos,
      chessBoard
    );
    copy.movePiece(move.oldPos, move.newPos);
    if (isPromotion) {
      copy.setPieceByPos(
        toPieceName(chessBoard.getCurrentPlayerColor(), 'queen'),
        move.newPos
      );
    }
    copy.toggleIsWhiteTurn();
    return copy;
  }

  /**
   * Try the most promising moves first to prune more: promotions, then
   * captures of valuable pieces by cheap ones.
   */
  private orderMoves(chessBoard: Chessboard, moves: Move[]): Move[] {
    const priority = (move: Move): number => {
      const attacker = chessBoard.getPieceTypeByPos(move.oldPos);
      const victim = chessBoard.getPieceTypeByPos(move.newPos);
      let score = 0;
      if (victim) {
        score +=
          10 * PIECE_VALUES[victim] - (attacker ? PIECE_VALUES[attacker] : 0);
      }
      if (
        this.rulesService.isPawnPromotion(move.oldPos, move.newPos, chessBoard)
      ) {
        score += 10 * PIECE_VALUES.queen;
      }
      return score;
    };
    return moves
      .map(move => ({ move, score: priority(move) }))
      .sort((a, b) => b.score - a.score)
      .map(({ move }) => move);
  }
}
