import { AppLanguage } from '../i18n/localized';

const WORDS: Record<
  AppLanguage,
  { day: string; days: string; perMove: string; moves: string; then: string }
> = {
  en: {
    day: 'day',
    days: 'days',
    perMove: 'per move',
    moves: 'moves in',
    then: 'then',
  },
  fr: {
    day: 'jour',
    days: 'jours',
    perMove: 'par coup',
    moves: 'coups en',
    then: 'puis',
  },
};

const DAY = 86400;

/** 30 → '30 s', 600 → '10 min', 5400 → '1 h 30', 7200 → '2 h', 86400 → '1 day'. */
function duration(seconds: number, language: AppLanguage): string {
  const words = WORDS[language];
  if (seconds >= DAY && seconds % DAY === 0) {
    const days = seconds / DAY;
    return `${days} ${days > 1 ? words.days : words.day}`;
  }
  if (seconds >= 3600 && seconds % 60 === 0) {
    const hours = Math.floor(seconds / 3600);
    const minutes = (seconds % 3600) / 60;
    return minutes ? `${hours} h ${String(minutes).padStart(2, '0')}` : `${hours} h`;
  }
  if (seconds >= 60 && seconds % 60 === 0) {
    return `${seconds / 60} min`;
  }
  return `${seconds} s`;
}

/** One period: '600', '180+2', '40/7200', '1/86400' or '*60'. */
function period(text: string, language: AppLanguage): string | null {
  const match = /^(?:(\d+)\/)?(\*)?(\d+)(?:\+(\d+))?$/.exec(text);
  if (!match) {
    return null;
  }
  const [, moves, sandclock, base, increment] = match;
  const seconds = Number(base);
  const words = WORDS[language];
  if (moves === '1') {
    return `${duration(seconds, language)} ${words.perMove}`; // correspondence
  }
  if (moves) {
    return `${moves} ${words.moves} ${duration(seconds, language)}`;
  }
  if (increment !== undefined && !sandclock) {
    // blitz notation: minutes + seconds per move, e.g. 3+2
    return seconds % 60 === 0
      ? `${seconds / 60}+${increment}`
      : `${duration(seconds, language)} + ${increment} s`;
  }
  return duration(seconds, language);
}

/**
 * Readable form of a PGN TimeControl header ('600' → '10 min',
 * '180+2' → '3+2'). Unknown formats ('?', '-') are returned as they are.
 */
export function formatTimeControl(
  value: string,
  language: AppLanguage
): string {
  const periods = value.trim().split(':');
  const parts = periods.map(part => period(part, language));
  if (parts.some(part => part === null)) {
    return value;
  }
  return parts.join(`, ${WORDS[language].then} `);
}
