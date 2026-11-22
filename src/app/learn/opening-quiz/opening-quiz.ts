import { Opening, OPENINGS } from 'src/app/openings/openings';

export const QUIZ_LENGTH = 10;
export const CHOICE_COUNT = 4;

export interface QuizQuestion {
  answer: Opening;
  /** The answer and the wrong choices, in random order. */
  choices: Opening[];
}

/** Returns a number in [0, 1), like Math.random (replaceable in tests). */
export type Random = () => number;

/** Openings asked about: a single move is too little to recognize. */
export function quizPool(): Opening[] {
  return OPENINGS.filter(opening => opening.moves.split(' ').length >= 2);
}

/**
 * Wrong choices are taken first among openings starting with the same move,
 * so that the question is not too easy. Openings whose line leads to the
 * answer (the Sicilian Defense for the Najdorf) are left out: their name
 * would also be right. Every choice has a distinct name.
 */
export function buildQuestion(answer: Opening, random: Random): QuizQuestion {
  const firstMove = answer.moves.split(' ')[0];
  const candidates = OPENINGS.filter(
    opening =>
      opening.name.en !== answer.name.en &&
      !answer.moves.startsWith(opening.moves + ' ')
  );
  const sameStart = candidates.filter(o => o.moves.startsWith(firstMove));
  const others = candidates.filter(o => !o.moves.startsWith(firstMove));

  const names = new Set([answer.name.en]);
  const wrong: Opening[] = [];
  for (const opening of [
    ...shuffle(sameStart, random),
    ...shuffle(others, random),
  ]) {
    if (wrong.length === CHOICE_COUNT - 1) {
      break;
    }
    if (!names.has(opening.name.en)) {
      names.add(opening.name.en);
      wrong.push(opening);
    }
  }
  return { answer, choices: shuffle([answer, ...wrong], random) };
}

/** QUIZ_LENGTH questions on distinct openings. */
export function buildQuiz(random: Random = Math.random): QuizQuestion[] {
  return shuffle(quizPool(), random)
    .slice(0, QUIZ_LENGTH)
    .map(answer => buildQuestion(answer, random));
}

/** Fisher-Yates shuffle of a copy. */
export function shuffle<T>(items: readonly T[], random: Random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
