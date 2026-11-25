import { SourceGame } from '../puzzles/generator/game-sources';
import {
  computeMetrics,
  GameRecord,
  openingScore,
  repertoire,
  results,
  rollingAverage,
  tacticalChances,
  timeTrouble,
} from './metrics';

const game = (date: number): SourceGame => ({
  platform: 'lichess',
  id: String(date),
  url: '',
  pgn: '',
  white: 'me',
  black: 'you',
  speed: 'blitz',
  date,
  whiteElo: 1500,
  blackElo: 1500,
  winner: null,
  onTime: false,
});

const record = (change: Partial<GameRecord> = {}): GameRecord => ({
  game: game(change.game?.date ?? 1),
  color: 'white',
  score: 0.5,
  rating: 1500,
  opponentRating: 1500,
  opponent: 'you',
  opening: null,
  plies: 0,
  firstPly: 0,
  clocks: [],
  lostOnTime: false,
  values: null,
  ...change,
});

describe('metrics', () => {
  it('judges the opening at the 20th ply, or at the end of a short game', () => {
    const values = Array.from({ length: 30 }, (_, ply) => (ply === 20 ? 0.5 : 0));
    expect(openingScore(record({ values }))).toBe(75);
    expect(openingScore(record({ values: [0, -1] }))).toBe(0);
    expect(openingScore(record())).toBeNull();
  });

  it('counts the chances given by the opponent and those taken', () => {
    // White moves at even plies. Ply 1 (Black) blunders: 0 -> 0.6 at ply 2;
    // White keeps it (0.6 at ply 3). Ply 3 (Black) blunders again: 0.6 -> 1
    // at ply 4, White throws it away (0.2 at ply 5).
    const values = [0, 0, 0.6, 0.6, 1, 0.2, 0.2];
    expect(tacticalChances(record({ values }))).toEqual({
      chances: 2,
      taken: 1,
    });
  });

  it('sees time trouble from the clocks, or a loss on time', () => {
    expect(timeTrouble(record({ clocks: [180, 120, 30] }))).toBeFalse();
    expect(timeTrouble(record({ clocks: [180, 120, 10] }))).toBeTrue();
    expect(timeTrouble(record({ lostOnTime: true }))).toBeTrue();
    expect(timeTrouble(record())).toBeNull();
  });

  it('computes conversion and resourcefulness from the scores', () => {
    const metrics = computeMetrics([
      record({ values: [0, 0.8, 1], score: 1 }),
      record({ values: [0, 0.8, -1], score: 0 }),
      record({ values: [0, -0.8, 0], score: 0.5 }),
    ]);
    expect(metrics.conversion.value).toBe(50);
    expect(metrics.conversion.sample).toBe(2);
    // the second game was both winning and losing: it counts for both
    expect(metrics.resourcefulness.value).toBe(25);
    expect(metrics.resourcefulness.sample).toBe(2);
    expect(metrics.opening.value).not.toBeNull();
    expect(metrics.time.value).toBeNull(); // no clocks
  });

  it('counts the results and groups the repertoire by opening', () => {
    const opening = { eco: 'B12', name: { en: 'Caro', fr: 'Caro' }, moves: 'e2e4 c7c6' };
    const games = [
      record({ score: 1, opening }),
      record({ score: 0, opening }),
      record({ score: 0.5 }),
      record({ score: 1, color: 'black', opening }),
    ];
    expect(results(games)).toEqual({ wins: 2, draws: 1, losses: 1 });
    const lines = repertoire(games, 'white');
    expect(lines.length).toBe(2);
    expect(lines[0]).toEqual(
      jasmine.objectContaining({ opening, games: 2, wins: 1, losses: 1, score: 50 })
    );
  });

  it('smooths a series with a rolling average', () => {
    expect(rollingAverage([0, 100, 50], 2)).toEqual([0, 50, 75]);
  });
});
