import { Component } from '@angular/core';
import { BabyBot } from 'src/app/bot/models/babybot.model';
import { PlayerType } from 'src/app/player/player-type.enum';
import { Player } from 'src/app/player/player.model';

@Component({
  selector: 'app-play-vs-bot',
  templateUrl: './play-vs-bot.component.html',
  styleUrls: ['./play-vs-bot.component.scss'],
})
export class PlayVsBotComponent {
  player1: Player;
  bot: Player;

  constructor() {
    this.player1 = {
      name: 'Chacalito53',
      elo: 1548,
      profilePicture: 'assets/pictures/chacalito-profile-pic.png',
      playerType: PlayerType.User,
    };

    this.bot = new BabyBot();
  }
}
