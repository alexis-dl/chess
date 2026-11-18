import { Component, DoCheck, HostListener, OnDestroy } from '@angular/core';
import { ChessUtilsService } from 'src/app/chess-game/chess-utils.service';
import {
  BoardState,
  Chessboard,
  HistoryEntry,
} from 'src/app/chess-game/chessboard.model';
import { Color } from 'src/app/chess-game/piece.model';
import { PromotionService } from 'src/app/chess-game/promotion/promotion.service';
import { RulesService } from 'src/app/chess-game/rules.service';
import { TranslationKey } from 'src/app/i18n/translations';

interface PositionResult {
  title: TranslationKey;
  detail: TranslationKey;
}

/**
 * Free board: the user plays the moves of both sides, and can go back to any
 * earlier position. Playing a different move from there replaces the rest of
 * the line; replaying the next move of the line keeps it.
 */
@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss'],
})
export class ExplorerComponent implements DoCheck, OnDestroy {
  /** Every move of the line, including those after the displayed position. */
  line: HistoryEntry[] = [];
  moves: string[] = [];
  /** Number of moves of the line played on the displayed board. */
  ply = 0;
  chessBoard: Chessboard = new Chessboard(this.chessUtilsService);
  orientation: Color = 'white';
  result: PositionResult | null = null;
  /** Position after the last move of the line (the others are in the line). */
  private finalState: BoardState = this.chessBoard.saveState();

  constructor(
    private rulesService: RulesService,
    private promotionService: PromotionService,
    private chessUtilsService: ChessUtilsService
  ) {}

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
    }
    this.ply++;
    if (this.ply === this.line.length) {
      this.finalState = this.chessBoard.saveState();
    }
    this.result = this.computeResult();
  }

  ngOnDestroy(): void {
    this.promotionService.cancelPromotion();
  }

  goToPly(ply: number): void {
    ply = Math.max(0, Math.min(ply, this.line.length));
    if (ply === this.ply) {
      return;
    }
    this.promotionService.cancelPromotion();
    this.ply = ply;
    this.chessBoard = this.buildBoard(ply);
    this.result = this.computeResult();
  }

  flip(): void {
    this.orientation = this.orientation === 'white' ? 'black' : 'white';
  }

  reset(): void {
    this.promotionService.cancelPromotion();
    this.line = [];
    this.moves = [];
    this.ply = 0;
    this.chessBoard = new Chessboard(this.chessUtilsService);
    this.finalState = this.chessBoard.saveState();
    this.result = null;
  }

  /** Arrow keys move through the line, Home and End jump to its ends. */
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, [contenteditable]')) {
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

  /**
   * Position after the first `ply` moves of the line, with its history (for
   * the last move highlight, and the repetition rule if play continues).
   */
  private buildBoard(ply: number): Chessboard {
    const board = new Chessboard(this.chessUtilsService);
    this.line.slice(0, ply).forEach(entry => board.pushHistory(entry));
    board.restoreState(
      ply < this.line.length ? this.line[ply].stateBefore : this.finalState
    );
    return board;
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
}
