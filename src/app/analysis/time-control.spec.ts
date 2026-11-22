import { formatTimeControl } from './time-control';

describe('formatTimeControl', () => {
  const cases: [string, string, string][] = [
    // value, English, French
    ['600', '10 min', '10 min'],
    ['180+2', '3+2', '3+2'],
    ['60', '1 min', '1 min'],
    ['30', '30 s', '30 s'],
    ['30+1', '30 s + 1 s', '30 s + 1 s'],
    ['5400+30', '90+30', '90+30'],
    ['5400', '1 h 30', '1 h 30'],
    ['1/86400', '1 day per move', '1 jour par coup'],
    ['1/259200', '3 days per move', '3 jours par coup'],
    [
      '40/7200:3600',
      '40 moves in 2 h, then 1 h',
      '40 coups en 2 h, puis 1 h',
    ],
    ['?', '?', '?'],
    ['-', '-', '-'],
  ];

  for (const [value, en, fr] of cases) {
    it(`reads ${value}`, () => {
      expect(formatTimeControl(value, 'en')).toBe(en);
      expect(formatTimeControl(value, 'fr')).toBe(fr);
    });
  }
});
