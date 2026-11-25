import { Component, DoCheck, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChessUtilsService } from '../chess-game/chess-utils.service';
import { Chessboard } from '../chess-game/chessboard.model';
import { parseFen } from '../chess-game/fen';
import { formatMoveList } from '../chess-game/move-list';
import {
  Color,
  PromotionPieceType,
  toPieceName,
} from '../chess-game/piece.model';
import { Position } from '../chess-game/position.model';
import { PromotionService } from '../chess-game/promotion/promotion.service';
import { RulesService } from '../chess-game/rules.service';
import { parseUci, toUci } from './puzzle-moves';
import { mateIn, Puzzle, PUZZLES } from './puzzle.model';
import { TranslationKey } from '../i18n/translations';
import { I18nService } from '../i18n/i18n.service';
import { GamePuzzle } from './generator/game-puzzle.model';
import { GamePuzzleStoreService } from './generator/game-puzzle-store.service';
import {
  GAME_PLATFORMS,
  GAME_SPEEDS,
  GamePlatform,
  GameSpeed,
} from './generator/game-sources';
import { GamePuzzleKind } from './generator/puzzle-finder';
import { PuzzleGeneratorService } from './generator/puzzle-generator.service';

/** Pause before the opponent's answer, and between moves of a revealed solution. */
const OPPONENT_DELAY_MS = 500;
const UNDO_WRONG_MOVE_DELAY_MS = 600;
const SOLVED_STORAGE_KEYS: Record<PuzzleSource, string> = {
  collection: 'chess.solvedPuzzles',
  mine: 'chess.solvedGamePuzzles',
};
const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const GAME_COUNTS = [10, 20, 50, 100];

/** The built-in collection, or the puzzles made from the player's games. */
export type PuzzleSource = 'collection' | 'mine';
/** What the solver needs: a start position and the solution. */
type SolvablePuzzle = Pick<Puzzle, 'id' | 'fen' | 'solution'>;

type PuzzleStatus = 'playing' | 'solved' | 'revealed';
/** gameMove: a wrong move, the very one played in the game. */
type Feedback = 'none' | 'good' | 'wrong' | 'gameMove';

