import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Localized } from '../../i18n/localized';
import { Course, COURSES } from '../courses';
import { LEARN_SECTIONS } from '../learn.component';
import { Lesson, LESSONS } from '../lessons/lesson.model';

/** A course: its lessons, grouped (main variations, sidelines...). */
@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['../learn.component.scss', './course.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CourseComponent {
  readonly course$ = this.route.paramMap.pipe(
    map(
      params =>
        COURSES.find(
          course =>
            course.section === params.get('section') &&
            course.id === params.get('course')
        ) ?? null
    )
  );

  constructor(private route: ActivatedRoute) {}

  sectionTitle(course: Course): Localized {
    const section = LEARN_SECTIONS.find(s => s.id === course.section);
    return section?.title ?? { en: 'Learn', fr: 'Apprendre' };
  }

  lessons(ids: string[]): Lesson[] {
    return ids
      .map(id => LESSONS.find(lesson => lesson.id === id))
      .filter((lesson): lesson is Lesson => !!lesson);
  }
}
