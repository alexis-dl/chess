import { PlayerType } from './player-type.enum';
import { Player } from './player.interface';

export class Player1 implements Player {
  name: string = 'Player name';
  elo: number = 800;
  profilePicture?: string = 'assets/pictures/default-profile-picture.jpg';
  playerType: PlayerType = PlayerType.User;
}
