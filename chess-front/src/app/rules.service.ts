import { Injectable } from '@angular/core';
import { Position } from './position';

@Injectable({
  providedIn: 'root',
})
export class RulesService {
  constructor() {}

  getMovesByPieceType(piecePos: Position, chessPieceName: string): Position[] {
    const pieceColor = chessPieceName.split('-')[0];
    const pieceType = chessPieceName.split('-')[1];
    const moves: Position[] = [];

    switch (pieceType) {
      case 'king':
        const deltasKing = [-1, 0, 1];

        for (const deltaX of deltasKing) {
          for (const deltaY of deltasKing) {
            const newPosition = piecePos.addX(deltaX).addY(deltaY);
            if (
              !newPosition.equals(piecePos) &&
              newPosition.isInsideTheBoard()
            ) {
              moves.push(newPosition);
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
              let newPosition = piecePos
                .addX(deltaX * multiplier)
                .addY(deltaY * multiplier);

              while (newPosition.isInsideTheBoard()) {
                moves.push(newPosition);
                multiplier++;
                newPosition = piecePos
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
            let newPosition = piecePos
              .addX(deltaX * multiplier)
              .addY(deltaY * multiplier);

            while (newPosition.isInsideTheBoard()) {
              moves.push(newPosition);
              multiplier++;
              newPosition = piecePos
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
            let newPosition: Position;
            if (axis === 'X') {
              newPosition = piecePos.addX(delta * multiplier);
            } else {
              newPosition = piecePos.addY(delta * multiplier);
            }

            while (newPosition.isInsideTheBoard()) {
              moves.push(newPosition);
              multiplier++;
              if (axis === 'X') {
                newPosition = piecePos.addX(delta * multiplier);
              } else {
                newPosition = piecePos.addY(delta * multiplier);
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
          const newPosition = new Position(
            piecePos.x + delta.deltaX,
            piecePos.y + delta.deltaY
          );
          if (newPosition.isInsideTheBoard()) {
            moves.push(newPosition);
          }
        }
        break;
      case 'pawn':
        // Déterminer la direction du mouvement en fonction de la couleur du pion
        const direction = pieceColor === 'white' ? 1 : -1;

        // Mouvement simple en avant
        const forwardOne = piecePos.addY(direction);
        if (forwardOne.isInsideTheBoard()) {
          moves.push(forwardOne);

          // Mouvement double en avant (disponible uniquement au premier coup)
          const initialRow = pieceColor === 'white' ? 1 : 6;
          if (piecePos.y === initialRow) {
            const forwardTwo = forwardOne.addY(direction);
            if (forwardTwo.isInsideTheBoard()) {
              moves.push(forwardTwo);
            }
          }
        }

        // Attaque en diagonale à gauche
        const attackLeft = piecePos.addX(-1).addY(direction);
        if (attackLeft.isInsideTheBoard()) {
          moves.push(attackLeft);
        }

        // Attaque en diagonale à droite
        const attackRight = piecePos.addX(1).addY(direction);
        if (attackRight.isInsideTheBoard()) {
          moves.push(attackRight);
        }
        break;
    }
    console.log('Positions trouvées :', moves);
    return moves;
  }

  isMoveValid(oldPos: Position, newPos: Position) {}
}
