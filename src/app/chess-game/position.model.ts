export class Position {
  static readonly BOARD_SIZE = 8;

  constructor(public x: number, public y: number) {}

  equals(other: Position): boolean {
    return this.x === other.x && this.y === other.y;
  }

  addX(deltaX: number): Position {
    return new Position(this.x + deltaX, this.y);
  }

  addY(deltaY: number): Position {
    return new Position(this.x, this.y + deltaY);
  }

  isInsideTheBoard(): boolean {
    return (
      this.x >= 0 &&
      this.x < Position.BOARD_SIZE &&
      this.y >= 0 &&
      this.y < Position.BOARD_SIZE
    );
  }
}
