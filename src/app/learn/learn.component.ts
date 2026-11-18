import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

export type LearnSectionId = 'opening' | 'middlegame' | 'endgame';

export interface LearnSection {
  id: LearnSectionId;
  title: string;
  description: string;
}

export const LEARN_SECTIONS: LearnSection[] = [
  {
    id: 'opening',
    title: 'Opening',
    description:
      'Start the game well: control the center, develop your pieces and keep your king safe.',
  },
  {
    id: 'middlegame',
    title: 'Middlegame',
    description:
      'Find a plan, spot the tactics and build an attack once the pieces are out.',
  },
  {
    id: 'endgame',
    title: 'Endgame',
    description:
      'Turn an advantage into a win with the techniques of the last phase of the game.',
  },
];

/** One of the Learn sections, chosen by the route data. */
@Component({
  selector: 'app-learn',
  templateUrl: './learn.component.html',
  styleUrls: ['./learn.component.scss'],
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

  constructor(private route: ActivatedRoute) {}
}
