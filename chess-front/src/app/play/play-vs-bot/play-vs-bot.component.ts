import { Component } from '@angular/core';
import { Bot } from '../../bot/bot.model';
import { Player } from '../../player-panel/player.model';

@Component({
  selector: 'app-play-vs-bot',
  templateUrl: './play-vs-bot.component.html',
  styleUrls: ['./play-vs-bot.component.scss'],
})
export class PlayVsBotComponent {
  player1: Player;
  bot: Bot;

  constructor() {
    this.player1 = {
      name: 'Chacalito53',
      elo: 1548,
      profilePicture: 'assets/pictures/chacalito-profile-pic.png',
    };

    this.bot = new Bot();
  }
}
