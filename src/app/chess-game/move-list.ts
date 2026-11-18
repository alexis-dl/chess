import { HistoryEntry } from './chessboard.model';

export interface MoveListItem {
  /** e.g. '1. e4', 'c5', or '1... Qg1+' when Black moves first. */
  label: string;
  /** Number of plies played once this move is on the board (1 for the first). */
  ply: number;
}

/** Numbered algebraic notation of a game history. */
export function formatMoveList(
  history: readonly HistoryEntry[],
  fullmoveNumber = 1
): MoveListItem[] {
  const whiteStarts = history[0]?.stateBefore.isWhiteTurn ?? true;
  let moveNumber = fullmoveNumber;
  return history.map((entry, i) => {
    const isWhiteMove = (i % 2 === 0) === whiteStarts;
    let label = entry.san;
    if (isWhiteMove) {
      label = `${moveNumber}. ${label}`;
    } else {
      if (i === 0) {
        label = `${moveNumber}... ${label}`;
      }
      moveNumber++;
    }
    return { label, ply: i + 1 };
  });
}
