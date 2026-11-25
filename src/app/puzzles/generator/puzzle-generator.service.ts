import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EngineQueueService } from '../../game-analysis/engine-queue.service';
import {
  colorOf,
  GameAnalysisService,
  ReplayedGame,
} from '../../game-analysis/game-analysis.service';
import { EngineLine } from './batch-engine';
import { gameKey, GamePuzzle, GamePuzzleGoal } from './game-puzzle.model';
import { GamePuzzleStoreService } from './game-puzzle-store.service';
import {
  FetchErrorKey,
  FetchGamesError,
  FetchOptions,
  GamePlatform,
  GameSourcesService,
  SourceGame,
} from './game-sources';
import {
  classifyMove,
  GamePuzzleKind,
  isOnlyMove,
  WINNING,
  winChances,
} from './puzzle-finder';

/** Deeper look at the positions that may become puzzles. */
const CHECK_DEPTH = 16;
/** Longest solution, in moves of the solver. */
const MAX_MATE_MOVES = 5;
const MAX_MOVES = 2;

export type GeneratorErrorKey = FetchErrorKey | 'puzzles.mine.error.engine';

export interface GeneratorState {
  status: 'idle' | 'fetching' | 'analysing' | 'done' | 'error';
  /** From 0 to 1, while analysing. */
  progress: number;
  /** Games to analyse (those not analysed before). */
  gamesTotal: number;
  gamesDone: number;
  /** Games fetched but already analysed by a previous run. */
  gamesSkipped: number;
  /** Puzzles found by this run. */
  found: number;
  error: GeneratorErrorKey | null;
}

const IDLE: GeneratorState = {
  status: 'idle',
  progress: 0,
  gamesTotal: 0,
  gamesDone: 0,
  gamesSkipped: 0,
  found: 0,
  error: null,
};

/**
 * Turns the player's games into puzzles: the shared analysis of a game
 * (GameAnalysisService) spots the moves that lost a lot (classifyMove), then
 * a deeper search keeps the positions where the best move is the only good
 * one (isOnlyMove). Runs in the background: the generation goes on when
 * leaving the page. The statistics use findPuzzles on the games they analyse.
 */
@Injectable({
  providedIn: 'root',
})
export class PuzzleGeneratorService implements OnDestroy {
  private readonly stateSubject = new BehaviorSubject<GeneratorState>(IDLE);
  readonly state$ = this.stateSubject.asObservable();
  private abort: AbortController | null = null;

  constructor(
    private sources: GameSourcesService,
    private store: GamePuzzleStoreService,
    private analysis: GameAnalysisService,
    private engine: EngineQueueService
  ) {}

  get running(): boolean {
    const { status } = this.stateSubject.value;
    return status === 'fetching' || status === 'analysing';
  }

  async generate(
    platform: GamePlatform,
    username: string,
    options: FetchOptions
  ): Promise<void> {
    if (this.running) {
      return;
    }
    const abort = new AbortController();
    this.abort = abort;
    this.setState({ ...IDLE, status: 'fetching' });
    try {
      const games = await this.sources.fetchGames(
        platform,
        username,
        options,
        abort.signal
      );
      const fresh = games.filter(
        game => !this.store.isAnalysed(gameKey(game.platform, game.id))
      );
      this.setState({
        status: 'analysing',
        gamesTotal: fresh.length,
        gamesSkipped: games.length - fresh.length,
      });
      for (const game of fresh) {
        if (abort.signal.aborted) {
          return;
        }
        const found = await this.findPuzzles(game, username);
        const state = this.stateSubject.value;
        const gamesDone = state.gamesDone + 1;
        this.setState({
          gamesDone,
          found: state.found + found,
          progress: gamesDone / fresh.length,
        });
      }
      this.setState({ status: 'done', progress: 1 });
    } catch (error) {
      if (abort.signal.aborted) {
        return; // cancelled: the state was already reset
      }
      this.setState({
        status: 'error',
        error:
          error instanceof FetchGamesError
            ? error.key
            : 'puzzles.mine.error.engine',
      });
    } finally {
      if (this.abort === abort) {
        this.abort = null;
      }
    }
  }

  /** Stop the running generation; the puzzles found so far are kept. */
  cancel(): void {
    if (!this.running) {
      return;
    }
    // stops at the next game: the shared engine is not stopped, the
    // statistics may be using it
    this.abort?.abort();
    this.setState({ status: 'done' });
  }

  ngOnDestroy(): void {
    this.cancel();
  }

