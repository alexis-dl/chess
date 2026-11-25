import type { EngineLine } from './batch-engine';

/**
 * Puzzles found in the player's own games:
 * - missed: the opponent gave a chance (a winning tactic, a mate...) and the
 *   player played something else;
 * - blunder: the player had a decent position and threw it away.
 */
export type GamePuzzleKind = 'missed' | 'blunder';

/** Loss of winning chances that makes a move a blunder (Lichess's threshold). */
export const BLUNDER_DROP = 0.3;
/** Winning chances from which a position is won (about +3). */
export const WINNING = 0.5;
/** Below this, the position was already lost: no "blunder" puzzle. */
export const ALREADY_LOST = -0.3;
/** How much better the best move must be than the second one. */
export const ONLY_MOVE_GAP = 0.25;

/**
 * Winning chances of the side to move, from -1 (lost) to 1 (won), as
 * Lichess computes them: they stop changing much once a side is clearly
 * winning, unlike centipawns.
 */
export function winChances(line: Pick<EngineLine, 'cp' | 'mate'>): number {
  if (line.mate !== null) {
    return line.mate > 0 ? 1 : -1; // mate 0: the side to move is mated
  }
  const cp = Math.max(-1000, Math.min(1000, line.cp ?? 0));
  return 2 / (1 + Math.exp(-0.00368208 * cp)) - 1;
}

/**
 * Whether the move played in a position makes a puzzle. All values are the
 * player's winning chances:
 * @param previous before the opponent's last move (null on the first move)
 * @param best in the position, with best play
 * @param after after the move actually played
 */
export function classifyMove(
  previous: number | null,
  best: number,
  after: number
): GamePuzzleKind | null {
  if (best - after < BLUNDER_DROP) {
    return null; // the move played was good enough
  }
  // the opponent just gave the chance: there is something to find
  if (best >= WINNING && (previous === null || best - previous >= BLUNDER_DROP)) {
    return 'missed';
  }
  return best >= ALREADY_LOST ? 'blunder' : null;
}

/**
 * Whether the best line is the only good move, which a puzzle needs (a
 * position with several good moves would reject correct answers). A mate
 * in one is always fine: any mate is accepted on the last move.
 */
export function isOnlyMove(lines: EngineLine[]): boolean {
  const [best, second] = lines;
  if (!best?.pv.length) {
    return false;
  }
  if (best.mate === 1) {
    return true;
  }
  if (!second) {
    return false; // a single legal move: forced, nothing to find
  }
  if (best.mate !== null && best.mate > 0) {
    return !(second.mate !== null && second.mate > 0);
  }
  return winChances(best) - winChances(second) >= ONLY_MOVE_GAP;
}
