import { BrushColor } from '../../chess-game/chess-board/annotations';
import type { LearnSectionId } from '../learn.component';

/** Arrow or circle drawn by the lesson; squares in algebraic notation. */
export type LessonShape =
  | { circle: string; color: BrushColor }
  | { from: string; to: string; color: BrushColor };

export interface LessonStep {
  title: string;
  /** Paragraphs of explanation. */
  text: string[];
  /** Position at the start of the step. */
  fen: string;
  /** Optional line to play through, in UCI notation (e.g. 'e2e4'). */
  moves?: string[];
  /** Shapes shown on the position reached at the end of the line. */
  shapes?: LessonShape[];
}

export interface Lesson {
  id: string;
  section: LearnSectionId;
  title: string;
  summary: string;
  steps: LessonStep[];
}

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/** Caro-Kann, Panov attack, after 7.cxd5 Nxd5: White has an IQP on d4. */
export const PANOV_IQP_FEN =
  'rnbqk2r/pp2bppp/4p3/3n4/3P4/2N2N2/PP3PPP/R1BQKB1R w KQkq - 0 8';

/** Every line and position is checked by lessons.spec.ts. */
export const LESSONS: Lesson[] = [
  {
    id: 'iqp',
    section: 'pawn-structures',
    title: "The isolated queen's pawn (IQP)",
    summary:
      'How it arises, for example in the Caro-Kann Panov attack, and how to play with and against it.',
    steps: [
      {
        title: 'What is an IQP?',
        text: [
          'A pawn is isolated when no pawn of the same color stands on the neighbouring files: it can never be defended by another pawn. An isolated pawn on d4 (or on d5 for Black) is called an isolated queen’s pawn, or IQP.',
          'Three squares matter. d5, the square in front of the pawn, can never be attacked by a white pawn: it is the perfect home for an enemy piece (green). e5 and c5 are the outposts the pawn gives to White’s pieces (blue).',
          'The IQP is both a strength and a weakness: it gives space and active play in the middlegame, but it becomes a target as the pieces are traded.',
        ],
        fen: '4k3/pp3ppp/4p3/8/3P4/8/PP3PPP/4K3 w - - 0 1',
        shapes: [
          { circle: 'd4', color: 'red' },
          { circle: 'd5', color: 'green' },
          { circle: 'e5', color: 'blue' },
          { circle: 'c5', color: 'blue' },
        ],
      },
      {
        title: 'Reaching it: the Panov attack',
        text: [
          'The IQP often comes straight out of the opening. In the Caro-Kann, the Panov attack (1.e4 c6 2.d4 d5 3.exd5 cxd5 4.c4) leads to it: after 7.cxd5 Nxd5 White’s c- and e-pawns are gone and the d4 pawn is isolated.',
          'Play through the moves with the arrows below the text, or with the arrow keys.',
          'The same structure appears in many other openings: the Queen’s Gambit Tarrasch (for Black, see next step), the Alapin Sicilian (2.c3), the Nimzo-Indian or the French Tarrasch.',
        ],
        fen: INITIAL_FEN,
        moves: [
          'e2e4',
          'c7c6',
          'd2d4',
          'd7d5',
          'e4d5',
          'c6d5',
          'c2c4',
          'g8f6',
          'b1c3',
          'e7e6',
          'g1f3',
          'f8e7',
          'c4d5',
          'f6d5',
        ],
        shapes: [
          { circle: 'd4', color: 'red' },
          { circle: 'd5', color: 'green' },
        ],
      },
      {
        title: 'Black can have it too: the Tarrasch',
        text: [
          'In the Tarrasch defense of the Queen’s Gambit, Black accepts an IQP on purpose, in exchange for free development and active pieces.',
          'After 9.dxc5 Bxc5 the d5 pawn is isolated. Everything in this lesson applies with colors reversed: d4 is now the blockade square for White.',
        ],
        fen: INITIAL_FEN,
        moves: [
          'd2d4',
          'd7d5',
          'c2c4',
          'e7e6',
          'b1c3',
          'c7c5',
          'c4d5',
          'e6d5',
          'g1f3',
          'b8c6',
          'g2g3',
          'g8f6',
          'f1g2',
          'f8e7',
          'e1g1',
          'e8g8',
          'd4c5',
          'e7c5',
        ],
        shapes: [
          { circle: 'd5', color: 'red' },
          { circle: 'd4', color: 'green' },
        ],
      },
      {
        title: 'Playing with the IQP: attack',
        text: [
          'The side with the IQP must play actively. The pawn controls e5 and c5 and gives space behind it.',
          'Typical setup: a knight jumps to e5, the bishop goes to the b1–h7 diagonal with the queen behind it (Bc2 and Qd3) aiming at h7, a rook comes to e1 or is lifted to the third rank, and the c1 bishop goes to g5 to remove the f6 knight, the defender of h7.',
          'Keep the pieces on the board: each exchange makes the d4 pawn weaker. The d4–d5 break is the other key idea: it opens lines for the active pieces just when the opponent seems to have everything under control.',
        ],
        fen: PANOV_IQP_FEN,
        moves: [
          'f1d3',
          'e8g8',
          'e1g1',
          'b8c6',
          'f1e1',
          'd5f6',
          'a2a3',
          'b7b6',
          'd3c2',
          'c8b7',
          'd1d3',
        ],
        shapes: [
          { from: 'c2', to: 'h7', color: 'green' },
          { from: 'f3', to: 'e5', color: 'blue' },
          { circle: 'e5', color: 'blue' },
          { from: 'c1', to: 'g5', color: 'yellow' },
          { from: 'd4', to: 'd5', color: 'red' },
        ],
      },
      {
        title: 'Playing against the IQP: blockade',
        text: [
          'Put a piece on d5, the square in front of the pawn. It can never be chased away by a pawn and it stops the d4–d5 break. A knight is the best blockader: from d5 it also eyes c3, e3, b4 and f4.',
          'Then pile up on the pawn: a knight on c6, a bishop on f6, rooks on the d-file. White has to keep pieces on defence, and they become passive.',
        ],
        fen: PANOV_IQP_FEN,
        moves: ['f1d3', 'b8c6', 'e1g1', 'e8g8', 'f1e1', 'e7f6'],
        shapes: [
          { circle: 'd5', color: 'green' },
          { from: 'c6', to: 'd4', color: 'red' },
          { from: 'f6', to: 'd4', color: 'red' },
          { circle: 'd4', color: 'red' },
        ],
      },
      {
        title: 'Trade pieces: the IQP endgame',
        text: [
          'Every exchange helps the side playing against the IQP: fewer pieces means less attacking potential and a pawn that needs more and more defence. Trading minor pieces, especially White’s attacking bishops and the knight that could land on e5, is the main strategic goal.',
          'In this endgame d4 is attacked by the knight and by the rook along the open d-file. White can only defend it passively, while Black adds pressure and brings the king to the center. That is why the IQP side tries to decide the game before the endgame.',
        ],
        fen: '3r2k1/pp3ppp/4p3/5n2/3P4/5N2/PP3PPP/3R2K1 w - - 0 1',
        shapes: [
          { from: 'f5', to: 'd4', color: 'red' },
          { from: 'd8', to: 'd4', color: 'red' },
          { circle: 'd4', color: 'red' },
        ],
      },
    ],
  },
];
