import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Subject, take } from 'rxjs';
import { ChessUtilsService } from './chess-utils.service';
import { Chessboard } from './chessboard.model';
import { Move } from './move.model';
import { Position } from './position.model';
import { PromotionService } from './promotion/promotion.service';

@Injectable({
  providedIn: 'root',
})
export class RulesService {
  /** true for white's turn, false for black's */
  public nextPlayersTurn: Subject<boolean> = new Subject<boolean>();

  public currentPlayerCheckmated: Subject<void> = new Subject<void>();
  public currentPlayerStalemated: Subject<void> = new Subject<void>();

  constructor(
    private chessUtilsService: ChessUtilsService,
    private promotionService: PromotionService
  ) {}

  /**
   * Verify if move is playable according to the rules and play it.
   * Also updates every game linked indicators.
   * @returns boolean that indicates if the move could have been played.
   */
  playMove(
    oldPos: Position,
    newPos: Position,
    chessBoard: Chessboard
  ): boolean {
    const pieceColor = chessBoard.getPieceColorByPos(oldPos);
    if (
      this.chessUtilsService.isPieceMovableByColor(pieceColor, chessBoard) &&
      this.isMoveValid(oldPos, newPos, chessBoard)
    ) {
      if (this.isPawnPromotion(oldPos, newPos, chessBoard)) {
        this.triggerPromotionUI(oldPos, newPos, chessBoard);
        return true;
      } else {
        chessBoard.movePiece(oldPos, newPos);
        chessBoard.toggleIsWhiteTurn();
        this.computeGameEndEvents(chessBoard);
        return true;
      }
    }
    return false;
  }

  /**
   * Compute checkmates, stalemates and nextPlayerTurn.
   * TODO : complete with repetition rules (optional)
   */
  private computeGameEndEvents(chessBoard: Chessboard) {
    const currentPlayerColor = chessBoard.getCurrentPlayerColor();
    if (!this.hasPlayerAnyMove(chessBoard)) {
      if (this.isKingChecked(currentPlayerColor, chessBoard)) {
        this.currentPlayerCheckmated.next();
      } else {
        this.currentPlayerStalemated.next();
      }
    } else {
      //send nextPlayersTurn event when game is not over.
      this.nextPlayersTurn.next(chessBoard.getIsWhiteTurn());
    }
  }

  getAvailableMoves(chessBoard: Chessboard): Move[] {
    const currentPlayerColor = chessBoard.getCurrentPlayerColor();
    const currentPlayerPieces: string[][] =
      chessBoard.getPlayerPiecesByColor(currentPlayerColor);
    const allMoves: Move[] = [];

    currentPlayerPieces.forEach((row, y) => {
      row.forEach((_, x) => {
        const oldPos = new Position(x, y);
        const validMoves = this.getValidMovesByPiecePos(oldPos, chessBoard);
        validMoves.forEach(newPos => {
          const move: Move = {
            oldPos: oldPos,
            newPos: newPos,
          };
          allMoves.push(move);
        });
      });
    });

    return allMoves;
  }

  private hasPlayerAnyMove(chessBoard: Chessboard): boolean {
    const playerMoves = this.getAvailableMoves(chessBoard);
    return playerMoves.length > 0;
  }

  /**  Give a validation for a given move :
        - verify if it's white/black's turn.
        - verify if own king is checked after the move. */
  private isMoveValid(
    oldPos: Position,
    newPos: Position,
    chessBoard: Chessboard
  ): boolean {
    // check if movement leads to a check of player's own king.
    const pieceColor = chessBoard.getPieceColorByPos(oldPos);
    if (!this.chessUtilsService.isPieceMovableByColor(pieceColor, chessBoard)) {
      return false;
    }

    const cloneChessboard: Chessboard = cloneDeep(chessBoard);
    cloneChessboard.movePiece(oldPos, newPos);

    return (
      this.getMovesByPiecePos(
        new Position(oldPos.x, oldPos.y),
        chessBoard
      ).some(move => move.equals(newPos)) &&
      !this.isKingChecked(pieceColor, cloneChessboard)
    );
  }

  // get all valid moves for a given PiecePos, verifying that the own king is not checked after the move.
  getValidMovesByPiecePos(
    piecePos: Position,
    chessBoard: Chessboard
  ): Position[] {
    return this.getMovesByPiecePos(piecePos, chessBoard).filter(newPos =>
      this.isMoveValid(piecePos, newPos, chessBoard)
    );
  }

