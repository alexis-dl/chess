/** Tactical idea, translated with the 'puzzles.theme.*' keys. */
export type PuzzleTheme =
  'backRank' | 'weakF7' | 'smothered' | 'promotion' | 'deflection' | 'philidor';

export interface Puzzle {
  id: string;
  theme: PuzzleTheme;
  /** Starting position; the side to move is the solver. */
  fen: string;
  /**
   * Solution in UCI notation ('e2e4', 'e7e8q'), solver and opponent moves
   * alternating, starting with the solver. On the last move, any other
   * checkmate is accepted too.
   */
  solution: string[];
}

/** Number of moves of the solver: the goal is mate in that many moves. */
export function mateIn(puzzle: Puzzle): number {
  return Math.ceil(puzzle.solution.length / 2);
}

/** Every solution is checked by puzzles.spec.ts (legal moves, unique key move, mate). */
export const PUZZLES: Puzzle[] = [
  {
    id: 'back-rank',
    theme: 'backRank',
    fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
    solution: ['a1a8'],
  },
  {
    id: 'scholar',
    theme: 'weakF7',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    solution: ['f3f7'],
  },
  {
    id: 'smothered',
    theme: 'smothered',
    fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1',
    solution: ['g5f7'],
  },
  {
    id: 'back-rank-black',
    theme: 'backRank',
    fen: '3r2k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1',
    solution: ['d8d1'],
  },
  {
    id: 'promotion',
    theme: 'promotion',
    fen: 'k7/2P5/1K6/8/8/8/8/8 w - - 0 1',
    solution: ['c7c8q'],
  },
  {
    id: 'deflection',
    theme: 'deflection',
    fen: 'r1b2k1r/ppp1bppp/8/1B1Q4/5q2/2P5/PPP2PPP/R3R1K1 w - - 1 1',
    solution: ['d5d8', 'e7d8', 'e1e8'],
  },
  {
    id: 'philidor',
    theme: 'philidor',
    fen: '5r1k/6pp/7N/3Q4/8/8/5PPP/6K1 w - - 0 1',
    solution: ['d5g8', 'f8g8', 'h6f7'],
  },
  {
    id: 'philidor-black',
    theme: 'philidor',
    fen: '6k1/5ppp/8/8/3q4/7n/6PP/5R1K b - - 0 1',
    solution: ['d4g1', 'f1g1', 'h3f2'],
  },
];
