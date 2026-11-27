import { Localized } from '../i18n/localized';

/** Theme of a puzzle, translated with the 'puzzles.theme.*' keys. */
export type PuzzleTheme =
  | 'backRank'
  | 'weakF7'
  | 'smothered'
  | 'promotion'
  | 'deflection'
  | 'philidor'
  | 'french'
  | 'queensGambit';

/** Themes are shown in two groups: tactical ideas, and openings. */
export type PuzzleCategory = 'tactics' | 'openings';

export interface PuzzleThemeInfo {
  id: PuzzleTheme;
  category: PuzzleCategory;
  /** Material icon of its card. */
  icon: string;
}

/** The themes, in the order of the Puzzle themes page. */
export const PUZZLE_THEMES: PuzzleThemeInfo[] = [
  { id: 'backRank', category: 'tactics', icon: 'border_bottom' },
  { id: 'weakF7', category: 'tactics', icon: 'gps_fixed' },
  { id: 'smothered', category: 'tactics', icon: 'grid_view' },
  { id: 'promotion', category: 'tactics', icon: 'upgrade' },
  { id: 'deflection', category: 'tactics', icon: 'call_split' },
  { id: 'philidor', category: 'tactics', icon: 'auto_awesome' },
  { id: 'french', category: 'openings', icon: 'menu_book' },
  { id: 'queensGambit', category: 'openings', icon: 'menu_book' },
];

export interface Puzzle {
  id: string;
  theme: PuzzleTheme;
  /** Deliver mate (the default), or win a decisive advantage. */
  goal?: 'mate' | 'advantage';
  /** Name of the idea or trap, shown in the list instead of the theme. */
  name?: Localized;
  /** How the position arose (opening puzzles), shown with the puzzle. */
  intro?: Localized;
  /**
   * Opening puzzles: the moves leading to `fen` from the initial position
   * (UCI, separated by spaces). The puzzle starts from the initial position:
   * the solver plays its moves of this line (another good move is pointed
   * out, then taken back), the opponent's are played for it.
   */
  start?: string;
  /** Starting position; the side to move is the solver. */
  fen: string;
  /**
   * Solution in UCI notation ('e2e4', 'e7e8q'), solver and opponent moves
   * alternating, starting with the solver. On the last move, any other
   * checkmate is accepted too.
   */
  solution: string[];
}

/** Number of moves of the solver (for a mate: mate in that many moves). */
export function mateIn(puzzle: Puzzle): number {
  return Math.ceil(puzzle.solution.length / 2);
}

