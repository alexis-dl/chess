import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChessUtilsService } from 'src/app/chess-game/chess-utils.service';
import { Chessboard } from 'src/app/chess-game/chessboard.model';
import { formatMoveList } from 'src/app/chess-game/move-list';
import { RulesService } from 'src/app/chess-game/rules.service';
import { Opening } from 'src/app/openings/openings';
import { parseUci } from 'src/app/puzzles/puzzle-moves';
import { LEARN_SECTIONS } from '../learn.component';
import { buildQuiz, QuizQuestion } from './opening-quiz';

/** Guess the opening from its position, among a few choices. */
@Component({
  selector: 'app-opening-quiz',
  templateUrl: './opening-quiz.component.html',
  styleUrls: ['./opening-quiz.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class OpeningQuizComponent {
  readonly section = LEARN_SECTIONS.find(s => s.id === 'opening')!;

  questions: QuizQuestion[] = [];
  index = 0;
  score = 0;
  /** Choice of the user for the current question, null before answering. */
  picked: Opening | null = null;
  finished = false;
  chessBoard!: Chessboard;
  /** Line of the answer, e.g. '1. e4 c5 2. Nf3 d6', shown once answered. */
  line = '';

  constructor(
    private rulesService: RulesService,
    private chessUtilsService: ChessUtilsService
  ) {
    this.restart();
  }

  get question(): QuizQuestion {
    return this.questions[this.index];
  }

  get isLast(): boolean {
    return this.index === this.questions.length - 1;
  }

  restart(): void {
    this.questions = buildQuiz();
    this.index = 0;
    this.score = 0;
    this.finished = false;
    this.showQuestion();
  }

  pick(choice: Opening): void {
    if (this.picked) {
      return;
    }
    this.picked = choice;
    if (choice === this.question.answer) {
      this.score++;
    }
  }

  next(): void {
    if (this.isLast) {
      this.finished = true;
    } else {
      this.index++;
      this.showQuestion();
    }
  }

  private showQuestion(): void {
    this.picked = null;
    const board = new Chessboard(this.chessUtilsService);
    for (const uci of this.question.answer.moves.split(' ')) {
      const { from, to } = parseUci(uci);
      this.rulesService.playMove(from, to, board);
    }
    this.chessBoard = board;
    this.line = formatMoveList(board.getHistory())
      .map(item => item.label)
      .join(' ');
  }
}
