import { Component, Input } from '@angular/core';
import { Player } from './player.model';

@Component({
  selector: 'app-player-panel',
  templateUrl: './player-panel.component.html',
  styleUrls: ['./player-panel.component.scss'],
})
export class PlayerPanelComponent {
  @Input() player?: Player;
}
