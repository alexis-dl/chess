import { TestBed } from '@angular/core/testing';
import { ChessUtilsService } from '../../chess-game/chess-utils.service';
import { Chessboard } from '../../chess-game/chessboard.model';
import { parseFen } from '../../chess-game/fen';
import { Color } from '../../chess-game/piece.model';
import { RulesService } from '../../chess-game/rules.service';
import { parseUci } from '../../puzzles/puzzle-moves';
import { ENDGAME_THEMES } from '../endgame-themes';
import { COURSES } from '../courses';
import { stepStartPosition } from './lesson-position';
import { LESSONS, LessonStep, PANOV_IQP_FEN } from './lesson.model';

/** Validates the lesson contents with the rules engine. */
describe('LESSONS', () => {
  let rules: RulesService;
  let utils: ChessUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    rules = TestBed.inject(RulesService);
    utils = TestBed.inject(ChessUtilsService);
  });

  /** Play moves on a board, failing on illegal ones. */
  const play = (board: Chessboard, moves: string[]): Chessboard => {
    for (const uci of moves) {
      const { from, to } = parseUci(uci);
      expect(rules.playMove(from, to, board))
        .withContext(`${uci} is legal`)
        .toBeTrue();
    }
    return board;
  };

  /**
   * Board at the start of a step (from its FEN, or by playing its `start`
   * moves from the initial position), then after its line.
   */
  const playStep = (step: LessonStep, withLine = true): Chessboard => {
    const board = step.fen
      ? new Chessboard(utils, parseFen(step.fen).state)
      : play(new Chessboard(utils), step.start?.split(' ') ?? []);
    return withLine ? play(board, step.moves ?? []) : board;
  };

  it('lists every course lesson in its course, exactly once', () => {
    for (const course of COURSES) {
      const ids = course.groups.flatMap(group => group.lessons);
      expect(new Set(ids).size).withContext(course.id).toBe(ids.length);
      for (const id of ids) {
        const lesson = LESSONS.find(l => l.id === id);
        expect(lesson).withContext(`${id} exists`).toBeDefined();
        expect(lesson?.course).withContext(`${id} course`).toBe(course.id);
        expect(lesson?.section).withContext(`${id} section`).toBe(course.section);
      }
    }
    for (const lesson of LESSONS.filter(l => l.course)) {
      const course = COURSES.find(c => c.id === lesson.course);
      expect(course?.groups.some(g => g.lessons.includes(lesson.id)))
        .withContext(`${lesson.id} is listed by its course`)
        .toBeTrue();
    }
  });

  it('has distinct lesson ids', () => {
    const ids = LESSONS.map(lesson => lesson.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  /** Pawns of this color on a file (0 = a). */
  const pawnsOnFile = (board: Chessboard, color: Color, file: number) =>
    board.getPieces().filter(row => row[file] === `${color}-pawn`).length;

  const isIsolated = (board: Chessboard, color: Color, file: number) =>
    pawnsOnFile(board, color, file) === 1 &&
    pawnsOnFile(board, color, file - 1) === 0 &&
    pawnsOnFile(board, color, file + 1) === 0;

  it('gives a theme to every endgame lesson, and to them only', () => {
    const themes = ENDGAME_THEMES.map(theme => theme.id);
    for (const lesson of LESSONS) {
      if (lesson.section === 'endgame') {
        expect(themes)
          .withContext(`${lesson.id} has an endgame theme`)
          .toContain(lesson.endgameTheme!);
      } else {
        expect(lesson.endgameTheme)
          .withContext(`${lesson.id} is not an endgame`)
          .toBeUndefined();
      }
    }
  });

  for (const lesson of LESSONS) {
    describe(lesson.id, () => {
      lesson.steps.forEach((step, index) => {
        it(`step ${index + 1} (${step.title.en}) has legal moves and shapes`, () => {
          expect(!!step.fen !== !!step.start)
            .withContext('exactly one of fen and start')
            .toBeTrue();
          // the start position computed for the page is the one played here
          const start = playStep(step, false).saveState();
          const computed = stepStartPosition(step).state;
          expect(computed.pieces).toEqual(start.pieces);
          expect(computed.isWhiteTurn).toBe(start.isWhiteTurn);
          expect(computed.castlingRights).toEqual(start.castlingRights);
          playStep(step);
          for (const shape of step.shapes ?? []) {
            const squares =
              'circle' in shape ? [shape.circle] : [shape.from, shape.to];
            for (const square of squares) {
              expect(square).toMatch(/^[a-h][1-8]$/);
            }
          }
        });
      });
    });
  }

  describe('iqp', () => {
    const iqp = LESSONS.find(lesson => lesson.id === 'iqp');
    const step = (title: string) => {
      const found = iqp?.steps.find(s => s.title.en.startsWith(title));
      if (!found) {
        throw new Error(`no step ${title}`);
      }
      return found;
    };

    it('reaches the Panov IQP position by playing the Panov line', () => {
      const panov = step('Reaching it');
      const reached = playStep(panov);
      const expected = parseFen(PANOV_IQP_FEN).state;
      expect(reached.saveState().pieces).toEqual(expected.pieces);
      expect(reached.getIsWhiteTurn()).toBe(expected.isWhiteTurn);
      expect(reached.getCastlingRights()).toEqual(expected.castlingRights);
      expect(isIsolated(reached, 'white', 3))
        .withContext('d4 isolated')
        .toBeTrue();
    });

    it('gives Black an IQP in the Tarrasch line', () => {
      const tarrasch = step('Black can have it too');
      const reached = playStep(tarrasch);
      expect(isIsolated(reached, 'black', 3))
        .withContext('d5 isolated')
        .toBeTrue();
      expect(reached.getPiece(3, 4)).toBe('black-pawn'); // d5
    });

    it('shows a white IQP on d4 in the introduction and the endgame', () => {
      for (const title of ['What is an IQP', 'Trade pieces']) {
        const board = playStep(step(title), false);
        expect(board.getPiece(3, 3)).toBe('white-pawn'); // d4
        expect(isIsolated(board, 'white', 3))
          .withContext(title)
          .toBeTrue();
      }
    });
  });
});
