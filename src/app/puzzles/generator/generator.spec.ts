import { EngineLine, parseMultiPvInfo } from './batch-engine';
import { readChessComGame, readLichessGame } from './game-sources';
import { classifyMove, isOnlyMove, winChances } from './puzzle-finder';

const line = (cp: number | null, mate: number | null = null): EngineLine => ({
  cp,
  mate,
  pv: ['e2e4'],
});

describe('winChances', () => {
  it('is 0 for an equal position and symmetric', () => {
    expect(winChances(line(0))).toBe(0);
    expect(winChances(line(300))).toBeCloseTo(-winChances(line(-300)), 10);
  });

  it('is about 0.5 at +3 and saturates for big advantages', () => {
    expect(winChances(line(300))).toBeCloseTo(0.5, 1);
    expect(winChances(line(5000))).toBe(winChances(line(1000)));
  });

  it('is 1 for a mate, -1 when mated', () => {
    expect(winChances(line(null, 3))).toBe(1);
    expect(winChances(line(null, -2))).toBe(-1);
    expect(winChances(line(null, 0))).toBe(-1);
  });
});

describe('classifyMove', () => {
  it('ignores good enough moves', () => {
    expect(classifyMove(0, 0.2, 0.1)).toBeNull();
    expect(classifyMove(0, 0.9, 0.8)).toBeNull();
  });

  it('finds a missed chance after the opponent’s mistake', () => {
    // equal, then the opponent blunders (+5), the player misses it (=)
    expect(classifyMove(0, 0.8, 0)).toBe('missed');
    expect(classifyMove(null, 0.8, 0)).toBe('missed');
  });

  it('calls a drop from an already winning position a blunder', () => {
    // winning for a while: nothing new to find, but the player spoiled it
    expect(classifyMove(0.8, 0.8, 0)).toBe('blunder');
  });

  it('finds a blunder from a balanced position', () => {
    expect(classifyMove(0, 0, -0.6)).toBe('blunder');
  });

  it('ignores mistakes in lost positions', () => {
    expect(classifyMove(-0.6, -0.6, -1)).toBeNull();
  });
});

describe('isOnlyMove', () => {
  it('needs the best move to be much better than the second', () => {
    expect(isOnlyMove([line(400), line(0)])).toBeTrue();
    expect(isOnlyMove([line(400), line(350)])).toBeFalse();
  });

  it('accepts a mate when the second move does not mate', () => {
    expect(isOnlyMove([line(null, 3), line(500)])).toBeTrue();
    expect(isOnlyMove([line(null, 3), line(null, 4)])).toBeFalse();
  });

  it('always accepts a mate in one (any mate is accepted)', () => {
    expect(isOnlyMove([line(null, 1), line(null, 1)])).toBeTrue();
  });

  it('rejects forced moves and finished games', () => {
    expect(isOnlyMove([line(400)])).toBeFalse();
    expect(isOnlyMove([])).toBeFalse();
    expect(isOnlyMove([{ cp: null, mate: 0, pv: [] }])).toBeFalse();
  });
});

describe('parseMultiPvInfo', () => {
  it('reads the line number, score and moves', () => {
    expect(
      parseMultiPvInfo(
        'info depth 12 seldepth 18 multipv 2 score cp -35 nodes 1 nps 1 pv e7e5 g1f3 b8c6'
      )
    ).toEqual({
      multipv: 2,
      cp: -35,
      mate: null,
      pv: ['e7e5', 'g1f3', 'b8c6'],
    });
  });

  it('reads mates, including a finished game', () => {
    expect(parseMultiPvInfo('info depth 5 score mate 2 pv d1h5 g7g6')?.mate).toBe(2);
    expect(parseMultiPvInfo('info depth 0 score mate 0')).toEqual({
      multipv: 1,
      cp: null,
      mate: 0,
      pv: [],
    });
  });

  it('ignores bounds and lines without score', () => {
    expect(
      parseMultiPvInfo('info depth 9 score cp 20 lowerbound pv e2e4')
    ).toBeNull();
    expect(parseMultiPvInfo('info string NNUE enabled')).toBeNull();
  });
});

describe('readLichessGame', () => {
  const game = {
    id: 'OQdj4UKz',
    variant: 'standard',
    speed: 'ultraBullet',
    createdAt: 1700000000000,
    pgn: '1. e4 e5',
    status: 'outoftime',
    winner: 'black',
    players: {
      white: { user: { name: 'Alice' }, rating: 1500 },
      black: { aiLevel: 3 },
    },
  };

  it('reads a standard game', () => {
    expect(readLichessGame(game)).toEqual({
      platform: 'lichess',
      id: 'OQdj4UKz',
      url: 'https://lichess.org/OQdj4UKz',
      pgn: '1. e4 e5',
      white: 'Alice',
      black: '',
      speed: 'bullet',
      date: 1700000000000,
      whiteElo: 1500,
      blackElo: null,
      winner: 'black',
      onTime: true,
    });
  });

  it('skips variants', () => {
    expect(readLichessGame({ ...game, variant: 'chess960' })).toBeNull();
  });
});

describe('readChessComGame', () => {
  const game = {
    url: 'https://www.chess.com/game/live/1',
    uuid: 'abc',
    pgn: '1. e4 e5',
    rules: 'chess',
    time_class: 'daily',
    end_time: 1704133706,
    white: { username: 'Hikaru', rating: 3236, result: 'agreed' },
    black: { username: 'Bob', rating: 2865, result: 'agreed' },
  };

  it('reads a game, daily games being correspondence', () => {
    expect(readChessComGame(game)).toEqual({
      platform: 'chesscom',
      id: 'abc',
      url: 'https://www.chess.com/game/live/1',
      pgn: '1. e4 e5',
      white: 'Hikaru',
      black: 'Bob',
      speed: 'correspondence',
      date: 1704133706000,
      whiteElo: 3236,
      blackElo: 2865,
      winner: null,
      onTime: false,
    });
  });

  it('skips variants', () => {
    expect(readChessComGame({ ...game, rules: 'chess960' })).toBeNull();
  });
});
