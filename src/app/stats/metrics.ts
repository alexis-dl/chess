import type { Color } from '../chess-game/piece.model';
import type { Opening } from '../openings/openings';
import type { SourceGame } from '../puzzles/generator/game-sources';
import { BLUNDER_DROP, WINNING } from '../puzzles/generator/puzzle-finder';

/** One game seen from one player. */
export interface GameRecord {
  game: SourceGame;
  color: Color;
  /** 1 win, 0.5 draw, 0 loss. */
  score: number;
  rating: number | null;
  opponentRating: number | null;
  opponent: string;
  opening: Opening | null;
  /** Number of half-moves. */
  plies: number;
  /** Ply of the player's first move: 0 or 1. */
  firstPly: number;
  /** The player's clock after each of their moves (s); empty if unknown. */
  clocks: number[];
  /** The player lost on time. */
  lostOnTime: boolean;
  /** The player's winning chances in every position; null until analysed. */
  values: number[] | null;
}

/** An indicator, as a percentage, over a set of games. */
export interface Metric {
  /** 0 to 100; null when no game says anything about it. */
  value: number | null;
  /** Games (or moments, for tactics) it was measured on. */
  sample: number;
  /** One value per game where it applies, oldest first (for the chart). */
  perGame: number[];
}

export type MetricId =
  'opening' | 'tactics' | 'conversion' | 'resourcefulness' | 'time';
export const METRIC_IDS: MetricId[] = [
  'opening',
  'tactics',
  'conversion',
  'resourcefulness',
  'time',
];

/** Ply at which the opening is judged: after the 10th move of each side. */
export const OPENING_PLY = 20;
/** Under this share of the starting time, the player is short of time. */
export const TIME_TROUBLE = 0.1;

const percent = (winChances: number) => Math.round(50 * (1 + winChances));

/** Expected score after the opening (0 to 100), from the analysis. */
export function openingScore(record: GameRecord): number | null {
  const values = record.values;
  if (!values || values.length < 2) {
    return null;
  }
  return percent(values[Math.min(OPENING_PLY, values.length - 1)]);
}

/**
 * Chances given by the opponent (a move that improved the player's winning
 * chances by a blunder's worth), and how many of them the player took (did
 * not give the gain back on the next move).
 */
export function tacticalChances(record: GameRecord): {
  chances: number;
  taken: number;
} {
  const values = record.values;
  let chances = 0;
  let taken = 0;
  if (values) {
    // the player's moves, from the first one that follows a move of the opponent
    for (let ply = record.firstPly || 2; ply < values.length - 1; ply += 2) {
      if (values[ply] - values[ply - 1] >= BLUNDER_DROP) {
        chances++;
        if (values[ply] - values[ply + 1] < BLUNDER_DROP) {
          taken++;
        }
      }
    }
  }
  return { chances, taken };
}

/** The player was winning at some point (about +3 or more). */
export function hadAdvantage(record: GameRecord): boolean {
  return !!record.values?.some(value => value >= WINNING);
}

/** The player was losing at some point (about -3 or less). */
export function wasLosing(record: GameRecord): boolean {
  return !!record.values?.some(value => value <= -WINNING);
}

/**
 * Whether the player got short of time (under a tenth of their starting
 * time, or lost on time); null without clocks.
 */
export function timeTrouble(record: GameRecord): boolean | null {
  if (record.lostOnTime) {
    return true;
  }
  if (record.clocks.length < 2) {
    return null;
  }
  const start = Math.max(record.clocks[0], 1);
  return Math.min(...record.clocks) < TIME_TROUBLE * start;
}

function metric(perGame: number[], value?: number | null): Metric {
  const average = perGame.length
    ? Math.round(perGame.reduce((a, b) => a + b, 0) / perGame.length)
    : null;
  return {
    value: value === undefined ? average : value,
    sample: perGame.length,
    perGame,
  };
}

/** The indicators over a set of games (in any order). */
export function computeMetrics(
  records: GameRecord[]
): Record<MetricId, Metric> {
  const games = [...records].sort((a, b) => a.game.date - b.game.date);

  const opening = games
    .map(openingScore)
    .filter((value): value is number => value !== null);

  let chances = 0;
  let taken = 0;
  const tacticsPerGame: number[] = [];
  for (const record of games) {
    const moments = tacticalChances(record);
    chances += moments.chances;
    taken += moments.taken;
    if (moments.chances) {
      tacticsPerGame.push(Math.round((100 * moments.taken) / moments.chances));
    }
  }
  const tactics = metric(
    tacticsPerGame,
    chances ? Math.round((100 * taken) / chances) : null
  );
  tactics.sample = chances;

  const conversion = games
    .filter(hadAdvantage)
    .map(record => 100 * record.score);
  const resourcefulness = games
    .filter(wasLosing)
    .map(record => 100 * record.score);
  const time = games
    .map(timeTrouble)
    .filter((value): value is boolean => value !== null)
    .map(trouble => (trouble ? 0 : 100));

  return {
    opening: metric(opening),
    tactics,
    conversion: metric(conversion),
    resourcefulness: metric(resourcefulness),
    time: metric(time),
  };
}

/** Wins, draws and losses. */
export function results(records: GameRecord[]): {
  wins: number;
  draws: number;
  losses: number;
} {
  return {
    wins: records.filter(record => record.score === 1).length,
    draws: records.filter(record => record.score === 0.5).length,
    losses: records.filter(record => record.score === 0).length,
  };
}

/** Rolling average, to smooth a chart (the first values use fewer games). */
export function rollingAverage(values: number[], window = 5): number[] {
  return values.map((_, index) => {
    const slice = values.slice(Math.max(0, index - window + 1), index + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

/** One opening of a player's repertoire, with one color. */
export interface RepertoireLine {
  opening: Opening | null;
  games: number;
  wins: number;
  draws: number;
  losses: number;
  /** Average score, 0 to 100. */
  score: number;
}

/** Openings played with one color, the most played first. */
export function repertoire(
  records: GameRecord[],
  color: Color
): RepertoireLine[] {
  const lines = new Map<string, RepertoireLine>();
  for (const record of records.filter(r => r.color === color)) {
    const key = record.opening?.eco + '|' + (record.opening?.moves ?? '');
    const line = lines.get(key) ?? {
      opening: record.opening,
      games: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      score: 0,
    };
    line.games++;
    if (record.score === 1) {
      line.wins++;
    } else if (record.score === 0.5) {
      line.draws++;
    } else {
      line.losses++;
    }
    lines.set(key, line);
  }
  return [...lines.values()]
    .map(line => ({
      ...line,
      score: Math.round((100 * (line.wins + line.draws / 2)) / line.games),
    }))
    .sort((a, b) => b.games - a.games);
}
