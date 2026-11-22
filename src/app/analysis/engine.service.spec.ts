import { parseInfo } from './engine.service';

describe('parseInfo', () => {
  const line = (score: string) =>
    `info depth 14 seldepth 20 multipv 1 score ${score} nodes 1000 nps 9000 pv e2e4 e7e5 g1f3`;

  it('reads the depth, the score in pawns and the best move', () => {
    expect(parseInfo(line('cp 35'), true)).toEqual({
      depth: 14,
      pawns: 0.35,
      mate: null,
      bestMove: 'e2e4',
    });
  });

  it('turns the score to White’s point of view when Black is to move', () => {
    expect(parseInfo(line('cp 120'), false)?.pawns).toBe(-1.2);
    expect(parseInfo(line('mate 3'), false)?.mate).toBe(-3);
    expect(parseInfo(line('mate -2'), false)?.mate).toBe(2);
  });

  it('ignores bounds and lines without score or moves', () => {
    expect(parseInfo(line('cp 35 lowerbound'), true)).toBeNull();
    expect(parseInfo('info depth 1 currmove e2e4 currmovenumber 1', true))
      .toBeNull();
    expect(parseInfo('bestmove e2e4 ponder e7e5', true)).toBeNull();
    expect(parseInfo('uciok', true)).toBeNull();
  });

  it('reads a promotion as best move', () => {
    expect(
      parseInfo('info depth 5 score cp 900 pv a7a8q', true)?.bestMove
    ).toBe('a7a8q');
  });
});