  /** Method that retrieve all available moves for a piece, regarding to its type.
   Does NOT verify if king is checked or if it's white/black's turn (KISS). **/
  private getMovesByPiecePos(
    piecePos: Position,
    chessBoard: Chessboard
  ): Position[] {
    const pieceColor = chessBoard.getPieceColorByPos(piecePos);
    const chessPieceName = chessBoard.getPieceByPos(piecePos);
    const pieceType = this.chessUtilsService.getType(chessPieceName);
    const moves: Position[] = [];

    switch (pieceType) {
      case 'king':
        const deltasKing = [-1, 0, 1];

        for (const deltaX of deltasKing) {
          for (const deltaY of deltasKing) {
            const newPos = piecePos.addX(deltaX).addY(deltaY);
            if (
              !newPos.equals(piecePos) &&
              newPos.isInsideTheBoard() &&
              this.chessUtilsService.areColorsDifferent(
                chessBoard.getPieceColorByPos(newPos),
                pieceColor
              )
            ) {
              moves.push(newPos);
            }
          }
        }
        break;
      case 'queen':
        const deltasQueen = [-1, 0, 1];

        for (const deltaX of deltasQueen) {
          for (const deltaY of deltasQueen) {
            // Exclude actual position of the queen
            if (deltaX !== 0 || deltaY !== 0) {
              let multiplier = 1;
              let newPos = piecePos
                .addX(deltaX * multiplier)
                .addY(deltaY * multiplier);

              while (newPos.isInsideTheBoard()) {
                const pieceAtNewPos = chessBoard.getPieceByPos(newPos);

                if (pieceAtNewPos) {
                  const pieceAtNewPosColor =
                    this.chessUtilsService.getColor(pieceAtNewPos);

                  if (
                    this.chessUtilsService.areColorsDifferent(
                      pieceAtNewPosColor,
                      pieceColor
                    )
                  ) {
                    moves.push(newPos);
                  }
                  // Stop the loop when a piece is encountered, regardless of color
                  break;
                }
                moves.push(newPos);
                multiplier++;
                newPos = piecePos
                  .addX(deltaX * multiplier)
                  .addY(deltaY * multiplier);
              }
            }
          }
        }
        break;
      case 'bishop':
        const deltasBishop = [-1, 1];
        for (const deltaX of deltasBishop) {
          for (const deltaY of deltasBishop) {
            let multiplier = 1;
            let newPos = piecePos
              .addX(deltaX * multiplier)
              .addY(deltaY * multiplier);

            while (newPos.isInsideTheBoard()) {
              const pieceAtNewPos = chessBoard.getPieceByPos(newPos);

              if (pieceAtNewPos) {
                const pieceAtNewPosColor =
                  this.chessUtilsService.getColor(pieceAtNewPos);

                if (
                  this.chessUtilsService.areColorsDifferent(
                    pieceAtNewPosColor,
                    pieceColor
                  )
                ) {
                  moves.push(newPos);
                }
                // Stop the loop when a piece is encountered, regardless of color
                break;
              }
              moves.push(newPos);
              multiplier++;
              newPos = piecePos
                .addX(deltaX * multiplier)
                .addY(deltaY * multiplier);
            }
          }
        }
        break;
      case 'rook':
        const deltas = [-1, 1];
        for (const delta of deltas) {
          for (const axis of ['X', 'Y']) {
            let multiplier = 1;
            let newPos: Position;
            if (axis === 'X') {
              newPos = piecePos.addX(delta * multiplier);
            } else {
              newPos = piecePos.addY(delta * multiplier);
            }

            while (newPos.isInsideTheBoard()) {
              const pieceAtNewPos = chessBoard.getPieceByPos(newPos);

              if (pieceAtNewPos) {
                const pieceAtNewPosColor =
                  this.chessUtilsService.getColor(pieceAtNewPos);

                if (
                  this.chessUtilsService.areColorsDifferent(
                    pieceAtNewPosColor,
                    pieceColor
                  )
                ) {
                  moves.push(newPos);
                }
                // Stop the loop when a piece is encountered, regardless of color
                break;
              }
              moves.push(newPos);
              multiplier++;
              if (axis === 'X') {
                newPos = piecePos.addX(delta * multiplier);
              } else {
                newPos = piecePos.addY(delta * multiplier);
              }
            }
          }
        }
        break;
      case 'knight':
        const knightDeltas = [
          { deltaX: 2, deltaY: 1 },
          { deltaX: 1, deltaY: 2 },
          { deltaX: -1, deltaY: 2 },
          { deltaX: -2, deltaY: 1 },
          { deltaX: -2, deltaY: -1 },
          { deltaX: -1, deltaY: -2 },
          { deltaX: 1, deltaY: -2 },
          { deltaX: 2, deltaY: -1 },
        ];

        for (const delta of knightDeltas) {
          const newPos = new Position(
            piecePos.x + delta.deltaX,
            piecePos.y + delta.deltaY
          );
          if (
            newPos.isInsideTheBoard() &&
            this.chessUtilsService.areColorsDifferent(
              chessBoard.getPieceColorByPos(newPos),
              pieceColor
            )
          ) {
            moves.push(newPos);
          }
        }
        break;
      case 'pawn':
        // Déterminer la direction du mouvement en fonction de la couleur du pion
        const direction = pieceColor === 'white' ? 1 : -1;

        // Mouvement simple en avant
        const forwardOne = piecePos.addY(direction);
        if (
          forwardOne.isInsideTheBoard() &&
          !chessBoard.getPieceByPos(forwardOne)
        ) {
          moves.push(forwardOne);

          // Mouvement double en avant (disponible uniquement au premier coup)
          const initialRow = pieceColor === 'white' ? 1 : 6;
          if (piecePos.y === initialRow) {
            const forwardTwo = forwardOne.addY(direction);
            if (
              forwardTwo.isInsideTheBoard() &&
              !chessBoard.getPieceByPos(forwardTwo)
            ) {
              moves.push(forwardTwo);
            }
          }
        }

        // Attaque en diagonale à gauche
        const attackLeft = piecePos.addX(-1).addY(direction);
        if (
          attackLeft.isInsideTheBoard() &&
          this.chessUtilsService.areColorsOpposite(
            this.chessUtilsService.getColor(
              chessBoard.getPieceByPos(attackLeft)
            ),
            pieceColor
          )
        ) {
          moves.push(attackLeft);
        }

        // Attaque en diagonale à droite
        const attackRight = piecePos.addX(1).addY(direction);
        if (
          attackRight.isInsideTheBoard() &&
          this.chessUtilsService.areColorsOpposite(
            this.chessUtilsService.getColor(
              chessBoard.getPieceByPos(attackRight)
            ),
            pieceColor
          )
        ) {
          moves.push(attackRight);
        }

        // Prise en passant
        const enPassantColIndex = chessBoard.getEnPassantColIndex();
        if (enPassantColIndex != -1) {
          const isWhitePawn = chessPieceName === 'white-pawn';
          const isBlackPawn = chessPieceName === 'black-pawn';
          if (
            ((isWhitePawn && piecePos.y === 4) ||
              (isBlackPawn && piecePos.y === 3)) &&
            Math.abs(piecePos.x - enPassantColIndex) === 1
          ) {
            const targetRow = isWhitePawn ? 5 : 2;
            moves.push(new Position(enPassantColIndex, targetRow));
          }
        }
        break;
    }
    return moves;
  }

