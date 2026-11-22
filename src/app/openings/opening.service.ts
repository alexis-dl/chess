import { Injectable } from '@angular/core';
import { ChessUtilsService } from '../chess-game/chess-utils.service';
import { BoardState, Chessboard } from '../chess-game/chessboard.model';
import { parseUci } from '../puzzles/puzzle-moves';
import { Opening, OPENINGS } from './openings';

/**
 * Identifies a position regardless of the move order that led to it: pieces,
 * side to move and castling rights. The en passant column is left out on
 * purpose, since it depends on the last move only (1.d4 Nf6 2.c4 and
 * 1.c4 Nf6 2.d4 must give the same key).
 */
export function openingPositionKey(state: BoardState): string {
  const rights = state.castlingRights;
  return [
    state.pieces.map(row => row.join(',')).join('/'),
    state.isWhiteTurn ? 'w' : 'b',
    [
      rights.whiteKingSide,
      rights.whiteQueenSide,
      rights.blackKingSide,
      rights.blackQueenSide,
    ]
      .map(right => (right ? 1 : 0))
      .join(''),
  ].join(' ');
}

/** Names the opening of a game from the positions it went through. */
@Injectable({
  providedIn: 'root',
})
export class OpeningService {
  private index?: Map<string, Opening>;

  constructor(private chessUtilsService: ChessUtilsService) {}

  /**
   * The opening of the most recent known position of the game, so that the
   * name stays once the players leave the known lines.
   * @returns null when no position of the game is a known opening.
   */
  identify(chessBoard: Chessboard): Opening | null {
    const index = this.getIndex();
    const history = chessBoard.getHistory();
    if (index.size === 0 || history.length === 0) {
      return null;
    }
    const states = [
      chessBoard.saveState(),
      ...history.map(entry => entry.stateBefore).reverse(),
    ];
    for (const state of states) {
      const opening = index.get(openingPositionKey(state));
      if (opening) {
        return opening;
      }
    }
    return null;
  }

  /** Position reached by an opening's line (moves are trusted, see the spec). */
  positionOf(opening: Opening): BoardState {
    const board = new Chessboard(this.chessUtilsService);
    for (const uci of opening.moves.split(' ')) {
      const { from, to } = parseUci(uci);
      board.movePiece(from, to);
      board.toggleIsWhiteTurn();
    }
    return board.saveState();
  }

  /** Built on first use; the first opening listed wins a shared position. */
  private getIndex(): Map<string, Opening> {
    if (!this.index) {
      this.index = new Map();
      for (const opening of OPENINGS) {
        const key = openingPositionKey(this.positionOf(opening));
        if (!this.index.has(key)) {
          this.index.set(key, opening);
        }
      }
    }
    return this.index;
  }
}