@Component({
    selector: 'app-puzzles',
    templateUrl: './puzzles.component.html',
    styleUrls: ['./puzzles.component.scss', './puzzles-mine.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PuzzlesComponent implements OnInit, DoCheck, OnDestroy {
  readonly platforms = GAME_PLATFORMS;
  readonly speeds = GAME_SPEEDS;
  readonly gameCounts = GAME_COUNTS;
  readonly kindList: GamePuzzleKind[] = ['missed', 'blunder'];
  readonly generatorState$ = this.generator.state$;

  source: PuzzleSource = 'collection';
  /** Puzzles of the current source, in the order of the list. */
  puzzles: SolvablePuzzle[] = PUZZLES;
  /** Index in puzzles; -1 when the list is empty. */
  index = 0;
  gamePuzzles: GamePuzzle[] = [];
  /** Kinds of game puzzles shown in the list. */
  kinds: Record<GamePuzzleKind, boolean> = { missed: true, blunder: true };

  // generator form
  platform: GamePlatform = 'lichess';
  username = '';
  gameCount = 20;
  selectedSpeeds = new Set<GameSpeed>();
  /** The delete button was pressed once: the next press deletes. */
  confirmingClear = false;

  chessBoard!: Chessboard;
  solverColor: Color = 'white';
  status: PuzzleStatus = 'playing';
  feedback: Feedback = 'none';
  hintSquare: Position | null = null;
  movesText = '';
  solved = new Set<string>();

  /** Index in the solution of the next move to play. */
  private step = 0;
  /** History length already handled, to detect the user's moves. */
  private processedPlies = 0;
  /** History length shown in the move list. */
  private displayedPlies = 0;
  /** A scripted move (opponent answer, undo, solution) is pending. */
  private busy = false;
  private fullmoveNumber = 1;
  private timeouts: ReturnType<typeof setTimeout>[] = [];
  private subscriptions = new Subscription();

  constructor(
    private rulesService: RulesService,
    private promotionService: PromotionService,
    private chessUtilsService: ChessUtilsService,
    private route: ActivatedRoute,
    private store: GamePuzzleStoreService,
    private generator: PuzzleGeneratorService,
    private i18n: I18nService
  ) {}

  /** The puzzle on the board; undefined when the list is empty. */
  get puzzle(): SolvablePuzzle | undefined {
    return this.puzzles[this.index];
  }

  /** The puzzle on the board, when it comes from the player's games. */
  get gamePuzzle(): GamePuzzle | undefined {
    return this.source === 'mine'
      ? (this.puzzle as GamePuzzle | undefined)
      : undefined;
  }

  /** Text of the goal: 'Mate in 2', 'Take the advantage'... */
  goalText(puzzle: SolvablePuzzle): string {
    const goal = (puzzle as Partial<GamePuzzle>).goal ?? 'mate';
    return goal === 'mate'
      ? this.i18n.t('puzzles.mateIn', { moves: mateIn(puzzle as Puzzle) })
      : this.i18n.t(`puzzles.goal.${goal}`);
  }

  /** Title of a puzzle in the list: its theme, or its kind. */
  titleKey(puzzle: SolvablePuzzle): TranslationKey {
    return this.source === 'mine'
      ? `puzzles.mine.kind.${(puzzle as GamePuzzle).kind}`
      : this.themeKey(puzzle as Puzzle);
  }

  kindKey(kind: GamePuzzleKind): TranslationKey {
    return `puzzles.mine.kind.${kind}`;
  }

  speedKey(speed: GameSpeed): TranslationKey {
    return `puzzles.speed.${speed}`;
  }

  /**
   * Link to the game. On Lichess it opens at the puzzle's position, seen
   * from the player's side ('#ply'); Chess.com has no such link.
   */
  gameUrl(puzzle: GamePuzzle): string {
    const { platform, url } = puzzle.game;
    if (platform !== 'lichess') {
      return url;
    }
    const ply = puzzle.id.slice(puzzle.id.lastIndexOf('-') + 1);
    const side = puzzle.fen.split(' ')[1] === 'b' ? '/black' : '';
    return `${url}${side}#${ply}`;
  }

  /** The move played in the game: '16... Bxh6'. */
  gameMove(puzzle: GamePuzzle): string {
    return `${puzzle.moveNumber} ${puzzle.played}`;
  }

  platformName(platform: GamePlatform): string {
    return platform === 'lichess' ? 'Lichess' : 'Chess.com';
  }

  formatDate(date: number): string {
    return new Date(date).toLocaleDateString(this.i18n.language, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  get generating(): boolean {
    return this.generator.running;
  }

  get findMoveKey(): TranslationKey {
    return this.solverColor === 'white'
      ? 'puzzles.findWhite'
      : 'puzzles.findBlack';
  }

  themeKey(puzzle: Puzzle): TranslationKey {
    return `puzzles.theme.${puzzle.theme}`;
  }

  get canMove(): boolean {
    return (
      !!this.puzzle &&
      this.status === 'playing' &&
      !this.busy &&
      this.chessBoard.getCurrentPlayerColor() === this.solverColor
    );
  }

  ngOnInit(): void {
    const settings = this.store.loadSettings();
    if (settings) {
      this.platform = settings.platform;
      this.username = settings.username;
      this.gameCount = settings.count;
      this.selectedSpeeds = new Set(settings.speeds);
    }
    this.gamePuzzles = this.store.puzzles;
    this.subscriptions.add(
      this.route.queryParamMap.subscribe(params =>
        this.showSource(params.get('source') === 'mine' ? 'mine' : 'collection')
      )
    );
    this.subscriptions.add(
      this.store.puzzles$.subscribe(puzzles => {
        if (puzzles === this.gamePuzzles) {
          return;
        }
        this.gamePuzzles = puzzles;
        if (this.source === 'mine') {
          this.refreshGameList();
        }
      })
    );
  }

  /** Switch between the collection and the player's puzzles. */
  private showSource(source: PuzzleSource): void {
    this.source = source;
    this.solved = this.loadSolved();
    this.confirmingClear = false;
    this.puzzles = source === 'mine' ? this.filteredGamePuzzles() : PUZZLES;
    this.loadFirstUnsolved();
  }

  private loadFirstUnsolved(): void {
    const firstUnsolved = this.puzzles.findIndex(p => !this.solved.has(p.id));
    this.load(Math.max(firstUnsolved, 0));
  }

  private filteredGamePuzzles(): GamePuzzle[] {
    return this.gamePuzzles.filter(puzzle => this.kinds[puzzle.kind]);
  }

  /**
   * The list of game puzzles changed (new puzzles found, filter...): keep the
   * puzzle being solved, or start one if none was shown.
   */
  private refreshGameList(): void {
    const currentId = this.puzzle?.id;
    this.puzzles = this.filteredGamePuzzles();
    const index = this.puzzles.findIndex(p => p.id === currentId);
    if (index >= 0) {
      this.index = index;
    } else {
      this.loadFirstUnsolved();
    }
  }

  toggleKind(kind: GamePuzzleKind): void {
    this.kinds = { ...this.kinds, [kind]: !this.kinds[kind] };
    this.refreshGameList();
  }

  toggleSpeed(speed: GameSpeed): void {
    if (this.selectedSpeeds.has(speed)) {
      this.selectedSpeeds.delete(speed);
    } else {
      this.selectedSpeeds.add(speed);
    }
  }

  generate(): void {
    const username = this.username.trim();
    if (!username || this.generating) {
      return;
    }
    const settings = {
      platform: this.platform,
      username,
      count: this.gameCount,
      // in the order of the list, for a stable saved value
      speeds: this.speeds.filter(speed => this.selectedSpeeds.has(speed)),
    };
    this.store.saveSettings(settings);
    void this.generator.generate(settings.platform, username, settings);
  }

  cancelGeneration(): void {
    this.generator.cancel();
  }

  /** First press asks for confirmation, the second one deletes. */
  clearGamePuzzles(): void {
    if (!this.confirmingClear) {
      this.confirmingClear = true;
      return;
    }
    this.confirmingClear = false;
    this.store.clear();
    this.solved.clear();
    this.saveSolved();
  }

  /** Detect the moves the user plays on the board. */
  ngDoCheck(): void {
    const plies = this.chessBoard.getHistory().length;
    if (plies !== this.processedPlies) {
      const isUserMove = plies > this.processedPlies;
      this.processedPlies = plies;
      if (isUserMove && this.status === 'playing') {
        this.checkUserMove();
      }
    }
    // separate from processedPlies, which scripted moves update themselves
    const displayedPlies = this.chessBoard.getHistory().length;
    if (displayedPlies !== this.displayedPlies) {
      this.displayedPlies = displayedPlies;
      this.movesText = this.computeMovesText();
    }
  }

  ngOnDestroy(): void {
    this.clearTimeouts();
    this.subscriptions.unsubscribe();
  }

  load(index: number): void {
    this.clearTimeouts();
    this.promotionService.cancelPromotion();
    this.index = this.puzzles.length ? index : -1;
    const { state, fullmoveNumber } = parseFen(this.puzzle?.fen ?? INITIAL_FEN);
    this.chessBoard = new Chessboard(this.chessUtilsService, state);
    this.fullmoveNumber = fullmoveNumber;
    this.solverColor = state.isWhiteTurn ? 'white' : 'black';
    this.step = 0;
    this.processedPlies = 0;
    this.displayedPlies = 0;
    this.busy = false;
    this.status = 'playing';
    this.feedback = 'none';
    this.hintSquare = null;
    this.movesText = '';
  }

  next(): void {
    if (this.puzzles.length) {
      this.load((this.index + 1) % this.puzzles.length);
    }
  }

  retry(): void {
    this.load(this.index);
  }

  showHint(): void {
    if (this.canMove) {
      this.hintSquare = parseUci(this.puzzle!.solution[this.step]).from;
    }
  }

  /** Play the rest of the solution, one move at a time. */
  revealSolution(): void {
    const puzzle = this.puzzle;
    if (!puzzle) {
      return;
    }
    this.status = 'revealed';
    this.feedback = 'none';
    this.hintSquare = null;
    this.busy = true;
    const playNext = () => {
      if (this.step >= puzzle.solution.length) {
        this.busy = false;
        return;
      }
      this.playScriptedMove();
      this.later(playNext, OPPONENT_DELAY_MS);
    };
    this.later(playNext, 0);
  }

  private checkUserMove(): void {
    const history = this.chessBoard.getHistory();
    const { move } = history[history.length - 1];
    const promotion = this.promotionOf(move.newPos, history.length - 1);
    const played = toUci(move.oldPos, move.newPos, promotion);
    const solution = this.puzzle!.solution;
    const isLastMove = this.step === solution.length - 1;
    this.hintSquare = null;

    if (played === solution[this.step] || (isLastMove && this.isCheckmate())) {
      this.step++;
      if (this.step >= solution.length) {
        this.status = 'solved';
        this.feedback = 'none';
        this.markSolved();
      } else {
        this.feedback = 'good';
        this.busy = true;
        this.later(() => {
          this.playScriptedMove();
          this.busy = false;
        }, OPPONENT_DELAY_MS);
      }
    } else {
      const san = history[history.length - 1].san;
      this.feedback = san === this.gamePuzzle?.played ? 'gameMove' : 'wrong';
      this.busy = true;
      this.later(() => {
        this.rulesService.undoMove(this.chessBoard);
        this.busy = false;
      }, UNDO_WRONG_MOVE_DELAY_MS);
    }
  }

  /** Play the next move of the solution, whoever's turn it is. */
  private playScriptedMove(): void {
    const { from, to, promotion } = parseUci(this.puzzle!.solution[this.step]);
    const color = this.chessBoard.getCurrentPlayerColor();
    this.rulesService.playMove(from, to, this.chessBoard);
    if (promotion) {
      this.promotionService.selectPiece(toPieceName(color, promotion));
    }
    this.step++;
    // scripted moves are not the user's: don't check them
    this.processedPlies = this.chessBoard.getHistory().length;
  }

  /** Piece a pawn was promoted to by the move at this history index. */
  private promotionOf(
    destination: Position,
    plyIndex: number
  ): PromotionPieceType | undefined {
    const before = this.chessBoard.getHistory()[plyIndex].stateBefore;
    const origin = this.chessBoard.getHistory()[plyIndex].move.oldPos;
    const movedType = this.chessUtilsService.getType(
      before.pieces[origin.y][origin.x]
    );
    const type = this.chessBoard.getPieceTypeByPos(destination);
    return movedType === 'pawn' && type !== 'pawn' && type !== null
      ? (type as PromotionPieceType)
      : undefined;
  }

  private isCheckmate(): boolean {
    return (
      this.rulesService.getAvailableMoves(this.chessBoard).length === 0 &&
      this.rulesService.isInCheck(this.chessBoard)
    );
  }

  /** '1. Qd8+ Bxd8 2. Re8#', or '1... Qg1+ ...' when Black starts. */
  private computeMovesText(): string {
    return formatMoveList(this.chessBoard.getHistory(), this.fullmoveNumber)
      .map(item => item.label)
      .join(' ');
  }

  private later(action: () => void, delay: number): void {
    this.timeouts.push(setTimeout(action, delay));
  }

  private clearTimeouts(): void {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts = [];
  }

  private markSolved(): void {
    this.solved.add(this.puzzle!.id);
    this.saveSolved();
  }

  private saveSolved(): void {
    try {
      localStorage.setItem(
        SOLVED_STORAGE_KEYS[this.source],
        JSON.stringify([...this.solved])
      );
    } catch {
      // storage unavailable (private mode...): progress is just not kept
    }
  }

  private loadSolved(): Set<string> {
    try {
      const ids: unknown = JSON.parse(
        localStorage.getItem(SOLVED_STORAGE_KEYS[this.source]) ?? '[]'
      );
      return new Set(Array.isArray(ids) ? ids.map(String) : []);
    } catch {
      return new Set();
    }
  }
}
