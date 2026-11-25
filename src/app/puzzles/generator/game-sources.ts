import { Injectable } from '@angular/core';

export type GamePlatform = 'lichess' | 'chesscom';
export const GAME_PLATFORMS: GamePlatform[] = ['lichess', 'chesscom'];

/** Time controls, as both platforms name them (ultra-bullet counts as bullet). */
export type GameSpeed =
  'bullet' | 'blitz' | 'rapid' | 'classical' | 'correspondence';
export const GAME_SPEEDS: GameSpeed[] = [
  'bullet',
  'blitz',
  'rapid',
  'classical',
  'correspondence',
];

/** A game fetched from a platform. */
export interface SourceGame {
  platform: GamePlatform;
  /** Id on the platform, unique for it. */
  id: string;
  url: string;
  pgn: string;
  white: string;
  black: string;
  speed: GameSpeed;
  /** When it was played, in ms since 1970. */
  date: number;
}

export interface FetchOptions {
  /** Number of games wanted (the most recent ones). */
  count: number;
  /** Time controls to keep; all of them when empty. */
  speeds: GameSpeed[];
}

/** Why the games could not be fetched (keys of the translations). */
export type FetchErrorKey =
  | 'puzzles.mine.error.userNotFound'
  | 'puzzles.mine.error.network'
  | 'puzzles.mine.error.noGames';

export class FetchGamesError extends Error {
  constructor(readonly key: FetchErrorKey) {
    super(key);
  }
}

/** Months of Chess.com archives read at most, to find enough games. */
const MAX_CHESSCOM_MONTHS = 24;

const LICHESS_SPEEDS: Record<string, GameSpeed> = {
  ultraBullet: 'bullet',
  bullet: 'bullet',
  blitz: 'blitz',
  rapid: 'rapid',
  classical: 'classical',
  correspondence: 'correspondence',
};

const CHESSCOM_SPEEDS: Record<string, GameSpeed> = {
  bullet: 'bullet',
  blitz: 'blitz',
  rapid: 'rapid',
  daily: 'correspondence',
};

/** Reads one line of the Lichess game export (ndjson, with pgnInJson). */
export function readLichessGame(json: unknown): SourceGame | null {
  const game = json as {
    id?: string;
    variant?: string;
    speed?: string;
    createdAt?: number;
    pgn?: string;
    players?: {
      white?: { user?: { name?: string } };
      black?: { user?: { name?: string } };
    };
  };
  const speed = LICHESS_SPEEDS[game.speed ?? ''];
  if (!game.id || game.variant !== 'standard' || !game.pgn || !speed) {
    return null;
  }
  return {
    platform: 'lichess',
    id: game.id,
    url: `https://lichess.org/${game.id}`,
    pgn: game.pgn,
    // the AI has no user name
    white: game.players?.white?.user?.name ?? '',
    black: game.players?.black?.user?.name ?? '',
    speed,
    date: game.createdAt ?? 0,
  };
}

/** Reads one game of a Chess.com monthly archive. */
export function readChessComGame(json: unknown): SourceGame | null {
  const game = json as {
    url?: string;
    uuid?: string;
    pgn?: string;
    rules?: string;
    time_class?: string;
    end_time?: number;
    white?: { username?: string };
    black?: { username?: string };
  };
  const speed = CHESSCOM_SPEEDS[game.time_class ?? ''];
  if (!game.url || game.rules !== 'chess' || !game.pgn || !speed) {
    return null;
  }
  return {
    platform: 'chesscom',
    id: game.uuid ?? game.url,
    url: game.url,
    pgn: game.pgn,
    white: game.white?.username ?? '',
    black: game.black?.username ?? '',
    speed,
    date: (game.end_time ?? 0) * 1000,
  };
}

/**
 * Fetches the most recent games of a player from the public APIs of Lichess
 * and Chess.com (no account needed, both allow requests from the browser).
 */
@Injectable({
  providedIn: 'root',
})
export class GameSourcesService {
  /** @throws FetchGamesError */
  async fetchGames(
    platform: GamePlatform,
    username: string,
    options: FetchOptions,
    signal?: AbortSignal
  ): Promise<SourceGame[]> {
    const games =
      platform === 'lichess'
        ? await this.fetchLichess(username, options, signal)
        : await this.fetchChessCom(username, options, signal);
    if (!games.length) {
      throw new FetchGamesError('puzzles.mine.error.noGames');
    }
    return games;
  }

  private async fetchLichess(
    username: string,
    { count, speeds }: FetchOptions,
    signal?: AbortSignal
  ): Promise<SourceGame[]> {
    const params = new URLSearchParams({
      max: String(count),
      pgnInJson: 'true',
      clocks: 'false',
      evals: 'false',
      opening: 'false',
    });
    if (speeds.length) {
      const perfs = speeds.flatMap(speed =>
        Object.keys(LICHESS_SPEEDS).filter(
          perf => LICHESS_SPEEDS[perf] === speed
        )
      );
      params.set('perfType', perfs.join(','));
    }
    const response = await this.get(
      `https://lichess.org/api/games/user/${encodeURIComponent(username)}?${params}`,
      signal,
      { Accept: 'application/x-ndjson' }
    );
    const text = await response.text();
    return text
      .split('\n')
      .filter(line => line.trim())
      .map(line => readLichessGame(JSON.parse(line)))
      .filter((game): game is SourceGame => game !== null);
  }

  /** Reads the monthly archives from the most recent until enough games. */
  private async fetchChessCom(
    username: string,
    { count, speeds }: FetchOptions,
    signal?: AbortSignal
  ): Promise<SourceGame[]> {
    const user = encodeURIComponent(username.toLowerCase());
    const index = (await (
      await this.get(
        `https://api.chess.com/pub/player/${user}/games/archives`,
        signal
      )
    ).json()) as { archives?: string[] };
    const months = (index.archives ?? []).slice().reverse();
    const games: SourceGame[] = [];
    for (const month of months.slice(0, MAX_CHESSCOM_MONTHS)) {
      const archive = (await (await this.get(month, signal)).json()) as {
        games?: unknown[];
      };
      const monthGames = (archive.games ?? [])
        .map(readChessComGame)
        .filter(
          (game): game is SourceGame =>
            game !== null && (!speeds.length || speeds.includes(game.speed))
        )
        .sort((a, b) => b.date - a.date);
      games.push(...monthGames);
      if (games.length >= count) {
        break;
      }
    }
    return games.slice(0, count);
  }

  private async get(
    url: string,
    signal?: AbortSignal,
    headers: Record<string, string> = {}
  ): Promise<Response> {
    let response: Response;
    try {
      response = await fetch(url, { signal, headers });
    } catch (error) {
      if (signal?.aborted) {
        throw error;
      }
      throw new FetchGamesError('puzzles.mine.error.network');
    }
    if (response.status === 404) {
      throw new FetchGamesError('puzzles.mine.error.userNotFound');
    }
    if (!response.ok) {
      throw new FetchGamesError('puzzles.mine.error.network');
    }
    return response;
  }
}