  /**
   * Adds the puzzles of one game of the player to the store, once per game.
   * @returns the number of puzzles found
   * @throws when the engine is stopped
   */
  async findPuzzles(game: SourceGame, username: string): Promise<number> {
    const key = gameKey(game.platform, game.id);
    const color = colorOf(game, username);
    const replayed = this.analysis.replay(game);
    if (this.store.isAnalysed(key) || !color || !replayed) {
      return 0;
    }
    const values = await this.analysis.analyse(game);
    if (!values) {
      return 0;
    }
    const playerIsWhite = color === 'white';
    // the player's winning chances in every position
    const player = values.map(value => (playerIsWhite ? value : -value));
    let found = 0;
    for (let ply = 0; ply < replayed.moves.length; ply++) {
      const whiteToMove = replayed.startsWithWhite === (ply % 2 === 0);
      if (whiteToMove !== playerIsWhite) {
        continue; // the opponent's move
      }
      const kind = classifyMove(
        ply > 0 ? player[ply - 1] : null,
        player[ply],
        player[ply + 1]
      );
      if (kind) {
        const puzzle = await this.makePuzzle(
          game,
          replayed,
          playerIsWhite,
          ply,
          kind,
          player
        );
        if (puzzle) {
          this.store.add(puzzle);
          found++;
        }
      }
    }
    this.store.markAnalysed(key);
    return found;
  }

  /** Checks a candidate position deeply, and builds its solution. */
  private async makePuzzle(
    game: SourceGame,
    replayed: ReplayedGame,
    playerIsWhite: boolean,
    ply: number,
    scanKind: GamePuzzleKind,
    player: number[]
  ): Promise<GamePuzzle | null> {
    const fen = replayed.fens[ply];
    let lines = await this.engine.evaluate(fen, CHECK_DEPTH, 2);
    const [best] = lines;
    if (!best || best.pv[0] === replayed.moves[ply] || !isOnlyMove(lines)) {
      return null;
    }
    // the deeper look must confirm the mistake
    const kind = classifyMove(
      ply > 0 ? player[ply - 1] : null,
      winChances(best),
      player[ply + 1]
    );
    if (kind !== scanKind) {
      return null;
    }

    const board = this.analysis.boardFromFen(fen);
    const solution = [best.pv[0]];
    this.analysis.play(board, best.pv[0]);
    const maxMoves =
      best.mate !== null && best.mate > 0
        ? Math.min(best.mate, MAX_MATE_MOVES)
        : MAX_MOVES;
    let last: EngineLine = best;
    // extend the line while the solver's next move is again the only one
    for (let moves = 1; moves < maxMoves; moves++) {
      const reply = lines[0].pv[1];
      if (
        !reply ||
        !this.analysis.play(board, reply) ||
        this.analysis.finishedValue(board) !== null
      ) {
        break;
      }
      lines = await this.engine.evaluate(
        this.analysis.fen(board),
        CHECK_DEPTH,
        2
      );
      if (!isOnlyMove(lines) || !this.analysis.play(board, lines[0].pv[0])) {
        break;
      }
      solution.push(reply, lines[0].pv[0]);
      last = lines[0];
    }

    const goal: GamePuzzleGoal = this.isCheckmate(solution, fen)
      ? 'mate'
      : winChances(last) >= WINNING
        ? 'advantage'
        : 'defend';
    const whiteToMove = replayed.startsWithWhite === (ply % 2 === 0);
    const fullmove =
      replayed.fullmoveNumber +
      Math.floor((ply + (replayed.startsWithWhite ? 0 : 1)) / 2);
    return {
      id: `${gameKey(game.platform, game.id)}-${ply}`,
      kind,
      goal,
      fen,
      solution,
      played: replayed.sans[ply],
      moveNumber: `${fullmove}${whiteToMove ? '.' : '...'}`,
      game: {
        platform: game.platform,
        url: game.url,
        opponent: playerIsWhite ? game.black : game.white,
        speed: game.speed,
        date: game.date,
      },
    };
  }

  /** The solution, played from the start, ends with a checkmate. */
  private isCheckmate(solution: string[], fen: string): boolean {
    const board = this.analysis.boardFromFen(fen);
    return (
      solution.every(move => this.analysis.play(board, move)) &&
      this.analysis.finishedValue(board) === -1
    );
  }

  private setState(change: Partial<GeneratorState>): void {
    this.stateSubject.next({ ...this.stateSubject.value, ...change });
  }
}
