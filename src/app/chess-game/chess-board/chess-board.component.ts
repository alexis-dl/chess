import { CdkDragDrop } from '@angular/cdk/drag-drop';
import {
  Component,
  DoCheck,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ChessUtilsService } from '../chess-utils.service';
import { Chessboard } from '../chessboard.model';
import { Color, Square } from '../piece.model';
import { Position } from '../position.model';
import { PromotionService } from '../promotion/promotion.service';
import { RulesService } from '../rules.service';

const FILES = 'abcdefgh';

/** Everything the template needs to draw one square. */
export interface SquareView {
  x: number;
  y: number;
  piece: Square;
  isLight: boolean;
  isLastMove: boolean;
  isCheck: boolean;
  /** Rank number shown on the left column, file letter on the bottom row. */
  rankLabel: string | null;
  fileLabel: string | null;
}

/**
 * Displays a chessboard (white at the bottom) and lets the user play moves by
 * drag & drop or by clicking the piece then the destination square.
 * The game flow (turns, bot, end of game) is handled by the parent.
 */
@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss'],
})
export class ChessBoardComponent implements OnInit, DoCheck, OnDestroy {
  @Input() chessBoard: Chessboard = new Chessboard(this.chessUtilsService);
  /** Whether the user may move the pieces of the side to move. */
  @Input() canMove = true;

  @ViewChild('board', { static: true }) boardElement!: ElementRef<HTMLElement>;

  squares: SquareView[] = [];
  /** Size of a square in pixels, used for the dragged piece. */
  squareSize = 0;
  selectedSquare: Position | null = null;
  promotionPosition: Position | null = null;
  /** Piece pressed by the user, and the shift that centers it on the pointer. */
  private grabbed: {
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
  } | null = null;
  private targetKeys = new Set<string>();
  private renderedKey = '';
  private subscription?: Subscription;

  constructor(
    private rulesService: RulesService,
    private chessUtilsService: ChessUtilsService,
    private promotionService: PromotionService
  ) {}

  ngOnInit(): void {
    this.subscription = this.promotionService.promotionPosition$.subscribe(
      pos => (this.promotionPosition = pos)
    );
  }

  /** Rebuild the squares only when the position actually changed. */
  ngDoCheck(): void {
    const key = this.computeRenderKey();
    if (key !== this.renderedKey) {
      this.renderedKey = key;
      this.clearSelection();
      this.squares = this.buildSquares();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /** Squares keep their element across renders: only their content changes. */
  trackByIndex(index: number): number {
    return index;
  }

  isSelected(square: SquareView): boolean {
    return (
      this.selectedSquare?.x === square.x && this.selectedSquare?.y === square.y
    );
  }

  isTarget(square: SquareView): boolean {
    return this.targetKeys.has(square.x + ',' + square.y);
  }

  canDrag(square: SquareView): boolean {
    return (
      this.canMove &&
      !this.promotionPosition &&
      this.chessUtilsService.getColor(square.piece) ===
        this.chessBoard.getCurrentPlayerColor()
    );
  }

  pieceImage(square: SquareView): string | null {
    return this.chessUtilsService.getPieceImagePath(square.piece);
  }

  /**
   * Pressing a piece of the side to move: select it, show its legal moves and
   * center it under the pointer right away (the drag only starts on move).
   */
  grab(square: SquareView, event: MouseEvent | TouchEvent): void {
    if (!this.canDrag(square)) {
      return;
    }
    const pointer = 'touches' in event ? event.touches[0] : event;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.grabbed = {
      x: square.x,
      y: square.y,
      offsetX: pointer.clientX - (rect.left + rect.width / 2),
      offsetY: pointer.clientY - (rect.top + rect.height / 2),
    };
    this.select(square);
  }

  /** Releasing the pointer puts a grabbed but not dragged piece back. */
  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  @HostListener('document:touchcancel')
  release(): void {
    this.grabbed = null;
  }

  isGrabbed(square: SquareView): boolean {
    return this.grabbed?.x === square.x && this.grabbed?.y === square.y;
  }

  grabTransform(square: SquareView): string | null {
    return this.grabbed && this.isGrabbed(square)
      ? `translate(${this.grabbed.offsetX}px, ${this.grabbed.offsetY}px)`
      : null;
  }

  /** Select a piece of the side to move and show its legal moves. */
  select(square: SquareView): void {
    if (!this.canDrag(square)) {
      return;
    }
    // measured on grab: the drag preview has the size of a square
    this.squareSize = this.boardElement.nativeElement.clientWidth / 8;
    const pos = new Position(square.x, square.y);
    this.selectedSquare = pos;
    this.targetKeys = new Set(
      this.rulesService
        .getValidMovesByPiecePos(pos, this.chessBoard)
        .map(target => target.x + ',' + target.y)
    );
  }

  onSquareClick(square: SquareView): void {
    if (this.selectedSquare && this.isTarget(square)) {
      this.move(this.selectedSquare, new Position(square.x, square.y));
    } else if (!this.canDrag(square)) {
      this.clearSelection();
    }
  }

  onDrop(event: CdkDragDrop<SquareView, SquareView, SquareView>): void {
    const from = event.item.data;
    const to = event.container.data;
    if (from.x === to.x && from.y === to.y) {
      return; // dropped back on its square: keep the selection (click to move)
    }
    this.move(new Position(from.x, from.y), new Position(to.x, to.y));
  }

  showPromotion(square: SquareView): boolean {
    return (
      this.canMove &&
      this.promotionPosition?.x === square.x &&
      this.promotionPosition?.y === square.y
    );
  }

  /** Color of the pawn being promoted: white promotes on the top row. */
  promotionColor(square: SquareView): Color {
    return square.y === 7 ? 'white' : 'black';
  }

  private move(from: Position, to: Position): void {
    if (this.canMove) {
      this.rulesService.playMove(from, to, this.chessBoard);
    }
    this.clearSelection();
  }

  private computeRenderKey(): string {
    return (
      Chessboard.getPositionKey(this.chessBoard.saveState()) +
      this.chessBoard.getHistory().length
    );
  }

  private clearSelection(): void {
    this.selectedSquare = null;
    this.targetKeys = new Set();
  }

  private buildSquares(): SquareView[] {
    const history = this.chessBoard.getHistory();
    const lastMove = history[history.length - 1]?.move;
    const checkedKing = this.rulesService.isInCheck(this.chessBoard)
      ? this.chessBoard.findPiecePosition(
          `${this.chessBoard.getCurrentPlayerColor()}-king`
        )
      : null;

    const squares: SquareView[] = [];
    for (let y = Chessboard.BOARD_SIZE - 1; y >= 0; y--) {
      for (let x = 0; x < Chessboard.BOARD_SIZE; x++) {
        const pos = new Position(x, y);
        squares.push({
          x,
          y,
          piece: this.chessBoard.getPiece(x, y),
          isLight: (x + y) % 2 === 1,
          isLastMove:
            !!lastMove &&
            (lastMove.oldPos.equals(pos) || lastMove.newPos.equals(pos)),
          isCheck: !!checkedKing && checkedKing.equals(pos),
          rankLabel: x === 0 ? String(y + 1) : null,
          fileLabel: y === 0 ? FILES[x] : null,
        });
      }
    }
    return squares;
  }
}
