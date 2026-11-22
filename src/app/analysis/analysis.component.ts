import {
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ArrowAnnotation } from 'src/app/chess-game/chess-board/annotations';
import { ChessUtilsService } from 'src/app/chess-game/chess-utils.service';
import {
  BoardState,
  Chessboard,
  HistoryEntry,
} from 'src/app/chess-game/chessboard.model';
import { FenPosition, parseFen, toFen } from 'src/app/chess-game/fen';
import {
  Color,
  PromotionPieceType,
  toPieceName,
} from 'src/app/chess-game/piece.model';
import { PromotionService } from 'src/app/chess-game/promotion/promotion.service';
import { RulesService } from 'src/app/chess-game/rules.service';
import { I18nService } from 'src/app/i18n/i18n.service';
import { Localized } from 'src/app/i18n/localized';
import { TranslationKey } from 'src/app/i18n/translations';
import { Opening } from 'src/app/openings/openings';
import { OpeningService } from 'src/app/openings/opening.service';
import { parseUci, toUci } from 'src/app/puzzles/puzzle-moves';
import { EngineService, Evaluation } from './engine.service';
import {
  GameImportError,
  GameImportService,
  GameTag,
} from './game-import.service';
import { UserService } from 'src/app/settings/user-settings/user.service';
import { SavedAnalysesService, SavedAnalysis } from './saved-analyses.service';
import { formatTimeControl } from './time-control';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
/** Wait for the user to stop browsing before starting the engine. */
const ENGINE_DELAY_MS = 150;

const PROMOTION_FROM_SAN: Record<string, PromotionPieceType> = {
  Q: 'queen',
  R: 'rook',
  B: 'bishop',
  N: 'knight',
};

/** Labels of the usual PGN headers; the others are shown by their name. */
const TAG_LABELS: Record<string, Localized> = {
  Event: { en: 'Event', fr: 'Événement' },
  Site: { en: 'Site', fr: 'Site' },
  Date: { en: 'Date', fr: 'Date' },
  Round: { en: 'Round', fr: 'Ronde' },
  White: { en: 'White', fr: 'Blancs' },
  Black: { en: 'Black', fr: 'Noirs' },
  Result: { en: 'Result', fr: 'Résultat' },
  WhiteElo: { en: 'White Elo', fr: 'Elo des Blancs' },
  BlackElo: { en: 'Black Elo', fr: 'Elo des Noirs' },
  TimeControl: { en: 'Time control', fr: 'Cadence' },
  Termination: { en: 'Termination', fr: 'Fin de partie' },
  ECO: { en: 'ECO', fr: 'ECO' },
  Opening: { en: 'Opening', fr: 'Ouverture' },
  StartTime: { en: 'Start time', fr: 'Heure de début' },
  EndTime: { en: 'End time', fr: 'Heure de fin' },
  Link: { en: 'Link', fr: 'Lien' },
  Annotator: { en: 'Annotator', fr: 'Annotateur' },
};