/**
 * Mates are checked by puzzles.spec.ts (legal moves, unique key move, mate);
 * the opening puzzles, which win material, with Stockfish (see below).
 */
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

  // ----- openings: checked with Stockfish 18 at depth 20 (each move of the
  // solver is the only good one, and the final position is won) -----
  {
    id: 'french-greek-gift',
    theme: 'french',
    goal: 'advantage',
    name: { en: 'Greek gift', fr: 'Sacrifice grec' },
    intro: {
      en: 'French Defense, Steinitz Variation: 1.e4 e6 2.d4 d5 3.Nc3 Nf6 4.Bg5 Be7 5.e5 Nfd7 6.Bxe7 Qxe7 7.f4 O-O 8.Nf3 c5 9.Bd3 Nc6. Black has castled with no knight on f6 to guard h7.',
      fr: 'Défense française, variante Steinitz : 1.e4 e6 2.d4 d5 3.Cc3 Cf6 4.Fg5 Fe7 5.e5 Cfd7 6.Fxe7 Dxe7 7.f4 0-0 8.Cf3 c5 9.Fd3 Cc6. Les Noirs ont roqué sans cavalier en f6 pour garder h7.',
    },
    start:
      'e2e4 e7e6 d2d4 d7d5 b1c3 g8f6 c1g5 f8e7 e4e5 f6d7 g5e7 d8e7 f2f4 e8g8 g1f3 c7c5 f1d3 b8c6',
    fen: 'r1b2rk1/pp1nqppp/2n1p3/2ppP3/3P1P2/2NB1N2/PPP3PP/R2QK2R w KQ - 2 10',
    solution: ['d3h7'],
  },
  {
    id: 'french-advance-bb5',
    theme: 'french',
    goal: 'advantage',
    name: { en: 'The d4 pawn is poisoned', fr: 'Le pion d4 est empoisonné' },
    intro: {
      en: 'French Defense, Advance Variation: 1.e4 e6 2.d4 d5 3.e5 c5 4.c3 Nc6 5.Nf3 Qb6 6.Bd3 cxd4 7.cxd4 Nxd4. Black has just grabbed a pawn: the queen and the knight both aim at d4.',
      fr: 'Défense française, variante d’avance : 1.e4 e6 2.d4 d5 3.e5 c5 4.c3 Cc6 5.Cf3 Db6 6.Fd3 cxd4 7.cxd4 Cxd4. Les Noirs viennent de prendre un pion : la dame et le cavalier visent d4.',
    },
    start:
      'e2e4 e7e6 d2d4 d7d5 e4e5 c7c5 c2c3 b8c6 g1f3 d8b6 f1d3 c5d4 c3d4 c6d4',
    fen: 'r1b1kbnr/pp3ppp/1q2p3/3pP3/3n4/3B1N2/PP3PPP/RNBQK2R w KQkq - 0 8',
    solution: ['f3d4', 'b6d4', 'd3b5'],
  },
  {
    id: 'qgd-elephant-trap',
    theme: 'queensGambit',
    goal: 'advantage',
    name: { en: 'Elephant Trap', fr: 'Piège de l’éléphant' },
    intro: {
      en: 'Queen’s Gambit Declined: 1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Nbd7 5.cxd5 exd5 6.Nxd5. White thinks the f6 knight is pinned and grabs a pawn.',
      fr: 'Gambit dame refusé : 1.d4 d5 2.c4 e6 3.Cc3 Cf6 4.Fg5 Cbd7 5.cxd5 exd5 6.Cxd5. Les Blancs croient le cavalier f6 cloué et prennent un pion.',
    },
    start: 'd2d4 d7d5 c2c4 e7e6 b1c3 g8f6 c1g5 b8d7 c4d5 e6d5 c3d5',
    fen: 'r1bqkb1r/pppn1ppp/5n2/3N2B1/3P4/8/PP2PPPP/R2QKBNR b KQkq - 0 6',
    solution: ['f6d5', 'g5d8', 'f8b4'],
  },
  {
    id: 'qga-b5',
    theme: 'queensGambit',
    goal: 'advantage',
    name: { en: 'Holding on to c4', fr: 'Garder le pion c4' },
    intro: {
      en: 'Queen’s Gambit Accepted: 1.d4 d5 2.c4 dxc4 3.e3 b5 4.a4 c6 5.axb5 cxb5. Black wants to keep the gambit pawn, but the long diagonal is now open.',
      fr: 'Gambit dame accepté : 1.d4 d5 2.c4 dxc4 3.e3 b5 4.a4 c6 5.axb5 cxb5. Les Noirs veulent garder le pion du gambit, mais la grande diagonale est ouverte.',
    },
    start: 'd2d4 d7d5 c2c4 d5c4 e2e3 b7b5 a2a4 c7c6 a4b5 c6b5',
    fen: 'rnbqkbnr/p3pppp/8/1p6/2pP4/4P3/1P3PPP/RNBQKBNR w KQkq - 0 6',
    solution: ['d1f3', 'b8c6', 'f3c6'],
  },
  {
    id: 'albin-lasker-trap',
    theme: 'queensGambit',
    goal: 'advantage',
    name: { en: 'Lasker Trap', fr: 'Piège de Lasker' },
    intro: {
      en: 'Albin Countergambit: 1.d4 d5 2.c4 e5 3.dxe5 d4 4.e3 Bb4+ 5.Bd2 dxe3 6.Bxb4. White has won the bishop, but the e3 pawn has not had its last word.',
      fr: 'Contre-gambit Albin : 1.d4 d5 2.c4 e5 3.dxe5 d4 4.e3 Fb4+ 5.Fd2 dxe3 6.Fxb4. Les Blancs ont gagné le fou, mais le pion e3 n’a pas dit son dernier mot.',
    },
    start: 'd2d4 d7d5 c2c4 e7e5 d4e5 d5d4 e2e3 f8b4 c1d2 d4e3 d2b4',
    fen: 'rnbqk1nr/ppp2ppp/8/4P3/1BP5/4p3/PP3PPP/RN1QKBNR b KQkq - 0 6',
    solution: ['e3f2', 'e1e2', 'f2g1n'],
  },
];
