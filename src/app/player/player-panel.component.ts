import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { PieceName } from '../chess-game/piece.model';
import { Player } from './player.model';

/** One line of the game panel: avatar, name, rating, captured pieces. */
@Component({
    selector: 'app-player-panel',
    templateUrl: './player-panel.component.html',
    styleUrls: ['./player-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PlayerPanelComponent {
  @Input() player?: Player;
  /** It is this player's turn. */
  @Input() active = false;
  /** Shown next to the name while the player is to move (e.g. "thinking…"). */
  @Input() status = '';
  /** Opponent pieces taken by this player. */
  @Input() captured: PieceName[] = [];
  /** Material advantage in pawns, shown when positive. */
  @Input() advantage = 0;

  pieceImage(piece: PieceName): string {
    return `assets/chess-pieces/${piece}.svg`;
  }
}
