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
  ChangeDetectionStrategy
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ChessUtilsService } from '../chess-utils.service';
import { Chessboard } from '../chessboard.model';
import { Color, Square } from '../piece.model';
import { Position } from '../position.model';
import { PromotionService } from '../promotion/promotion.service';
import { RulesService } from '../rules.service';
import {
  ArrowAnnotation,
  arrowShape,
  ArrowShape,
  BoardSquare,
  BRUSH_COLORS,
  brushFromModifiers,
  CircleAnnotation,
  toggleArrow,
  toggleCircle,
} from './annotations';

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
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ChessBoardComponent implements OnInit, DoCheck, OnDestroy {
  @Input() chessBoard: Chessboard = new Chessboard(this.chessUtilsService);
  /** Whether the user may move the pieces of the side to move. */
  @Input() canMove = true;
  /** Side shown at the bottom of the board. */
  @Input() orientation: Color = 'white';
  /** Square to point out to the user (puzzle hint). */
  @Input() hintSquare: Position | null = null;

  /** Arrows and circles provided by the page (e.g. a lesson), kept on screen. */
  @Input() set shapes(
    shapes: {
      circles: CircleAnnotation[];
      arrows: ArrowAnnotation[];
    } | null
  ) {
    this.presetCircles = shapes?.circles ?? [];
    this.presetArrows = shapes?.arrows ?? [];
    this.refreshAnnotationViews();
  }
  private presetCircles: CircleAnnotation[] = [];
  private presetArrows: ArrowAnnotation[] = [];

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
  /** Annotations, in display units for the SVG layer (1 = one square). */
  circleViews: { cx: number; cy: number; color: string; preview: boolean }[] =
    [];
  arrowViews: { shape: ArrowShape; color: string; preview: boolean }[] = [];
  private circles: CircleAnnotation[] = [];
  private arrows: ArrowAnnotation[] = [];
  /** Annotation being drawn with the right button. */
  private drawing: ArrowAnnotation | null = null;
  /** A right click started on the board: block the menu it will open. */
  private rightPressOnBoard = false;
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
    document.addEventListener('contextmenu', this.preventContextMenu, true);
  }

  /** Rebuild the squares only when the position actually changed. */
  ngDoCheck(): void {
    const key = this.computeRenderKey();
    if (key !== this.renderedKey) {
      this.renderedKey = key;
      this.clearSelection();
      this.setAnnotations([], []); // annotations belong to a position
      this.squares = this.buildSquares();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    document.removeEventListener('contextmenu', this.preventContextMenu, true);
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
    const isLeftButton = !('button' in event) || event.button === 0;
    if (!isLeftButton || !this.canDrag(square)) {
      return; // the right button draws annotations
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
  @HostListener('document:touchend')
  @HostListener('document:touchcancel')
  release(): void {
    this.grabbed = null;
  }

  // ----- annotations: right click draws circles, right drag draws arrows -----

  /** Left click clears the annotations, right click starts drawing one. */
  onBoardMouseDown(event: MouseEvent): void {
    if (event.button === 0) {
      // also drops a drawing left unfinished (a browser menu can swallow the release)
      this.drawing = null;
      this.setAnnotations([], []);
    } else if (event.button === 2) {
      this.rightPressOnBoard = true;
      const square = this.squareAt(event);
      if (square) {
        this.drawing = {
          from: square,
          to: square,
          color: brushFromModifiers(event),
        };
        this.refreshAnnotationViews();
      }
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent): void {
    if (!this.drawing) {
      return;
    }
    const square = this.squareAt(event);
    if (
      square &&
      (square.x !== this.drawing.to.x || square.y !== this.drawing.to.y)
    ) {
      this.drawing = { ...this.drawing, to: square };
      this.refreshAnnotationViews();
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onDocumentMouseUp(event: MouseEvent): void {
    if (event.button === 0) {
      this.release();
    } else if (event.button === 2 && this.drawing) {
      const { from, color } = this.drawing;
      const to = this.squareAt(event);
      this.drawing = null;
      if (!to) {
        this.refreshAnnotationViews(); // released outside the board: cancel
      } else if (to.x === from.x && to.y === from.y) {
        this.setAnnotations(
          toggleCircle(this.circles, { square: from, color }),
          this.arrows
        );
      } else {
        this.setAnnotations(
          this.circles,
          toggleArrow(this.arrows, { from, to, color })
        );
      }
    }
  }

  /**
   * The browser menu would hide the board while drawing. Listened on the whole
   * document (capture phase): on Windows the menu comes after the release,
   * which can happen outside the board at the end of an arrow.
   */
  private readonly preventContextMenu = (event: MouseEvent): void => {
    if (this.rightPressOnBoard || this.squareAt(event)) {
      event.preventDefault();
    }
    this.rightPressOnBoard = false;
  };

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

  /** The promotion picker opens towards the center of the board. */
  promotionUpward(square: SquareView): boolean {
    const promotesOnBottomEdge =
      (this.promotionColor(square) === 'black') ===
      (this.orientation === 'white');
    return promotesOnBottomEdge;
  }

  isHint(square: SquareView): boolean {
    return this.hintSquare?.x === square.x && this.hintSquare?.y === square.y;
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
      this.chessBoard.getHistory().length +
      this.orientation
    );
  }

  /** Board square under the pointer, or null outside the board. */
  private squareAt(event: MouseEvent): BoardSquare | null {
    const rect = this.boardElement.nativeElement.getBoundingClientRect();
    const col = Math.floor(((event.clientX - rect.left) / rect.width) * 8);
    const row = Math.floor(((event.clientY - rect.top) / rect.height) * 8);
    if (col < 0 || col > 7 || row < 0 || row > 7) {
      return null;
    }
    const flipped = this.orientation === 'black';
    return { x: flipped ? 7 - col : col, y: flipped ? row : 7 - row };
  }

  /** Board square -> top-left corner in display units. */
  private toDisplay(square: BoardSquare): { x: number; y: number } {
    const flipped = this.orientation === 'black';
    return {
      x: flipped ? 7 - square.x : square.x,
      y: flipped ? square.y : 7 - square.y,
    };
  }

  private setAnnotations(
    circles: CircleAnnotation[],
    arrows: ArrowAnnotation[]
  ): void {
    this.circles = circles;
    this.arrows = arrows;
    this.refreshAnnotationViews();
  }

  private refreshAnnotationViews(): void {
    const drawing = this.drawing;
    const isCircle =
      !!drawing &&
      drawing.from.x === drawing.to.x &&
      drawing.from.y === drawing.to.y;
    const circles = [
      ...this.presetCircles.map(circle => ({ ...circle, preview: false })),
      ...this.circles.map(circle => ({ ...circle, preview: false })),
      ...(drawing && isCircle
        ? [{ square: drawing.from, color: drawing.color, preview: true }]
        : []),
    ];
    const arrows = [
      ...this.presetArrows.map(arrow => ({ ...arrow, preview: false })),
      ...this.arrows.map(arrow => ({ ...arrow, preview: false })),
      ...(drawing && !isCircle ? [{ ...drawing, preview: true }] : []),
    ];
    this.circleViews = circles.map(({ square, color, preview }) => {
      const { x, y } = this.toDisplay(square);
      return { cx: x + 0.5, cy: y + 0.5, color: BRUSH_COLORS[color], preview };
    });
    this.arrowViews = arrows.map(({ from, to, color, preview }) => ({
      shape: arrowShape(this.toDisplay(from), this.toDisplay(to)),
      color: BRUSH_COLORS[color],
      preview,
    }));
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

    // squares in display order: from the top-left corner, row by row
    const flipped = this.orientation === 'black';
    const last = Chessboard.BOARD_SIZE - 1;
    const squares: SquareView[] = [];
    for (let row = 0; row <= last; row++) {
      for (let col = 0; col <= last; col++) {
        const x = flipped ? last - col : col;
        const y = flipped ? row : last - row;
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
          // ranks along the left edge, files along the bottom edge
          rankLabel: col === 0 ? String(y + 1) : null,
          fileLabel: row === last ? FILES[x] : null,
        });
      }
    }
    return squares;
  }
}
