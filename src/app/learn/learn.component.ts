import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Localized } from '../i18n/localized';
import { Course, COURSES } from './courses';
import { EndgameTheme, ENDGAME_THEMES } from './endgame-themes';
import { Lesson, LESSONS } from './lessons/lesson.model';
import { LearnVideo, VIDEOS } from './videos';

export type LearnSectionId =
  'opening' | 'middlegame' | 'endgame' | 'pawn-structures';

export interface LearnSection {
  id: LearnSectionId;
  title: Localized;
  description: Localized;
}

export const LEARN_SECTIONS: LearnSection[] = [
  {
    id: 'opening',
    title: { en: 'Opening', fr: 'Ouverture' },
    description: {
      en: 'Start the game well: control the center, develop your pieces and keep your king safe.',
      fr: 'Bien commencer la partie : contrôler le centre, développer ses pièces et mettre son roi à l’abri.',
    },
  },
  {
    id: 'middlegame',
    title: { en: 'Middlegame', fr: 'Milieu de partie' },
    description: {
      en: 'Find a plan, spot the tactics and build an attack once the pieces are out.',
      fr: 'Trouver un plan, repérer la tactique et construire une attaque une fois les pièces sorties.',
    },
  },
  {
    id: 'endgame',
    title: { en: 'Endgame', fr: 'Finale' },
    description: {
      en: 'Turn an advantage into a win with the techniques of the last phase of the game.',
      fr: 'Transformer un avantage en victoire grâce aux techniques de la dernière phase de la partie.',
    },
  },
  {
    id: 'pawn-structures',
    title: { en: 'Pawn structures', fr: 'Structures de pions' },
    description: {
      en: 'Read the pawns to find the right plan: isolated pawns, hanging pawns, chains, majorities and more.',
      fr: 'Lire les pions pour trouver le bon plan : pions isolés, pions pendants, chaînes, majorités et plus encore.',
    },
  },
];

/** One of the Learn sections, chosen by the route data. */
@Component({
    selector: 'app-learn',
    templateUrl: './learn.component.html',
    styleUrls: ['./learn.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class LearnComponent {
  readonly sections = LEARN_SECTIONS;
  readonly section$ = this.route.data.pipe(
    map(
      data =>
        LEARN_SECTIONS.find(section => section.id === data['section']) ??
        LEARN_SECTIONS[0]
    )
  );

  readonly endgameThemes = ENDGAME_THEMES;
  /** Endgame theme opened from the menu (?theme=...), null for the menu. */
  readonly endgameTheme$ = this.route.queryParamMap.pipe(
    map(
      params =>
        ENDGAME_THEMES.find(theme => theme.id === params.get('theme')) ?? null
    )
  );

  constructor(private route: ActivatedRoute) {}

  coursesFor(sectionId: LearnSectionId): Course[] {
    return COURSES.filter(course => course.section === sectionId);
  }

  /** Lessons of the section that are not part of a course. */
  lessonsFor(sectionId: LearnSectionId): Lesson[] {
    return LESSONS.filter(
      lesson => lesson.section === sectionId && !lesson.course
    );
  }

  videosFor(sectionId: LearnSectionId): LearnVideo[] {
    return VIDEOS.filter(video => video.section === sectionId);
  }

  /** Number of lessons of a course, shown on its card. */
  lessonCount(course: Course): number {
    return course.groups.reduce((n, group) => n + group.lessons.length, 0);
  }

  lessonsForTheme(theme: EndgameTheme): Lesson[] {
    return LESSONS.filter(
      lesson => lesson.section === 'endgame' && lesson.endgameTheme === theme.id
    );
  }
}
