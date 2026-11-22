import type { Color } from '../chess-game/piece.model';
import { Localized } from '../i18n/localized';
import type { LearnSectionId } from './learn.component';

export interface CourseGroup {
  title: Localized;
  /** Ids of the lessons (lesson.model.ts), in reading order. */
  lessons: string[];
}

/**
 * A set of lessons on one subject (an opening...), shown as one card in its
 * section and on its own page. Its lessons have `course` set to its id, and
 * are listed only here (checked by lessons.spec.ts).
 */
export interface Course {
  id: string;
  section: LearnSectionId;
  title: Localized;
  summary: Localized;
  /** Side shown at the bottom of the board in its lessons (white by default). */
  orientation?: Color;
  groups: CourseGroup[];
}

export const COURSES: Course[] = [
  {
    id: 'caro-kann',
    section: 'opening',
    title: { en: 'Caro-Kann Defense', fr: 'Défense Caro-Kann' },
    summary: {
      en: '1.e4 c6: a solid defense for Black. The main variations and the sidelines to know.',
      fr: '1.e4 c6 : une défense solide pour les Noirs. Les variantes principales et les sidelines à connaître.',
    },
    // a repertoire for Black
    orientation: 'black',
    groups: [
      {
        title: { en: 'Main variations', fr: 'Variantes principales' },
        lessons: [
          'caro-kann-advance',
          'caro-kann-exchange',
          'caro-kann-classical',
        ],
      },
      {
        title: { en: 'Sidelines', fr: 'Sidelines' },
        lessons: [
          'caro-kann-fantasy',
          'caro-kann-two-knights',
          'caro-kann-sidelines',
        ],
      },
    ],
  },
  // announced: shown as "coming soon" until it has lessons
  {
    id: 'jobava-london',
    section: 'opening',
    title: { en: 'Jobava London', fr: 'Jobava London' },
    summary: {
      en: '1.d4, 2.Nc3 and 3.Bf4: an aggressive system for White.',
      fr: '1.d4, 2.Cc3 et 3.Ff4 : un système agressif pour les Blancs.',
    },
    groups: [],
  },
];