/** 598.1 → '9:58', 3725 → '1:02:05', 9.4 → '0:09.4' (tenths under 20 s). */
export function formatClock(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  const secs =
    seconds < 20 && !Number.isInteger(seconds)
      ? rest.toFixed(1).padStart(4, '0')
      : String(Math.floor(rest)).padStart(2, '0');
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${secs}`
    : `${minutes}:${secs}`;
}

/** Side panel: the menu, the moves, the saved analyses, or the editor. */
export type AnalysisView = 'menu' | 'moves' | 'saved' | 'editor';

interface PositionResult {
  title: TranslationKey;
  detail: TranslationKey;
}

/**
 * Analysis board: play the moves of both sides, load a game (PGN) or a
 * position (FEN), set up a position, save analyses, with Stockfish's
 * evaluation of the displayed position.
 */
@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class AnalysisComponent implements OnInit, DoCheck, OnDestroy {
  view: AnalysisView = 'menu';

  /** Position the line starts from. */
  start: FenPosition = parseFen(INITIAL_FEN);
  /** Every move of the line, including those after the displayed position. */
  line: HistoryEntry[] = [];
  moves: string[] = [];
  /** Number of moves of the line played on the displayed board. */
  ply = 0;
  chessBoard: Chessboard = this.newBoard();
  orientation: Color = 'white';
  result: PositionResult | null = null;
  opening: Opening | null = null;
  /** Evaluation of the displayed position; null while the engine thinks. */
  evaluation: Evaluation | null = null;
  /** Last evaluation received, kept by the bar while the engine thinks. */
  lastEvaluation: Evaluation | null = null;
  bestMoveArrow: { circles: []; arrows: ArrowAnnotation[] } | null = null;

  importText = '';
  importError: string | null = null;
  /** Saved analysis being edited, if any. */
  savedId: string | null = null;
  saveName = '';
  saveMessage: TranslationKey | null = null;
  /** An analysis from a previous visit can be resumed. */
  hasPrevious = false;
  /** Headers of the loaded PGN (players, event, link...). */
  tags: GameTag[] = [];
  /** Time left after each move of the line, in seconds, if the PGN had it. */
  clocks: (number | null)[] = [];

  /** Position after the last move of the line (the others are in the line). */
  private finalState: BoardState = this.start.state;
  private engineTimeout?: ReturnType<typeof setTimeout>;
  private subscription?: Subscription;

  constructor(
    private rulesService: RulesService,
    private promotionService: PromotionService,
    private chessUtilsService: ChessUtilsService,
    private openingService: OpeningService,
    private gameImport: GameImportService,
    readonly saved: SavedAnalysesService,
    readonly engine: EngineService,
    private i18n: I18nService,
    private userService: UserService
  ) {}

  /** FEN of the displayed position (for the engine and the editor). */
  get fen(): string {
    const whiteStarts = this.start.state.isWhiteTurn;
    const fullmove =
      this.start.fullmoveNumber +
      Math.floor((this.ply + (whiteStarts ? 0 : 1)) / 2);
    return toFen(this.chessBoard.saveState(), fullmove);
  }

  /** Share of the bar given to White, from 0 to 100. */
  get whiteShare(): number {
    if (this.result) {
      return this.result.detail === 'result.whiteWins'
        ? 100
        : this.result.detail === 'result.blackWins'
          ? 0
          : 50;
    }
    // the last known evaluation while the engine thinks: the bar goes
    // straight to the new value instead of passing through the middle
    const evaluation = this.evaluation ?? this.lastEvaluation;
    if (!evaluation) {
      return 50;
    }
    if (evaluation.mate !== null) {
      return evaluation.mate > 0 ? 100 : 0;
    }
    // logistic curve: +2 gives about 70 %, +5 about 90 %
    return 100 / (1 + Math.exp(-0.45 * (evaluation.pawns ?? 0)));
  }

  /** '+0.4', '-1.2', 'M3', '-M2', or the result of a finished game. */
  get evaluationLabel(): string {
    if (this.result) {
      return this.result.detail === 'result.whiteWins'
        ? '1-0'
        : this.result.detail === 'result.blackWins'
          ? '0-1'
          : '½-½';
    }
    const evaluation = this.evaluation ?? this.lastEvaluation;
    if (!evaluation) {
      return '…';
    }
    if (evaluation.mate !== null) {
      return (evaluation.mate < 0 ? '-M' : 'M') + Math.abs(evaluation.mate);
    }
    const pawns = evaluation.pawns ?? 0;
    return (pawns > 0 ? '+' : '') + pawns.toFixed(1);
  }

  /** 'Alice (1500) – Bob (1600)', or '' without player headers. */
  get players(): string {
    const player = (color: 'White' | 'Black') => {
      const name = this.tag(color);
      const elo = this.tag(`${color}Elo`);
      return name && elo && elo !== '?' ? `${name} (${elo})` : name;
    };
    const white = player('White');
    const black = player('Black');
    return white || black ? `${white || '?'} – ${black || '?'}` : '';
  }

  /** Side shown above the board (the other one is below). */
  get topColor(): Color {
    return this.orientation === 'white' ? 'black' : 'white';
  }

  get bottomColor(): Color {
    return this.orientation;
  }

  /** Name and Elo from the PGN headers; the color name without them. */
  playerOf(color: Color): {
    name: string;
    elo: string;
    /** The user's icon when this player is the user. */
    avatar: string | null;
  } {
    const tagName = color === 'white' ? 'White' : 'Black';
    const name = this.tag(tagName);
    const elo = this.tag(`${tagName}Elo`);
    return {
      name:
        name && name !== '?'
          ? name
          : this.i18n.t(
              color === 'white'
                ? 'analysis.editor.white'
                : 'analysis.editor.black'
            ),
      elo: elo && elo !== '?' && elo !== '-' ? elo : '',
      avatar: this.isUser(name) ? this.userService.avatar : null,
    };
  }

  /** Side to move in the displayed position, whose clock is running. */
  get activeColor(): Color | null {
    return this.result ? null : this.chessBoard.getCurrentPlayerColor();
  }

  /**
   * Clock of a player in the displayed position: the time left after their
   * last move ([%clk] comments), else the starting time of the time control.
   * @returns null when neither is known.
   */
  clockOf(color: Color): string | null {
    const whiteStarts = this.start.state.isWhiteTurn;
    for (let ply = this.ply; ply >= 1; ply--) {
      const moverIsWhite = (ply % 2 === 1) === whiteStarts;
      const clock = this.clocks[ply - 1];
      if ((moverIsWhite ? 'white' : 'black') === color && clock != null) {
        return formatClock(clock);
      }
    }
    const base = /^(\d+)(\+\d+)?$/.exec(this.tag('TimeControl'));
    return base ? formatClock(+base[1]) : null;
  }

  /** The game's result ('1-0', '0-1', '½-½'), if known. */
  get gameResult(): string {
    const result = this.tag('Result');
    return result === '1/2-1/2' ? '½-½' : result && result !== '*' ? result : '';
  }

  /** Every header, with a translated label for the usual ones. */
  get tagRows(): { label: string; value: string; link: boolean }[] {
    return this.tags
      .filter(tag => tag.value && tag.value !== '?' && tag.name !== 'FEN')
      .map(tag => {
        const label = TAG_LABELS[tag.name];
        return {
          label: label ? this.i18n.localize(label) : tag.name,
          value:
            tag.name === 'TimeControl'
              ? formatTimeControl(tag.value, this.i18n.language)
              : tag.value,
          link: /^https?:\/\//.test(tag.value),
        };
      });
  }

  ngOnInit(): void {
    // read once: the last analysis is overwritten as soon as a move is played
    this.hasPrevious = this.saved.last !== null;
    this.subscription = this.engine.evaluation$.subscribe(evaluation => {
      this.evaluation = evaluation;
      if (evaluation) {
        this.lastEvaluation = evaluation;
      }
      this.bestMoveArrow = this.arrowOf(evaluation?.bestMove ?? null);
    });
    this.onPositionChanged();
  }

  /** Detect a move played on the board. */
  ngDoCheck(): void {
    const history = this.chessBoard.getHistory();
    if (history.length !== this.ply + 1) {
      return;
    }
    const played = history[this.ply];
    if (this.line[this.ply]?.san !== played.san) {
      this.line = [...history];
      this.moves = this.line.map(entry => entry.san);
      // the clocks of the game no longer apply after a new move
      this.clocks = this.clocks.slice(0, this.ply);
      this.rememberLine();
    }
    this.ply++;
    if (this.ply === this.line.length) {
      this.finalState = this.chessBoard.saveState();
    }
    if (this.view === 'menu' || this.view === 'saved') {
      this.view = 'moves';
    }
    this.onPositionChanged();
  }

  ngOnDestroy(): void {
    clearTimeout(this.engineTimeout);
    this.engine.stop();
    this.promotionService.cancelPromotion();
    this.subscription?.unsubscribe();
  }

  // ----- menu -----

  loadText(): void {
    try {
      const game = this.gameImport.import(this.importText);
      this.load(game.start, game.moves, game.tags, game.clocks);
      this.orientTowardsUser();
      this.importText = '';
      this.importError = null;
      this.view = 'moves';
    } catch (error) {
      if (error instanceof GameImportError) {
        this.importError = error.move
          ? this.i18n.t('analysis.import.move', { move: error.move })
          : this.i18n.t(error.key);
      } else {
        throw error;
      }
    }
  }

  newAnalysis(): void {
    this.load(parseFen(INITIAL_FEN), []);
    this.view = 'moves';
  }

  loadPrevious(): void {
    const last = this.saved.last;
    if (last) {
      this.load(
        parseFen(last.fen),
        last.moves,
        last.tags ?? [],
        last.clocks ?? []
      );
      this.view = 'moves';
    }
  }

  openEditor(): void {
    this.promotionService.cancelPromotion();
    this.view = 'editor';
  }

  onEditorApplied(fen: string): void {
    this.load(parseFen(fen), []);
    this.view = 'moves';
  }

  // ----- saved analyses -----

  openSaved(analysis: SavedAnalysis): void {
    this.load(
      parseFen(analysis.fen),
      analysis.moves,
      analysis.tags ?? [],
      analysis.clocks ?? [],
      analysis
    );
    this.view = 'moves';
  }

  /** Date of the last save, in the language of the interface. */
  savedDate(analysis: SavedAnalysis): string {
    return new Date(analysis.savedAt).toLocaleString(this.i18n.language, {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  deleteSaved(analysis: SavedAnalysis): void {
    this.saved.delete(analysis.id);
    if (this.savedId === analysis.id) {
      this.savedId = null;
    }
  }

  save(): void {
    const name =
      this.saveName.trim() ||
      this.players ||
      (this.opening ? this.i18n.localize(this.opening.name) : '') ||
      this.i18n.t('analysis.untitled');
    const id = this.savedId ?? `${Date.now()}`;
    const ok = this.saved.save({
      id,
      name,
      savedAt: new Date().toISOString(),
      fen: toFen(this.start.state, this.start.fullmoveNumber),
      moves: this.uciMoves(),
      tags: this.tags,
      clocks: this.clocks,
    });
    if (ok) {
      this.savedId = id;
      this.saveName = name;
    }
    this.saveMessage = ok ? 'analysis.saved' : 'analysis.saveFailed';
  }

  // ----- board -----

  goToPly(ply: number): void {
    ply = Math.max(0, Math.min(ply, this.line.length));
    if (ply === this.ply) {
      return;
    }
    this.promotionService.cancelPromotion();
    this.ply = ply;
    this.chessBoard = this.buildBoard(ply);
    this.onPositionChanged();
  }

  flip(): void {
    this.orientation = this.orientation === 'white' ? 'black' : 'white';
  }

  /** Arrow keys move through the line, Home and End jump to its ends. */
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (
      this.view === 'editor' ||
      target?.closest('input, textarea, select, [contenteditable]')
    ) {
      return;
    }
    const plies: Record<string, number> = {
      ArrowLeft: this.ply - 1,
      ArrowRight: this.ply + 1,
      Home: 0,
      End: this.line.length,
    };
    if (event.key in plies) {
      this.goToPly(plies[event.key]);
      event.preventDefault();
    }
  }

  /** Replace the analysis by a start position and its moves (UCI). */
  private load(
    start: FenPosition,
    moves: string[],
    tags: GameTag[] = [],
    clocks: (number | null)[] = [],
    savedAnalysis?: SavedAnalysis
  ): void {
    this.promotionService.cancelPromotion();
    this.start = start;
    this.tags = tags;
    this.clocks = clocks;
    const board = this.newBoard();
    for (const uci of moves) {
      const { from, to, promotion } = parseUci(uci);
      const piece = promotion
        ? toPieceName(board.getCurrentPlayerColor(), promotion)
        : undefined;
      if (!this.rulesService.playMoveWithPromotion(from, to, board, piece)) {
        break; // a damaged saved analysis: keep what can be played
      }
    }
    this.line = [...board.getHistory()];
    this.moves = this.line.map(entry => entry.san);
    this.finalState = board.saveState();
    this.ply = this.line.length;
    this.chessBoard = board;
    this.savedId = savedAnalysis?.id ?? null;
    this.saveName = savedAnalysis?.name ?? '';
    this.saveMessage = null;
    this.rememberLine();
    this.onPositionChanged();
  }

  private newBoard(): Chessboard {
    return new Chessboard(this.chessUtilsService, this.start.state);
  }

  /**
   * Position after the first `ply` moves of the line, with its history (for
   * the last move highlight, and the repetition rule if play continues).
   */
  private buildBoard(ply: number): Chessboard {
    const board = this.newBoard();
    this.line.slice(0, ply).forEach(entry => board.pushHistory(entry));
    board.restoreState(
      ply < this.line.length ? this.line[ply].stateBefore : this.finalState
    );
    return board;
  }

  /** The player has the user's name (Settings > User). */
  private isUser(name: string): boolean {
    return (
      !!name && name.toLowerCase() === this.userService.name.toLowerCase()
    );
  }

  /** Put the user's side at the bottom when they played the loaded game. */
  private orientTowardsUser(): void {
    if (this.isUser(this.tag('Black'))) {
      this.orientation = 'black';
    } else if (this.isUser(this.tag('White'))) {
      this.orientation = 'white';
    }
  }

  private tag(name: string): string {
    return this.tags.find(tag => tag.name === name)?.value ?? '';
  }

  /** Keep the analysis to resume it later ("Resume previous analysis"). */
  private rememberLine(): void {
    const fen = toFen(this.start.state, this.start.fullmoveNumber);
    if (this.line.length || fen !== INITIAL_FEN) {
      this.saved.rememberLast(fen, this.uciMoves(), this.tags, this.clocks);
    }
  }

  private onPositionChanged(): void {
    this.result = this.computeResult();
    this.opening = this.openingService.identify(this.chessBoard);
    this.saveMessage = null;
    // the previous position's evaluation must not show on this one
    this.evaluation = null;
    this.bestMoveArrow = null;
    clearTimeout(this.engineTimeout);
    if (this.result) {
      this.engine.stop(); // nothing to evaluate: the game is over
      return;
    }
    const fen = this.fen;
    this.engineTimeout = setTimeout(
      () => this.engine.analyse(fen),
      ENGINE_DELAY_MS
    );
  }

  private computeResult(): PositionResult | null {
    const board = this.chessBoard;
    if (this.rulesService.getAvailableMoves(board).length === 0) {
      if (this.rulesService.isInCheck(board)) {
        return {
          title: 'result.checkmate',
          detail:
            board.getNextPlayerColor() === 'white'
              ? 'result.whiteWins'
              : 'result.blackWins',
        };
      }
      return { title: 'result.stalemate', detail: 'result.draw' };
    }
    const reason = this.rulesService.getDrawReason(board);
    return reason ? { title: 'result.draw', detail: `draw.${reason}` } : null;
  }

  /** The whole line in UCI notation (promotions read from the SAN). */
  private uciMoves(): string[] {
    return this.line.map(entry => {
      const promotion = /=([QRBN])/.exec(entry.san);
      return toUci(
        entry.move.oldPos,
        entry.move.newPos,
        promotion ? PROMOTION_FROM_SAN[promotion[1]] : undefined
      );
    });
  }

  private arrowOf(
    uci: string | null
  ): { circles: []; arrows: ArrowAnnotation[] } | null {
    if (!uci || this.result) {
      return null;
    }
    const { from, to } = parseUci(uci);
    return {
      circles: [],
      arrows: [
        { from: { x: from.x, y: from.y }, to: { x: to.x, y: to.y }, color: 'blue' },
      ],
    };
  }
}
