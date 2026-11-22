import { TestBed } from '@angular/core/testing';
import { ChessUtilsService } from '../chess-game/chess-utils.service';
import { Chessboard } from '../chess-game/chessboard.model';
import { RulesService } from '../chess-game/rules.service';
import { parseUci } from '../puzzles/puzzle-moves';
import { openingPositionKey, OpeningService } from './opening.service';
import { OPENINGS } from './openings';

describe('OPENINGS', () => {
  let rules: RulesService;
  let utils: ChessUtilsService;
  let service: OpeningService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    rules = TestBed.inject(RulesService);
    utils = TestBed.inject(ChessUtilsService);
    service = TestBed.inject(OpeningService);
  });

  /** Play a line from the initial position, failing on illegal moves. */
  const play = (moves: string): Chessboard => {
    const board = new Chessboard(utils);
    for (const uci of moves.split(' ')) {
      const { from, to } = parseUci(uci);
      expect(rules.playMove(from, to, board))
        .withContext(`${uci} is legal in ${moves}`)
        .toBeTrue();
    }
    return board;
  };

  for (const opening of OPENINGS) {
    it(`${opening.eco} ${opening.name.en} is a legal line`, () => {
      const board = play(opening.moves);
      expect(opening.eco).toMatch(/^[A-E]\d\d$/);
      expect(opening.name.fr).toBeTruthy();
      expect(openingPositionKey(board.saveState())).toBe(
        openingPositionKey(service.positionOf(opening))
      );
      expect(service.identify(board)).toBe(opening);
    });
  }

  it('gives a distinct position to every opening', () => {
    const seen = new Map<string, string>();
    for (const opening of OPENINGS) {
      const key = openingPositionKey(service.positionOf(opening));
      expect(seen.get(key))
        .withContext(`${opening.name.en} reaches the same position`)
        .toBeUndefined();
      seen.set(key, opening.name.en);
    }
  });

  describe('identify', () => {
    const ecoOf = (moves: string) => service.identify(play(moves))?.eco;

    it('is null before the first move and outside known openings', () => {
      expect(service.identify(new Chessboard(utils))).toBeNull();
      expect(ecoOf('h2h3')).toBeUndefined();
    });

    it('gives the same code whatever the move order', () => {
      // 1.d4 Nf6 2.c4 e6 3.Nf3 b6 / 1.Nf3 Nf6 2.c4 e6 3.d4 b6 / 1.c4 e6 2.d4 Nf6 3.Nf3 b6
      expect(ecoOf('d2d4 g8f6 c2c4 e7e6 g1f3 b7b6')).toBe('E12');
      expect(ecoOf('g1f3 g8f6 c2c4 e7e6 d2d4 b7b6')).toBe('E12');
      expect(ecoOf('c2c4 e7e6 d2d4 g8f6 g1f3 b7b6')).toBe('E12');
      // 1.e4 e5 2.Bb5 Nc6 3.Nf3: Ruy Lopez
      expect(ecoOf('e2e4 e7e5 f1b5 b8c6 g1f3')).toBe('C60');
      // 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 via 2.Nc3 ... 3.Nf3
      expect(ecoOf('e2e4 c7c5 b1c3 d7d6 g1f3 g8f6 d2d4 c5d4 f3d4 a7a6')).toBe(
        'B90'
      );
    });

    it('keeps the last known opening after leaving the known lines', () => {
      expect(ecoOf('e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6 h2h3')).toBe(
        'B90'
      );
    });

    it('follows the game as it goes deeper', () => {
      expect(ecoOf('e2e4')).toBe('B00');
      expect(ecoOf('e2e4 e7e5')).toBe('C20');
      expect(ecoOf('e2e4 e7e5 g1f3 b8c6 f1c4')).toBe('C50');
    });
  });
});
