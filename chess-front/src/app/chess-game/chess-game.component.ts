import { Component } from '@angular/core';
import { Player } from './player.model';

@Component({
  selector: 'app-chess-game',
  templateUrl: './chess-game.component.html',
  styleUrls: ['./chess-game.component.scss'],
})
export class ChessGameComponent {
  player1: Player;
  player2: Player;

  constructor() {
    this.player1 = {
      name: 'Chacalito53',
      elo: 1548,
      profilePicture: 'assets/pictures/chacalito.png',
    };

    this.player2 = {
      name: 'Zozocracra',
      elo: 763,
      profilePicture: 'assets/pictures/default-profile-picture.jpg',
    };
  }
}
