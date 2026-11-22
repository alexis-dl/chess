import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';

interface MoveRow {
  number: number;
  /**
   * Plies of the white and black moves (1 for the first move); null for the
   * empty white cell when Black moves first.
   */
  plies: (number | null)[];
}

/**
 * Moves of a game from the initial position, two per row. The move leading
 * to the displayed position is highlighted; with `selectable`, clicking a
 * move asks to display the position it leads to.
 */
@Component({
    selector: 'app-move-list',
    templateUrl: './move-list.component.html',
    styleUrls: ['./move-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class MoveListComponent implements OnChanges, AfterViewChecked {
  @ViewChild('list') list?: ElementRef<HTMLElement>;

  /** Moves in standard algebraic notation. */
  @Input() moves: readonly string[] = [];
  /** Number of moves played in the displayed position. */
  @Input() currentPly = 0;
  @Input() selectable = false;
  /** Number of the first move (games set up from a position). */
  @Input() firstMoveNumber = 1;
  /** True when the first move is a black one. */
  @Input() blackStarts = false;
  @Output() plySelected = new EventEmitter<number>();

  rows: MoveRow[] = [];
  private scrollPending = false;

  ngOnChanges(): void {
    this.rows = [];
    // a black first move fills the second cell of the first row
    // (no row at all before the first move)
    const offset = this.blackStarts && this.moves.length ? 1 : 0;
    for (let slot = 1; slot <= this.moves.length + offset; slot += 2) {
      const white = slot - offset;
      const black = white + 1;
      this.rows.push({
        number: this.firstMoveNumber + (slot - 1) / 2,
        plies: [
          white >= 1 ? white : null,
          ...(black <= this.moves.length ? [black] : []),
        ],
      });
    }
    this.scrollPending = true;
  }

  /** Keep the current move visible, scrolling the list only (not the page). */
  ngAfterViewChecked(): void {
    if (!this.scrollPending || !this.list) {
      return;
    }
    this.scrollPending = false;
    const list = this.list.nativeElement;
    const current = list.querySelector<HTMLElement>('.move.current');
    if (!current) {
      list.scrollTop = this.currentPly === 0 ? 0 : list.scrollHeight;
      return;
    }
    const top = current.offsetTop; // the list is the offset parent
    if (top < list.scrollTop) {
      list.scrollTop = top;
    } else if (
      top + current.offsetHeight >
      list.scrollTop + list.clientHeight
    ) {
      list.scrollTop = top + current.offsetHeight - list.clientHeight;
    }
  }

  select(ply: number): void {
    if (this.selectable) {
      this.plySelected.emit(ply);
    }
  }
}
