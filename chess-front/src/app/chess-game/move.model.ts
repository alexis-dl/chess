import { Position } from './position.model';

export interface Move {
  oldPos: Position;
  newPos: Position;
}
