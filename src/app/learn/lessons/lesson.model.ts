import { BrushColor } from '../../chess-game/chess-board/annotations';
import { Localized } from '../../i18n/localized';
import type { LearnSectionId } from '../learn.component';

/** Arrow or circle drawn by the lesson; squares in algebraic notation. */
export type LessonShape =
  | { circle: string; color: BrushColor }
  | { from: string; to: string; color: BrushColor };

export interface LessonStep {
  title: Localized;
  /** Paragraphs of explanation, in every language. */
  text: Localized<string[]>;
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
  title: Localized;
  summary: Localized;
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
    title: {
      en: 'The isolated queen’s pawn (IQP)',
      fr: 'Le pion dame isolé (PDI)',
    },
    summary: {
      en: 'How it arises, for example in the Caro-Kann Panov attack, and how to play with and against it.',
      fr: 'Comment il apparaît, par exemple dans l’attaque Panov de la Caro-Kann, et comment jouer avec et contre lui.',
    },
    steps: [
      {
        title: { en: 'What is an IQP?', fr: 'Qu’est-ce qu’un PDI ?' },
        text: {
          en: [
            'A pawn is isolated when no pawn of the same color stands on the neighbouring files: it can never be defended by another pawn. An isolated pawn on d4 (or on d5 for Black) is called an isolated queen’s pawn, or IQP.',
            'Three squares matter. d5, the square in front of the pawn, can never be attacked by a white pawn: it is the perfect home for an enemy piece (green). e5 and c5 are the outposts the pawn gives to White’s pieces (blue).',
            'The IQP is both a strength and a weakness: it gives space and active play in the middlegame, but it becomes a target as the pieces are traded.',
          ],
          fr: [
            'Un pion est isolé quand aucun pion de sa couleur ne se trouve sur les colonnes voisines : il ne pourra jamais être défendu par un autre pion. Un pion isolé en d4 (ou en d5 pour les Noirs) s’appelle un pion dame isolé, ou PDI.',
            'Trois cases comptent. d5, la case devant le pion, ne peut jamais être attaquée par un pion blanc : c’est la place idéale pour une pièce adverse (en vert). e5 et c5 sont les avant-postes que le pion offre aux pièces blanches (en bleu).',
            'Le PDI est à la fois une force et une faiblesse : il donne de l’espace et du jeu actif en milieu de partie, mais devient une cible au fil des échanges.',
          ],
        },
        fen: '4k3/pp3ppp/4p3/8/3P4/8/PP3PPP/4K3 w - - 0 1',
        shapes: [
          { circle: 'd4', color: 'red' },
          { circle: 'd5', color: 'green' },
          { circle: 'e5', color: 'blue' },
          { circle: 'c5', color: 'blue' },
        ],
      },
      {
        title: {
          en: 'Reaching it: the Panov attack',
          fr: 'L’obtenir : l’attaque Panov',
        },
        text: {
          en: [
            'The IQP often comes straight out of the opening. In the Caro-Kann, the Panov attack (1.e4 c6 2.d4 d5 3.exd5 cxd5 4.c4) leads to it: after 7.cxd5 Nxd5 White’s c- and e-pawns are gone and the d4 pawn is isolated.',
            'Play through the moves with the arrows below the text, or with the arrow keys.',
            'The same structure appears in many other openings: the Queen’s Gambit Tarrasch (for Black, see next step), the Alapin Sicilian (2.c3), the Nimzo-Indian or the French Tarrasch.',
          ],
          fr: [
            'Le PDI sort souvent directement de l’ouverture. Dans la Caro-Kann, l’attaque Panov (1.e4 c6 2.d4 d5 3.exd5 cxd5 4.c4) y mène : après 7.cxd5 et la reprise du cavalier en d5, les pions c et e des Blancs ont disparu et le pion d4 est isolé.',
            'Rejouez les coups avec les flèches sous le texte, ou avec les flèches du clavier.',
            'La même structure apparaît dans bien d’autres ouvertures : la défense Tarrasch du Gambit Dame (pour les Noirs, voir l’étape suivante), la Sicilienne Alapin (2.c3), la Nimzo-Indienne ou la Française Tarrasch.',
          ],
        },
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
        title: {
          en: 'Black can have it too: the Tarrasch',
          fr: 'Les Noirs aussi : la Tarrasch',
        },
        text: {
          en: [
            'In the Tarrasch defense of the Queen’s Gambit, Black accepts an IQP on purpose, in exchange for free development and active pieces.',
            'After 9.dxc5 Bxc5 the d5 pawn is isolated. Everything in this lesson applies with colors reversed: d4 is now the blockade square for White.',
          ],
          fr: [
            'Dans la défense Tarrasch du Gambit Dame, les Noirs acceptent volontairement un PDI, en échange d’un développement facile et de pièces actives.',
            'Après 9.dxc5 et la reprise du fou en c5, le pion d5 est isolé. Tout ce qui suit s’applique en inversant les couleurs : d4 devient la case de blocage pour les Blancs.',
          ],
        },
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
        title: {
          en: 'Playing with the IQP: attack',
          fr: 'Jouer avec le PDI : l’attaque',
        },
        text: {
          en: [
            'The side with the IQP must play actively. The pawn controls e5 and c5 and gives space behind it.',
            'Typical setup: a knight jumps to e5, the bishop goes to the b1–h7 diagonal with the queen behind it (Bc2 and Qd3) aiming at h7, a rook comes to e1 or is lifted to the third rank, and the c1 bishop goes to g5 to remove the f6 knight, the defender of h7.',
            'Keep the pieces on the board: each exchange makes the d4 pawn weaker. The d4–d5 break is the other key idea: it opens lines for the active pieces just when the opponent seems to have everything under control.',
          ],
          fr: [
            'Le camp qui a le PDI doit jouer activement. Le pion contrôle e5 et c5 et donne de l’espace derrière lui.',
            'Le schéma typique : un cavalier saute en e5, le fou se place sur la diagonale b1–h7 avec la dame derrière lui (fou en c2, dame en d3) pour viser h7, une tour vient en e1 ou monte sur la troisième rangée, et le fou c1 va en g5 pour éliminer le cavalier f6, défenseur de h7.',
            'Gardez les pièces sur l’échiquier : chaque échange affaiblit le pion d4. La rupture d4–d5 est l’autre idée clé : elle ouvre des lignes pour les pièces actives au moment où l’adversaire croit tout contrôler.',
          ],
        },
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
        title: {
          en: 'Playing against the IQP: blockade',
          fr: 'Jouer contre le PDI : le blocage',
        },
        text: {
          en: [
            'Put a piece on d5, the square in front of the pawn. It can never be chased away by a pawn and it stops the d4–d5 break. A knight is the best blockader: from d5 it also eyes c3, e3, b4 and f4.',
            'Then pile up on the pawn: a knight on c6, a bishop on f6, rooks on the d-file. White has to keep pieces on defence, and they become passive.',
          ],
          fr: [
            'Installez une pièce en d5, la case devant le pion. Aucun pion ne pourra l’en chasser et elle empêche la rupture d4–d5. Le cavalier est le meilleur bloqueur : depuis d5, il vise aussi c3, e3, b4 et f4.',
            'Accumulez ensuite la pression sur le pion : un cavalier en c6, un fou en f6, des tours sur la colonne d. Les Blancs doivent garder des pièces en défense, et elles deviennent passives.',
          ],
        },
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
        title: {
          en: 'Trade pieces: the IQP endgame',
          fr: 'Échanger les pièces : la finale',
        },
        text: {
          en: [
            'Every exchange helps the side playing against the IQP: fewer pieces means less attacking potential and a pawn that needs more and more defence. Trading minor pieces, especially White’s attacking bishops and the knight that could land on e5, is the main strategic goal.',
            'In this endgame d4 is attacked by the knight and by the rook along the open d-file. White can only defend it passively, while Black adds pressure and brings the king to the center. That is why the IQP side tries to decide the game before the endgame.',
          ],
          fr: [
            'Chaque échange aide le camp qui joue contre le PDI : moins de pièces, c’est moins de potentiel d’attaque et un pion qui demande de plus en plus de défense. Échanger les pièces mineures, surtout les fous d’attaque blancs et le cavalier qui pourrait s’installer en e5, est l’objectif stratégique principal.',
            'Dans cette finale, d4 est attaqué par le cavalier et par la tour sur la colonne d ouverte. Les Blancs ne peuvent que le défendre passivement, pendant que les Noirs augmentent la pression et centralisent leur roi. C’est pourquoi le camp qui a le PDI cherche à faire la décision avant la finale.',
          ],
        },
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
