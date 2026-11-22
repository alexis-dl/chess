import { Localized } from '../i18n/localized';

export type EndgameThemeId =
  | 'checkmates'
  | 'pawn'
  | 'minor-piece'
  | 'rook'
  | 'queen'
  | 'imbalances';

export interface EndgameTheme {
  id: EndgameThemeId;
  title: Localized;
  description: Localized;
  /** Piece image (assets/chess-pieces), else a Material icon. */
  piece?: string;
  icon?: string;
}

/** Menu of the Endgame section: its lessons are grouped by theme. */
export const ENDGAME_THEMES: EndgameTheme[] = [
  {
    id: 'checkmates',
    title: { en: 'Checkmates', fr: 'Échecs et mat' },
    description: {
      en: 'The basic mates: with a queen, a rook, two bishops, bishop and knight.',
      fr: 'Les mats de base : avec une dame, une tour, deux fous, fou et cavalier.',
    },
    piece: 'white-king',
  },
  {
    id: 'pawn',
    title: { en: 'Pawn', fr: 'Pion' },
    description: {
      en: 'King and pawn endings: opposition, the square rule, key squares.',
      fr: 'Finales de roi et pions : opposition, règle du carré, cases clés.',
    },
    piece: 'white-pawn',
  },
  {
    id: 'minor-piece',
    title: { en: 'Minor piece', fr: 'Pièce mineure' },
    description: {
      en: 'Endings with bishops and knights, good and bad bishops.',
      fr: 'Finales de fous et de cavaliers, bon et mauvais fou.',
    },
    piece: 'white-bishop',
  },
  {
    id: 'rook',
    title: { en: 'Rook', fr: 'Tour' },
    description: {
      en: 'The most common endings: Lucena, Philidor, active rook.',
      fr: 'Les finales les plus fréquentes : Lucena, Philidor, tour active.',
    },
    piece: 'white-rook',
  },
  {
    id: 'queen',
    title: { en: 'Queen', fr: 'Dame' },
    description: {
      en: 'Queen endings and queen against pawn.',
      fr: 'Finales de dames et dame contre pion.',
    },
    piece: 'white-queen',
  },
  {
    id: 'imbalances',
    title: { en: 'Imbalances', fr: 'Déséquilibres' },
    description: {
      en: 'Different material on each side: rook against minor piece, exchange up…',
      fr: 'Un matériel différent de chaque côté : tour contre pièce mineure, qualité de plus…',
    },
    icon: 'balance',
  },
];
