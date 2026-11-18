import { TestBed } from '@angular/core/testing';
import { ChessUtilsService } from '../../chess-game/chess-utils.service';
import { Chessboard } from '../../chess-game/chessboard.model';
import { parseFen } from '../../chess-game/fen';
import { Color } from '../../chess-game/piece.model';
import { RulesService } from '../../chess-game/rules.service';
import { parseUci } from '../../puzzles/puzzle-moves';
import { LESSONS, PANOV_IQP_FEN } from './lesson.model';

/** Validates the lesson contents with the rules engine. */
describe('LESSONS', () => {
  let rules: RulesService;
  let utils: ChessUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    rules = TestBed.inject(RulesService);
    utils = TestBed.inject(ChessUtilsService);
  });

  /** Play a line on a board built from the FEN, failing on illegal moves. */
  const playLine = (fen: string, moves: string[] = []): Chessboard => {
    const board = new Chessboard(utils, parseFen(fen).state);
    for (const uci of moves) {
      const { from, to } = parseUci(uci);
      expect(rules.playMove(from, to, board))
        .withContext(`${uci} is legal`)
        .toBeTrue();
    }
    return board;
  };

  /** Pawns of this color on a file (0 = a). */
  const pawnsOnFile = (board: Chessboard, color: Color, file: number) =>
    board.getPieces().filter(row => row[file] === `${color}-pawn`).length;

  const isIsolated = (board: Chessboard, color: Color, file: number) =>
    pawnsOnFile(board, color, file) === 1 &&
    pawnsOnFile(board, color, file - 1) === 0 &&
    pawnsOnFile(board, color, file + 1) === 0;

  for (const lesson of LESSONS) {
    describe(lesson.id, () => {
      lesson.steps.forEach((step, index) => {
        it(`step ${index + 1} (${step.title.en}) has legal moves and shapes`, () => {
          playLine(step.fen, step.moves);
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
      const reached = playLine(panov.fen, panov.moves);
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
      const reached = playLine(tarrasch.fen, tarrasch.moves);
      expect(isIsolated(reached, 'black', 3))
        .withContext('d5 isolated')
        .toBeTrue();
      expect(reached.getPiece(3, 4)).toBe('black-pawn'); // d5
    });

    it('shows a white IQP on d4 in the introduction and the endgame', () => {
      for (const title of ['What is an IQP', 'Trade pieces']) {
        const board = playLine(step(title).fen);
        expect(board.getPiece(3, 3)).toBe('white-pawn'); // d4
        expect(isIsolated(board, 'white', 3))
          .withContext(title)
          .toBeTrue();
      }
    });
  });
});
