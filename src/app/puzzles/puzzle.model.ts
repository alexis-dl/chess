import { Localized } from '../i18n/localized';

/** Theme of a puzzle, translated with the 'puzzles.theme.*' keys. */
export type PuzzleTheme =
  | 'backRank'
  | 'weakF7'
  | 'smothered'
  | 'anastasia'
  | 'arabian'
  | 'balestra'
  | 'blindSwine'
  | 'boden'
  | 'corner'
  | 'doubleBishop'
  | 'dovetail'
  | 'epaulette'
  | 'hook'
  | 'killBox'
  | 'pillsbury'
  | 'morphy'
  | 'opera'
  | 'swallowTail'
  | 'triangle'
  | 'vukovic'
  | 'promotion'
  | 'deflection'
  | 'french'
  | 'sicilian'
  | 'caroKann'
  | 'ruyLopez'
  | 'petrov'
  | 'philidor'
  | 'stafford'
  | 'budapest'
  | 'englund'
  | 'queensGambit';

/** Themes are shown in groups: tactical ideas, mating patterns, openings. */
export type PuzzleCategory = 'tactics' | 'mates' | 'openings';

export interface PuzzleThemeInfo {
  id: PuzzleTheme;
  category: PuzzleCategory;
  /** Material icon of its card. */
  icon: string;
}

