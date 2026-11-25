import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  colorOf,
  GameAnalysisService,
} from '../game-analysis/game-analysis.service';
import { GamePuzzleStoreService } from '../puzzles/generator/game-puzzle-store.service';
import {
  FetchErrorKey,
  FetchGamesError,
  GamePlatform,
  GameSourcesService,
  GameSpeed,
  SourceGame,
} from '../puzzles/generator/game-sources';
import { PuzzleGeneratorService } from '../puzzles/generator/puzzle-generator.service';
import { GameRecord } from './metrics';

/** Whose games, which time control, over how many days. */
export interface StatsQuery {
  platform: GamePlatform;
  username: string;
  /** null: every time control. */
  speed: GameSpeed | null;
  days: number;
}

export const PERIODS = [7, 14, 30, 90];
const DAY = 24 * 3600 * 1000;
/** Most games fetched (covers the period and the previous one). */
const MAX_GAMES = 300;

export type StatsErrorKey = FetchErrorKey | 'puzzles.mine.error.engine';

export interface StatsState {
  query: StatsQuery | null;
  status: 'idle' | 'fetching' | 'analysing' | 'puzzles' | 'done' | 'error';
  error: StatsErrorKey | null;
  /**
   * Games of the period and of the previous one (for the evolution), newest
   * first; their analysis is filled in as it goes.
   */
  records: GameRecord[];
  /** Analysed games, out of records.length. */
  analysed: number;
  /** Puzzles found in the player's games (own account only). */
  puzzlesFound: number;
  /** Start of the period (ms since 1970). */
  periodStart: number;
}

const IDLE: StatsState = {
  query: null,
  status: 'idle',
  error: null,
  records: [],
  analysed: 0,
  puzzlesFound: 0,
  periodStart: 0,
};

/**
 * Statistics of one player: fetches their games of the period (and of the
 * previous one, to show the evolution), then analyses them in the
 * background, newest first. For the player's own account, the analysed games
 * also feed the puzzle generator.
 */
export class PlayerStats {
  private readonly stateSubject = new BehaviorSubject<StatsState>(IDLE);
  readonly state$ = this.stateSubject.asObservable();
  /** Incremented by each load: an older load stops at its next step. */
  private run = 0;
  private abort: AbortController | null = null;

  constructor(
    private sources: GameSourcesService,
    private analysis: GameAnalysisService,
    private generator: PuzzleGeneratorService | null
  ) {}

  get state(): StatsState {
    return this.stateSubject.value;
  }

  get running(): boolean {
    return ['fetching', 'analysing', 'puzzles'].includes(this.state.status);
  }

  async load(query: StatsQuery): Promise<void> {
    this.stop();
    const run = ++this.run;
    const abort = new AbortController();
    this.abort = abort;
    const now = Date.now();
    const periodStart = now - query.days * DAY;
    this.stateSubject.next({
      ...IDLE,
      query,
      status: 'fetching',
      periodStart,
    });
    const current = () => run === this.run;
    try {
      const games = await this.sources.fetchGames(
        query.platform,
        query.username,
        {
          count: MAX_GAMES,
          speeds: query.speed ? [query.speed] : [],
          since: now - 2 * query.days * DAY,
        },
        abort.signal
      );
      const records = games
        .map(game => this.record(game, query.username))
        .filter((record): record is GameRecord => record !== null)
        .sort((a, b) => b.game.date - a.game.date);
      if (!current()) {
        return;
      }
      this.update({
        status: 'analysing',
        records,
        analysed: records.filter(record => record.values).length,
      });

      for (const record of records) {
        if (record.values) {
          continue;
        }
        const values = await this.analysis.analyse(record.game);
        if (!current()) {
          return;
        }
        if (values) {
          record.values = this.forPlayer(values, record);
        }
        this.update({
          records: [...this.state.records],
          analysed: this.state.analysed + 1,
        });
      }

      if (this.generator) {
        this.update({ status: 'puzzles' });
        for (const record of records) {
          const found = await this.generator.findPuzzles(
            record.game,
            query.username
          );
          if (!current()) {
            return;
          }
          this.update({ puzzlesFound: this.state.puzzlesFound + found });
        }
      }
      this.update({ status: 'done' });
    } catch (error) {
      if (current()) {
        this.update({
          status: 'error',
          error:
            error instanceof FetchGamesError
              ? error.key
              : 'puzzles.mine.error.engine',
        });
      }
    }
  }

  /** Stop the running load; what was analysed is kept. */
  stop(): void {
    if (this.running) {
      this.run++;
      this.abort?.abort();
      this.update({ status: 'done' });
    }
  }

  private record(game: SourceGame, username: string): GameRecord | null {
    const color = colorOf(game, username);
    const replayed = this.analysis.replay(game);
    if (!color || !replayed) {
      return null;
    }
    const isWhite = color === 'white';
    const firstPly = replayed.startsWithWhite === isWhite ? 0 : 1;
    const clocks = replayed.clocks
      .filter((_, ply) => ply % 2 === firstPly)
      .filter((clock): clock is number => clock !== null);
    const record: GameRecord = {
      game,
      color,
      score: game.winner === null ? 0.5 : game.winner === color ? 1 : 0,
      rating: isWhite ? game.whiteElo : game.blackElo,
      opponentRating: isWhite ? game.blackElo : game.whiteElo,
      opponent: isWhite ? game.black : game.white,
      opening: replayed.opening,
      plies: replayed.moves.length,
      firstPly,
      clocks,
      lostOnTime: game.onTime && game.winner !== null && game.winner !== color,
      values: null,
    };
    const cached = this.analysis.cached(game);
    if (cached) {
      record.values = this.forPlayer(cached, record);
    }
    return record;
  }

  /** From White's point of view to the player's. */
  private forPlayer(values: number[], record: GameRecord): number[] {
    return record.color === 'white' ? values : values.map(value => -value);
  }

  private update(change: Partial<StatsState>): void {
    this.stateSubject.next({ ...this.stateSubject.value, ...change });
  }
}

const SETTINGS_KEY = 'chess.stats.settings';

/** The two players followed by the Statistics pages: the user, and a scouted one. */
@Injectable({
  providedIn: 'root',
})
export class StatsService {
  /** The user's own account (My statistics, Game history). */
  readonly mine: PlayerStats;
  /** Another player (Scouting). */
  readonly scouting: PlayerStats;

  constructor(
    sources: GameSourcesService,
    analysis: GameAnalysisService,
    generator: PuzzleGeneratorService,
    private puzzleStore: GamePuzzleStoreService
  ) {
    this.mine = new PlayerStats(sources, analysis, generator);
    this.scouting = new PlayerStats(sources, analysis, null);
  }

  /** Last query of each page, or defaults from the puzzle generator's form. */
  loadQuery(page: 'mine' | 'scouting'): StatsQuery {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
      if (saved[page]) {
        return saved[page] as StatsQuery;
      }
    } catch {
      // fall back to the defaults
    }
    const generator = this.puzzleStore.loadSettings();
    return {
      platform: generator?.platform ?? 'lichess',
      username: page === 'mine' ? (generator?.username ?? '') : '',
      speed: null,
      days: 14,
    };
  }

  saveQuery(page: 'mine' | 'scouting', query: StatsQuery): void {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
      saved[page] = query;
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(saved));
    } catch {
      // storage unavailable: the form is just not remembered
    }
  }
}
