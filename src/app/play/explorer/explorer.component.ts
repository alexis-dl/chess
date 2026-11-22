import { Component, DoCheck } from '@angular/core';
import { ChessUtilsService } from 'src/app/chess-game/chess-utils.service';
import { Chessboard } from 'src/app/chess-game/chessboard.model';
import { Opening } from 'src/app/openings/openings';
import {
  openingPositionKey,
  OpeningService,
} from 'src/app/openings/opening.service';

/** Free board where the user plays the moves of both sides. */
@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss'],
})
export class ExplorerComponent implements DoCheck {
  readonly chessBoard = new Chessboard(this.chessUtilsService);
  /** Last known opening reached on the board. */
  opening: Opening | null = null;

  private renderedKey = '';

  constructor(
    private chessUtilsService: ChessUtilsService,
    private openingService: OpeningService
  ) {}

  /** Look the opening up again only when the position changed. */
  ngDoCheck(): void {
    const key =
      openingPositionKey(this.chessBoard.saveState()) +
      this.chessBoard.getHistory().length;
    if (key !== this.renderedKey) {
      this.renderedKey = key;
      this.opening = this.openingService.identify(this.chessBoard);
    }
  }
}
