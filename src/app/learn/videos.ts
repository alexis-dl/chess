import { Localized } from '../i18n/localized';
import type { LearnSectionId } from './learn.component';

/** A YouTube video shown in a Learn section. */
export interface LearnVideo {
  /** YouTube video id (the `v` parameter of its URL). */
  youtubeId: string;
  section: LearnSectionId;
  /** Title of the video on YouTube, kept as is. */
  title: string;
  channel: string;
  summary: Localized;
}

export const VIDEOS: LearnVideo[] = [
  {
    youtubeId: '6cfjO5xXOxQ',
    section: 'middlegame',
    title: 'How to WIN with Big Center',
    channel: 'AdviceCabinet',
    summary: {
      en: 'Make use of a strong pawn center: when to push it and how to turn it into an attack.',
      fr: 'Exploiter un grand centre de pions : quand le pousser et comment le transformer en attaque.',
    },
  },
  {
    youtubeId: 'npMpKF19AvQ',
    section: 'middlegame',
    title: 'Why Your Attacks Are Slow',
    channel: 'AdviceCabinet',
    summary: {
      en: 'Speed up your attacks: bring every piece in and don’t give the defender time.',
      fr: 'Accélérer ses attaques : faire participer toutes les pièces et ne pas laisser de temps au défenseur.',
    },
  },
  {
    youtubeId: 'RknWrTSXu64',
    section: 'middlegame',
    title: 'How to CORRECTLY Pawn Storm',
    channel: 'AdviceCabinet',
    summary: {
      en: 'Throw your pawns at the enemy king: when the storm works and how to time it.',
      fr: 'Lancer ses pions sur le roi adverse : quand l’assaut fonctionne et comment bien le minuter.',
    },
  },
];