/** The themes, in the order of the Puzzle themes page. */
export const PUZZLE_THEMES: PuzzleThemeInfo[] = [
  { id: 'weakF7', category: 'tactics', icon: 'gps_fixed' },
  { id: 'promotion', category: 'tactics', icon: 'upgrade' },
  { id: 'deflection', category: 'tactics', icon: 'call_split' },
  { id: 'backRank', category: 'mates', icon: 'border_bottom' },
  { id: 'smothered', category: 'mates', icon: 'grid_view' },
  { id: 'anastasia', category: 'mates', icon: 'woman' },
  { id: 'arabian', category: 'mates', icon: 'mosque' },
  { id: 'balestra', category: 'mates', icon: 'close' },
  { id: 'blindSwine', category: 'mates', icon: 'savings' },
  { id: 'boden', category: 'mates', icon: 'shuffle' },
  { id: 'corner', category: 'mates', icon: 'south_east' },
  { id: 'doubleBishop', category: 'mates', icon: 'filter_2' },
  { id: 'dovetail', category: 'mates', icon: 'flutter_dash' },
  { id: 'epaulette', category: 'mates', icon: 'military_tech' },
  { id: 'hook', category: 'mates', icon: 'phishing' },
  { id: 'killBox', category: 'mates', icon: 'check_box_outline_blank' },
  { id: 'pillsbury', category: 'mates', icon: 'shield' },
  { id: 'morphy', category: 'mates', icon: 'star' },
  { id: 'opera', category: 'mates', icon: 'theater_comedy' },
  { id: 'swallowTail', category: 'mates', icon: 'call_merge' },
  { id: 'triangle', category: 'mates', icon: 'change_history' },
  { id: 'vukovic', category: 'mates', icon: 'grid_on' },
  { id: 'sicilian', category: 'openings', icon: 'menu_book' },
  { id: 'french', category: 'openings', icon: 'menu_book' },
  { id: 'caroKann', category: 'openings', icon: 'menu_book' },
  { id: 'ruyLopez', category: 'openings', icon: 'menu_book' },
  { id: 'petrov', category: 'openings', icon: 'menu_book' },
  { id: 'philidor', category: 'openings', icon: 'menu_book' },
  { id: 'stafford', category: 'openings', icon: 'menu_book' },
  { id: 'queensGambit', category: 'openings', icon: 'menu_book' },
  { id: 'budapest', category: 'openings', icon: 'menu_book' },
  { id: 'englund', category: 'openings', icon: 'menu_book' },
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
  // Philidor's legacy: a queen sacrifice, then the smothered mate
  {
    id: 'philidor',
    theme: 'smothered',
    fen: '5r1k/6pp/7N/3Q4/8/8/5PPP/6K1 w - - 0 1',
    solution: ['d5g8', 'f8g8', 'h6f7'],
  },

  // ----- mating patterns: one mate in one each -----
  {
    id: 'anastasia',
    theme: 'anastasia',
    fen: '8/4N1pk/8/R7/8/8/5PPP/6K1 w - - 0 1',
    solution: ['a5h5'],
  },
  {
    id: 'arabian',
    theme: 'arabian',
    fen: '7k/1R6/5N2/8/8/8/5PPP/6K1 w - - 0 1',
    solution: ['b7h7'],
  },
  {
    id: 'balestra',
    theme: 'balestra',
    fen: '4k3/pp5p/5Q2/8/8/3B4/5PPP/6K1 w - - 0 1',
    solution: ['d3b5'],
  },
  {
    id: 'blindSwine',
    theme: 'blindSwine',
    fen: '5rk1/1R5R/8/8/8/8/5PPP/6K1 w - - 0 1',
    solution: ['b7g7'],
  },
  {
    id: 'boden',
    theme: 'boden',
    fen: '2kr4/p2p4/8/8/5B2/3B4/5PPP/6K1 w - - 0 1',
    solution: ['d3a6'],
  },
  {
    id: 'corner',
    theme: 'corner',
    fen: '7k/7p/8/6N1/8/6R1/5P1P/7K w - - 0 1',
    solution: ['g5f7'],
  },
  {
    id: 'doubleBishop',
    theme: 'doubleBishop',
    fen: '7k/7p/8/8/2B5/8/5PPP/2B3K1 w - - 0 1',
    solution: ['c1b2'],
  },
  {
    id: 'dovetail',
    theme: 'dovetail',
    fen: '6kr/7p/8/6N1/8/5Q2/5PPP/6K1 w - - 0 1',
    solution: ['f3f7'],
  },
  {
    id: 'epaulette',
    theme: 'epaulette',
    fen: '3rkr2/8/8/8/8/1Q6/5PPP/6K1 w - - 0 1',
    solution: ['b3e6'],
  },
  {
    id: 'hook',
    theme: 'hook',
    fen: '5k2/5pp1/5N2/6P1/8/8/4RPPP/6K1 w - - 0 1',
    solution: ['e2e8'],
  },
  {
    id: 'killBox',
    theme: 'killBox',
    fen: '4kn2/R7/3Q4/8/8/8/5PPP/6K1 w - - 0 1',
    solution: ['a7e7'],
  },
  {
    id: 'pillsbury',
    theme: 'pillsbury',
    fen: '5rk1/5p1p/8/8/8/4R3/1B3PPP/6K1 w - - 0 1',
    solution: ['e3g3'],
  },
  {
    id: 'morphy',
    theme: 'morphy',
    fen: '7k/7p/8/8/8/6R1/5P1P/2B4K w - - 0 1',
    solution: ['c1b2'],
  },
  {
    id: 'opera',
    theme: 'opera',
    fen: '4k3/5ppp/8/6B1/8/8/5PPP/3R2K1 w - - 0 1',
    solution: ['d1d8'],
  },
  {
    id: 'swallowTail',
    theme: 'swallowTail',
    fen: '8/3p1p2/4k3/8/5P2/8/6PP/Q5K1 w - - 0 1',
    solution: ['a1e5'],
  },
  {
    id: 'triangle',
    theme: 'triangle',
    fen: '2bk4/8/8/4R3/8/Q7/5PPP/6K1 w - - 0 1',
    solution: ['a3e7'],
  },
  {
    id: 'vukovic',
    theme: 'vukovic',
    fen: '4k3/R7/3PN3/8/8/8/5PPP/6K1 w - - 0 1',
    solution: ['a7e7'],
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
    // 10.Qxd4 wins too: it is pointed out as a good move, not the line's
    solution: ['f3d4', 'b6d4', 'd3b5', 'c8d7', 'b5d7', 'e8d7', 'd1d4'],
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
  {
    id: 'sicilian-siberian-trap',
    theme: 'sicilian',
    goal: 'advantage',
    name: { en: 'Siberian Trap', fr: 'Piège sibérien' },
    intro: {
      en: 'Sicilian, Smith-Morra Gambit: 1.e4 c5 2.d4 cxd4 3.c3 dxc3 4.Nxc3 Nc6 5.Nf3 e6 6.Bc4 Qc7 7.O-O Nf6 8.Qe2 Ng4 9.h3. White chases the knight, but h2 has lost its defender.',
      fr: 'Sicilienne, gambit Smith-Morra : 1.e4 c5 2.d4 cxd4 3.c3 dxc3 4.Cxc3 Cc6 5.Cf3 e6 6.Fc4 Dc7 7.0-0 Cf6 8.De2 Cg4 9.h3. Les Blancs chassent le cavalier, mais h2 n’a plus de défenseur.',
    },
    start:
      'e2e4 c7c5 d2d4 c5d4 c2c3 d4c3 b1c3 b8c6 g1f3 e7e6 f1c4 d8c7 e1g1 g8f6 d1e2 f6g4 h2h3',
    fen: 'r1b1kb1r/ppqp1ppp/2n1p3/8/2B1P1n1/2N2N1P/PP2QPP1/R1B2RK1 b kq - 0 9',
    solution: ['c6d4', 'h3g4', 'd4e2'],
  },
  {
    id: 'caro-kann-nd6',
    theme: 'caroKann',
    name: { en: 'Smothered mate on d6', fr: 'Mat étouffé en d6' },
    intro: {
      en: 'Caro-Kann: 1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Nd7 5.Qe2 Ngf6. The queen on e2 pins the e7 pawn: nothing guards d6 any more.',
      fr: 'Caro-Kann : 1.e4 c6 2.d4 d5 3.Cc3 dxe4 4.Cxe4 Cd7 5.De2 Cgf6. La dame e2 cloue le pion e7 : plus rien ne garde d6.',
    },
    start:
      'e2e4 c7c6 d2d4 d7d5 b1c3 d5e4 c3e4 b8d7 d1e2 g8f6',
    fen: 'r1bqkb1r/pp1npppp/2p2n2/8/3PN3/8/PPP1QPPP/R1B1KBNR w KQkq - 3 6',
    solution: ['e4d6'],
  },
  {
    id: 'ruy-lopez-noahs-ark',
    theme: 'ruyLopez',
    goal: 'advantage',
    name: { en: 'Noah’s Ark Trap', fr: 'Piège de l’arche de Noé' },
    intro: {
      en: 'Ruy Lopez: 1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 d6 5.d4 b5 6.Bb3 Nxd4 7.Nxd4 exd4 8.Qxd4. The queen takes the pawn back, but the b3 bishop is short of squares.',
      fr: 'Partie espagnole : 1.e4 e5 2.Cf3 Cc6 3.Fb5 a6 4.Fa4 d6 5.d4 b5 6.Fb3 Cxd4 7.Cxd4 exd4 8.Dxd4. La dame reprend le pion, mais le fou b3 manque de cases.',
    },
    start:
      'e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 d7d6 d2d4 b7b5 a4b3 c6d4 f3d4 e5d4 d1d4',
    fen: 'r1bqkbnr/2p2ppp/p2p4/1p6/3QP3/1B6/PPP2PPP/RNB1K2R b KQkq - 0 8',
    solution: ['c7c5', 'd4c3', 'c5c4'],
  },
  {
    id: 'petrov-copycat',
    theme: 'petrov',
    goal: 'advantage',
    name: { en: 'The copycat punished', fr: 'La symétrie punie' },
    intro: {
      en: 'Petrov Defense: 1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nxe4 4.Qe2 Nf6. Black copied White, but the queen e2 now faces the king along the e-file.',
      fr: 'Défense Petrov : 1.e4 e5 2.Cf3 Cf6 3.Cxe5 Cxe4 4.De2 Cf6. Les Noirs ont copié les Blancs, mais la dame e2 fait face au roi sur la colonne e.',
    },
    start:
      'e2e4 e7e5 g1f3 g8f6 f3e5 f6e4 d1e2 e4f6',
    fen: 'rnbqkb1r/pppp1ppp/5n2/4N3/8/8/PPPPQPPP/RNB1KB1R w KQkq - 2 5',
    solution: ['e5c6', 'd8e7', 'c6e7'],
  },
  {
    id: 'philidor-legal-mate',
    theme: 'philidor',
    name: { en: 'Légal’s mate', fr: 'Mat de Légal' },
    intro: {
      en: 'Philidor Defense: 1.e4 e5 2.Nf3 d6 3.Bc4 Bg4 4.Nc3 g6 5.Nxe5 Bxd1. White left the queen hanging, and Black took it.',
      fr: 'Défense Philidor : 1.e4 e5 2.Cf3 d6 3.Fc4 Fg4 4.Cc3 g6 5.Cxe5 Fxd1. Les Blancs ont laissé leur dame en prise, et les Noirs l’ont prise.',
    },
    start:
      'e2e4 e7e5 g1f3 d7d6 f1c4 c8g4 b1c3 g7g6 f3e5 g4d1',
    fen: 'rn1qkbnr/ppp2p1p/3p2p1/4N3/2B1P3/2N5/PPPP1PPP/R1BbK2R w KQkq - 0 6',
    solution: ['c4f7', 'e8e7', 'c3d5'],
  },
  {
    id: 'stafford-bg5-trap',
    theme: 'stafford',
    goal: 'advantage',
    name: { en: 'The pin that isn’t one', fr: 'Le faux clouage' },
    intro: {
      en: 'Stafford Gambit: 1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.Bg5. White pins the f6 knight… or so it seems.',
      fr: 'Gambit Stafford : 1.e4 e5 2.Cf3 Cf6 3.Cxe5 Cc6 4.Cxc6 dxc6 5.d3 Fc5 6.Fg5. Les Blancs clouent le cavalier f6… du moins le croient-ils.',
    },
    start:
      'e2e4 e7e5 g1f3 g8f6 f3e5 b8c6 e5c6 d7c6 d2d3 f8c5 c1g5',
    fen: 'r1bqk2r/ppp2ppp/2p2n2/2b3B1/4P3/3P4/PPP2PPP/RN1QKB1R b KQkq - 2 6',
    solution: ['f6e4', 'g5d8', 'c5f2', 'e1e2', 'c8g4'],
  },
  {
    id: 'budapest-nd3-mate',
    theme: 'budapest',
    name: { en: 'Smothered mate on d3', fr: 'Mat étouffé en d3' },
    intro: {
      en: 'Budapest Gambit: 1.d4 Nf6 2.c4 e5 3.dxe5 Ng4 4.Bf4 Nc6 5.Nf3 Bb4+ 6.Nbd2 Qe7 7.a3 Ngxe5 8.axb4. White has won the bishop.',
      fr: 'Gambit de Budapest : 1.d4 Cf6 2.c4 e5 3.dxe5 Cg4 4.Ff4 Cc6 5.Cf3 Fb4+ 6.Cbd2 De7 7.a3 Cgxe5 8.axb4. Les Blancs ont gagné le fou.',
    },
    start:
      'd2d4 g8f6 c2c4 e7e5 d4e5 f6g4 c1f4 b8c6 g1f3 f8b4 b1d2 d8e7 a2a3 g4e5 a3b4',
    fen: 'r1b1k2r/ppppqppp/2n5/4n3/1PP2B2/5N2/1P1NPPPP/R2QKB1R b KQkq - 0 8',
    solution: ['e5d3'],
  },
  {
    id: 'englund-qc1-mate',
    theme: 'englund',
    goal: 'advantage',
    name: { en: 'Englund Gambit trap', fr: 'Piège du gambit Englund' },
    intro: {
      en: 'Englund Gambit: 1.d4 e5 2.dxe5 Nc6 3.Nf3 Qe7 4.Bf4 Qb4+ 5.Bd2 Qxb2 6.Bc3. White attacks the queen, and forgets about c1.',
      fr: 'Gambit Englund : 1.d4 e5 2.dxe5 Cc6 3.Cf3 De7 4.Ff4 Db4+ 5.Fd2 Dxb2 6.Fc3. Les Blancs attaquent la dame, et oublient c1.',
    },
    start:
      'd2d4 e7e5 d4e5 b8c6 g1f3 d8e7 c1f4 e7b4 f4d2 b4b2 d2c3',
    fen: 'r1b1kbnr/pppp1ppp/2n5/4P3/8/2B2N2/PqP1PPPP/RN1QKB1R b KQkq - 1 6',
    solution: ['f8b4', 'd1d2', 'b4c3', 'd2c3', 'b2c1'],
  },
];
