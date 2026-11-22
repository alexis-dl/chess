import { Component, HostListener, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  ArrowAnnotation,
  BoardSquare,
  CircleAnnotation,
} from '../../chess-game/chess-board/annotations';
import { ChessUtilsService } from '../../chess-game/chess-utils.service';
import { Chessboard } from '../../chess-game/chessboard.model';
import { stepStartPosition } from '../lessons/lesson-position';
import { formatMoveList, MoveListItem } from '../../chess-game/move-list';
import { RulesService } from '../../chess-game/rules.service';
import { parseUci } from '../../puzzles/puzzle-moves';
import { Color } from '../../chess-game/piece.model';
import { Localized } from '../../i18n/localized';
import { Course, COURSES } from '../courses';
import { LEARN_SECTIONS, LearnSection } from '../learn.component';
import {
  Lesson,
  LESSONS,
  LessonShape,
  LessonStep,
} from '../lessons/lesson.model';

const toBoardSquare = (square: string): BoardSquare => ({
  x: square.charCodeAt(0) - 'a'.charCodeAt(0),
  y: +square[1] - 1,
});

/** A lesson: explanations step by step, with lines to play through on the board. */
@Component({
    selector: 'app-lesson',
    templateUrl: './lesson.component.html',
    styleUrls: ['./lesson.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class LessonComponent implements OnInit, OnDestroy {
  lesson: Lesson | null = null;
  section: LearnSection | null = null;
  stepIndex = 0;
  /** Number of moves of the step's line currently played on the board. */
  ply = 0;
  chessBoard!: Chessboard;
  moveItems: MoveListItem[] = [];
  shapes: { circles: CircleAnnotation[]; arrows: ArrowAnnotation[] } | null =
    null;
  private subscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private rulesService: RulesService,
    private chessUtilsService: ChessUtilsService
  ) {}

  get step(): LessonStep {
    return (this.lesson as Lesson).steps[this.stepIndex];
  }

  get lineLength(): number {
    return this.step.moves?.length ?? 0;
  }

  /** The lesson's course if it has one, else its section. */
  private get course(): Course | undefined {
    return COURSES.find(course => course.id === this.lesson?.course);
  }

  get backLink(): string[] {
    const section = this.lesson?.section ?? '';
    const course = this.course;
    return course
      ? ['/learn', section, 'course', course.id]
      : ['/learn', section];
  }

  /** Lessons of a course follow its orientation; the others are seen by White. */
  get orientation(): Color {
    return this.course?.orientation ?? 'white';
  }

  get backTitle(): Localized | null {
    return this.course?.title ?? this.section?.title ?? null;
  }

  ngOnInit(): void {
    this.subscription = this.route.paramMap.subscribe(params => {
      this.section =
        LEARN_SECTIONS.find(s => s.id === params.get('section')) ?? null;
      this.lesson =
        LESSONS.find(
          l =>
            l.section === params.get('section') && l.id === params.get('lesson')
        ) ?? null;
      if (this.lesson) {
        this.goToStep(0);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  goToStep(index: number): void {
    if (!this.lesson || index < 0 || index >= this.lesson.steps.length) {
      return;
    }
    this.stepIndex = index;
    // notation of the whole line, computed once per step
    const fullLine = this.buildBoard(this.lineLength);
    this.moveItems = formatMoveList(
      fullLine.getHistory(),
      stepStartPosition(this.step).fullmoveNumber
    );
    this.goToPly(0);
  }

  goToPly(ply: number): void {
    this.ply = Math.max(0, Math.min(ply, this.lineLength));
    this.chessBoard = this.buildBoard(this.ply);
    // the shapes comment the position reached at the end of the line
    this.shapes =
      this.ply === this.lineLength
        ? this.toShapes(this.step.shapes ?? [])
        : null;
  }

  /** Arrow keys play through the line. */
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.lesson || this.lineLength === 0) {
      return;
    }
    if (event.key === 'ArrowRight') {
      this.goToPly(this.ply + 1);
      event.preventDefault();
    } else if (event.key === 'ArrowLeft') {
      this.goToPly(this.ply - 1);
      event.preventDefault();
    }
  }

  private buildBoard(plies: number): Chessboard {
    const board = new Chessboard(
      this.chessUtilsService,
      stepStartPosition(this.step).state
    );
    for (const uci of (this.step.moves ?? []).slice(0, plies)) {
      const { from, to } = parseUci(uci);
      this.rulesService.playMove(from, to, board);
    }
    return board;
  }

  private toShapes(shapes: LessonShape[]): {
    circles: CircleAnnotation[];
    arrows: ArrowAnnotation[];
  } {
    const circles: CircleAnnotation[] = [];
    const arrows: ArrowAnnotation[] = [];
    for (const shape of shapes) {
      if ('circle' in shape) {
        circles.push({
          square: toBoardSquare(shape.circle),
          color: shape.color,
        });
      } else {
        arrows.push({
          from: toBoardSquare(shape.from),
          to: toBoardSquare(shape.to),
          color: shape.color,
        });
      }
    }
    return { circles, arrows };
  }
}
