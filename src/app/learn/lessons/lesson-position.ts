import { ChessUtilsService } from '../../chess-game/chess-utils.service';
import { Chessboard } from '../../chess-game/chessboard.model';
import { FenPosition, parseFen } from '../../chess-game/fen';
import { parseUci } from '../../puzzles/puzzle-moves';
import { LessonStep } from './lesson.model';

/** Stateless: shared by every call. */
const utils = new ChessUtilsService();

/**
 * Position at the start of a step: its FEN, or the position reached by its
 * `start` moves from the initial position. The moves are trusted here; their
 * legality is checked by lessons.spec.ts.
 */
export function stepStartPosition(step: LessonStep): FenPosition {
  if (step.fen) {
    return parseFen(step.fen);
  }
  const board = new Chessboard(utils);
  const moves = step.start ? step.start.split(' ') : [];
  for (const uci of moves) {
    const { from, to } = parseUci(uci);
    board.movePiece(from, to);
    board.toggleIsWhiteTurn();
  }
  return {
    state: board.saveState(),
    fullmoveNumber: 1 + Math.floor(moves.length / 2),
  };
}
