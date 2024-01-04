import { Player } from '../player-panel/player.model';

export class Bot extends Player {
  override name: string = 'Baby Bot';
  botType: string = 'random';
  override profilePicture?: string = 'assets/pictures/baby-bot-profile-pic.png';
}
