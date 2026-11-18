import { Position } from '../chess-game/position.model';
import { parseUci, toUci } from './puzzle-moves';

describe('puzzle moves (UCI)', () => {
  it('parses a move', () => {
    const { from, to, promotion } = parseUci('g1f3');
    expect(from).toEqual(new Position(6, 0));
    expect(to).toEqual(new Position(5, 2));
    expect(promotion).toBeUndefined();
  });

  it('parses promotions', () => {
    expect(parseUci('e7e8q').promotion).toBe('queen');
    expect(parseUci('a2a1n').promotion).toBe('knight');
  });

  it('rejects invalid moves', () => {
    expect(() => parseUci('e9e4')).toThrowError();
    expect(() => parseUci('e7e8k')).toThrowError();
    expect(() => parseUci('e2')).toThrowError();
  });

  it('formats moves back', () => {
    for (const uci of ['e2e4', 'e7e8q', 'b2b1n', 'h7h8r', 'c7c8b']) {
      const { from, to, promotion } = parseUci(uci);
      expect(toUci(from, to, promotion)).toBe(uci);
    }
  });
});
