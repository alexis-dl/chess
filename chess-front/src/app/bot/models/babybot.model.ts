import { Player } from 'src/app/player/player.interface';
import { PlayerType } from '../../player/player-type.enum';

export class BabyBot implements Player {
  elo?: number | undefined;
  name: string = 'Baby Bot';
  playerType: PlayerType = PlayerType.Random;
  profilePicture: string = 'assets/pictures/baby-bot-profile-pic.png';
}
