import { Injectable } from '@angular/core';
import { Position } from './position.model';
import { Chessboard } from './chessboard.model';
import { ChessUtilsService } from './chess-utils.service';
import { cloneDeep } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class RulesService {
  constructor(private chessUtilsService: ChessUtilsService) {}

  hasCurrentPlayerAnyMove(chessBoard: Chessboard): boolean {
    const currentPlayerPieces: string[][] = chessBoard.getCurrentPlayerPieces();

    return currentPlayerPieces.some((row, y) =>
      row.some(
        (_, x) =>
          this.getValidMovesByPiecePos(new Position(x, y), chessBoard)
            .length !== 0
      )
    );
  }

  /**
   * Move the piece from Position A to Position B without verification of validity.
   * @returns the eaten piece if there is one.
   */
  movePiece(
    oldPos: Position,
    newPos: Position,
    chessBoard: Chessboard
  ): string {
    const movingPiece = chessBoard.getPieceByPos(oldPos);
    let eatenPiece = chessBoard.getPieceByPos(newPos);
    const isPieceAPawn = this.chessUtilsService.isPawn(movingPiece);

    // move and eat piece
    chessBoard.setPieceByPos('', oldPos);
    chessBoard.setPieceByPos(movingPiece, newPos);

    // if move is en passant, eat piece in diagonal
    const isWhitePawn = movingPiece === 'white-pawn';
    const isBlackPawn = movingPiece === 'black-pawn';
    if (
      ((isWhitePawn && oldPos.y === 4) || (isBlackPawn && oldPos.y === 3)) &&
      newPos.x === chessBoard.getEnPassantColIndex()
    ) {
      const eatenPawnPos = new Position(
        chessBoard.getEnPassantColIndex(),
        oldPos.y
      );
      eatenPiece = chessBoard.getPieceByPos(eatenPawnPos);
      chessBoard.setPieceByPos('', eatenPawnPos);
    }

    // register column for possible en passant
    if (isPieceAPawn && Math.abs(oldPos.y - newPos.y) === 2) {
      chessBoard.setEnPassantColIndex(oldPos.x);
    } else {
      chessBoard.setEnPassantColIndex(-1); // reseting en passant possibility
    }

    // toggle turn
    chessBoard.toggleIsWhiteTurn();

    return eatenPiece;
  }

  /**  Give a validation for a given move :
        - verify if it's white/black's turn.
        - verify if own king is checked after the move. */
  isMoveValid(
    oldPos: Position,
    newPos: Position,
    chessBoard: Chessboard
  ): boolean {
    const pieceColor = this.chessUtilsService.getColor(
      chessBoard.getPieceByPos(oldPos)
    );

    if (
      !this.chessUtilsService.isPieceMovableByColor(
        pieceColor,
        chessBoard.getIsWhiteTurn()
      )
    ) {
      return false;
    }

    const cloneChessboard: Chessboard = cloneDeep(chessBoard);
    this.movePiece(oldPos, newPos, cloneChessboard);

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
    return this.getMovesByPiecePos(piecePos, chessBoard).filter(getMove =>
      this.isMoveValid(piecePos, getMove, chessBoard)
    );
  }

  /** Method that retrieve all available moves for a piece, regarding to its type.
   Does NOT verify if king is checked or if it's white/black's turn (KISS). **/
  getMovesByPiecePos(piecePos: Position, chessBoard: Chessboard): Position[] {
    const chessPieceName = chessBoard.getPieceByPos(piecePos);
    const pieceColor = this.chessUtilsService.getColor(chessPieceName);
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
                this.chessUtilsService.getColor(
                  chessBoard.getPieceByPos(newPos)
                ),
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
              this.chessUtilsService.getColor(chessBoard.getPieceByPos(newPos)),
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

  // check if the king of the given color is in check on the given chessboard.
  // TODO : remove pieceColor and retrieve current player color (isCurrentPlayerKingChecked)
  isKingChecked(pieceColor: string, chessBoard: Chessboard): boolean {
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
}
