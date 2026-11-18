import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from '@angular/core';

interface MoveRow {
  number: number;
  /** Plies of the white and black moves (1 for the first move). */
  plies: number[];
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
})
export class MoveListComponent implements OnChanges, AfterViewChecked {
  @ViewChild('list') list?: ElementRef<HTMLElement>;

  /** Moves in standard algebraic notation. */
  @Input() moves: readonly string[] = [];
  /** Number of moves played in the displayed position. */
  @Input() currentPly = 0;
  @Input() selectable = false;
  @Output() plySelected = new EventEmitter<number>();

  rows: MoveRow[] = [];
  private scrollPending = false;

  ngOnChanges(): void {
    this.rows = [];
    for (let ply = 1; ply <= this.moves.length; ply += 2) {
      this.rows.push({
        number: (ply + 1) / 2,
        plies: ply < this.moves.length ? [ply, ply + 1] : [ply],
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
