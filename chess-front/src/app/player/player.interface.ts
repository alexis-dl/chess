import { PlayerType } from './player-type.enum';

export interface Player {
  name: string;
  elo?: number;
  profilePicture?: string;
  playerType: PlayerType;
}
