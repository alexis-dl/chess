import { formatClock } from './analysis.component';

describe('formatClock', () => {
  it('writes minutes and seconds, hours when needed', () => {
    expect(formatClock(600)).toBe('10:00');
    expect(formatClock(598.1)).toBe('9:58');
    expect(formatClock(65)).toBe('1:05');
    expect(formatClock(3725)).toBe('1:02:05');
  });

  it('shows tenths in the last 20 seconds', () => {
    expect(formatClock(9.4)).toBe('0:09.4');
    expect(formatClock(19.5)).toBe('0:19.5');
    expect(formatClock(9)).toBe('0:09');
  });
});
