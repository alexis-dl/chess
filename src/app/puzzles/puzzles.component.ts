import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
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

/** Pause before the opponent's answer, and between moves of a revealed solution. */
const OPPONENT_DELAY_MS = 500;
const UNDO_WRONG_MOVE_DELAY_MS = 600;
const SOLVED_STORAGE_KEY = 'chess.solvedPuzzles';

type PuzzleStatus = 'playing' | 'solved' | 'revealed';
type Feedback = 'none' | 'good' | 'wrong';

@Component({
    selector: 'app-puzzles',
    templateUrl: './puzzles.component.html',
    styleUrls: ['./puzzles.component.scss'],
    standalone: false
})
export class PuzzlesComponent implements OnInit, DoCheck, OnDestroy {
  readonly puzzles = PUZZLES;
  index = 0;
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

  constructor(
    private rulesService: RulesService,
    private promotionService: PromotionService,
    private chessUtilsService: ChessUtilsService
  ) {}

  get puzzle(): Puzzle {
    return this.puzzles[this.index];
  }

  get findMoveKey(): TranslationKey {
    return this.solverColor === 'white'
      ? 'puzzles.findWhite'
      : 'puzzles.findBlack';
  }

  themeKey(puzzle: Puzzle): TranslationKey {
    return `puzzles.theme.${puzzle.theme}`;
  }

  mateIn(puzzle: Puzzle): number {
    return mateIn(puzzle);
  }

  get canMove(): boolean {
    return (
      this.status === 'playing' &&
      !this.busy &&
      this.chessBoard.getCurrentPlayerColor() === this.solverColor
    );
  }

  ngOnInit(): void {
    this.solved = this.loadSolved();
    const firstUnsolved = this.puzzles.findIndex(p => !this.solved.has(p.id));
    this.load(Math.max(firstUnsolved, 0));
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
  }

  load(index: number): void {
    this.clearTimeouts();
    this.promotionService.cancelPromotion();
    this.index = index;
    const { state, fullmoveNumber } = parseFen(this.puzzle.fen);
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
    this.load((this.index + 1) % this.puzzles.length);
  }

  retry(): void {
    this.load(this.index);
  }

  showHint(): void {
    if (this.canMove) {
      this.hintSquare = parseUci(this.puzzle.solution[this.step]).from;
    }
  }

  /** Play the rest of the solution, one move at a time. */
  revealSolution(): void {
    this.status = 'revealed';
    this.feedback = 'none';
    this.hintSquare = null;
    this.busy = true;
    const playNext = () => {
      if (this.step >= this.puzzle.solution.length) {
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
    const solution = this.puzzle.solution;
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
      this.feedback = 'wrong';
      this.busy = true;
      this.later(() => {
        this.rulesService.undoMove(this.chessBoard);
        this.busy = false;
      }, UNDO_WRONG_MOVE_DELAY_MS);
    }
  }

  /** Play the next move of the solution, whoever's turn it is. */
  private playScriptedMove(): void {
    const { from, to, promotion } = parseUci(this.puzzle.solution[this.step]);
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
    this.solved.add(this.puzzle.id);
    try {
      localStorage.setItem(
        SOLVED_STORAGE_KEY,
        JSON.stringify([...this.solved])
      );
    } catch {
      // storage unavailable (private mode...): progress is just not kept
    }
  }

  private loadSolved(): Set<string> {
    try {
      const ids: unknown = JSON.parse(
        localStorage.getItem(SOLVED_STORAGE_KEY) ?? '[]'
      );
      return new Set(Array.isArray(ids) ? ids.map(String) : []);
    } catch {
      return new Set();
    }
  }
}
