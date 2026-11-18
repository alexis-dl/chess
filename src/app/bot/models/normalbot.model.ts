import { Player } from 'src/app/player/player.model';
import { PlayerType } from '../../player/player-type.enum';

export class NormalBot implements Player {
  elo?: number;
  name = 'Normal Bot';
  playerType: PlayerType = PlayerType.Minimax;
  profilePicture = 'assets/pictures/normal-bot-profile-pic.png';
}