  /** Check if the king of the given color is in check on the given chessboard. */
  private isKingChecked(pieceColor: string, chessBoard: Chessboard): boolean {
    const kingPos = chessBoard.findPiecePosition(pieceColor + '-king');

    if (kingPos) {
      // Iterate over all opponent's pieces and check if any can attack the king
      for (let x = 0; x < Chessboard.BOARD_SIZE; x++) {
        for (let y = 0; y < Chessboard.BOARD_SIZE; y++) {
          const attackingPiecePos = new Position(x, y);
          const piece = chessBoard.getPieceByPos(attackingPiecePos);
          if (
            piece &&
            piece.startsWith(
              this.chessUtilsService.getOpponentColor(pieceColor)
            )
          ) {
            const availableMoves: Position[] = this.getMovesByPiecePos(
              attackingPiecePos,
              chessBoard
            );
            if (availableMoves.some(move => move.equals(kingPos))) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Checks if the pawn reaches the promotion row.
   */
  private isPawnPromotion(
    oldPos: Position,
    newPos: Position,
    chessBoard: Chessboard
  ): boolean {
    const isPawn = chessBoard.getPieceTypeByPos(oldPos) === 'pawn';
    const pieceColor = chessBoard.getPieceColorByPos(oldPos);
    const isLastRow =
      (pieceColor === 'white' && newPos.y === 7) ||
      (pieceColor === 'black' && newPos.y === 0);
    return isPawn && isLastRow;
  }

  private triggerPromotionUI(
    oldPos: Position,
    newPos: Position,
    chessBoard: Chessboard
  ): void {
    this.promotionService.showPromotionUI(newPos);
    this.promotionService.promotionPiece$.pipe(take(1)).subscribe(pieceType => {
      if (pieceType) {
        chessBoard.movePiece(oldPos, newPos);
        chessBoard.setPieceByPos(pieceType, newPos);
        chessBoard.toggleIsWhiteTurn();
        this.computeGameEndEvents(chessBoard);
      }
    });
  }
}
