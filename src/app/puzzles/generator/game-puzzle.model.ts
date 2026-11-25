import type { GamePlatform, GameSpeed } from './game-sources';
import type { GamePuzzleKind } from './puzzle-finder';

/**
 * What the solver must achieve: deliver mate, win (a decisive advantage),
 * or find the move that keeps the game going (instead of the blunder).
 */
export type GamePuzzleGoal = 'mate' | 'advantage' | 'defend';

/** A puzzle made from a position of one of the player's games. */
export interface GamePuzzle {
  /** platform-gameId-ply */
  id: string;
  kind: GamePuzzleKind;
  goal: GamePuzzleGoal;
  /** Starting position; the side to move is the solver (the player). */
  fen: string;
  /**
   * Solution in UCI notation, solver and opponent moves alternating, starting
   * with the solver (same rules as Puzzle.solution).
   */
  solution: string[];
  /** Move played in the game instead, in SAN (e.g. 'Qxd4?'). */
  played: string;
  /** Move number and side, as written in the game: '23.' or '23...'. */
  moveNumber: string;
  game: {
    platform: GamePlatform;
    url: string;
    /** The player's opponent. */
    opponent: string;
    speed: GameSpeed;
    /** ms since 1970 */
    date: number;
  };
}

/** Builds the id of a puzzle, also used to recognise an analysed game. */
export function gameKey(platform: GamePlatform, gameId: string): string {
  return `${platform}-${gameId}`;
}
