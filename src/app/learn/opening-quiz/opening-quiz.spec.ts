import { OPENINGS } from 'src/app/openings/openings';
import {
  buildQuestion,
  buildQuiz,
  CHOICE_COUNT,
  QUIZ_LENGTH,
  quizPool,
  Random,
} from './opening-quiz';

/** Deterministic random numbers, for reproducible tests. */
function seeded(seed: number): Random {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

describe('opening quiz', () => {
  it('asks QUIZ_LENGTH questions on distinct openings', () => {
    const quiz = buildQuiz(seeded(1));
    expect(quiz.length).toBe(QUIZ_LENGTH);
    expect(new Set(quiz.map(q => q.answer)).size).toBe(QUIZ_LENGTH);
  });

  it('only asks about lines of at least two moves', () => {
    for (const opening of quizPool()) {
      expect(opening.moves.split(' ').length).toBeGreaterThanOrEqual(2);
    }
  });

  // every opening of the pool, with a few random seeds
  for (const answer of quizPool()) {
    it(`gives ${CHOICE_COUNT} valid choices for ${answer.name.en}`, () => {
      for (const seed of [1, 7, 42]) {
        const { choices } = buildQuestion(answer, seeded(seed));
        expect(choices.length).toBe(CHOICE_COUNT);
        expect(choices).toContain(answer);
        const names = choices.map(choice => choice.name.en);
        expect(new Set(names).size)
          .withContext('distinct names')
          .toBe(CHOICE_COUNT);
        for (const choice of choices) {
          if (choice !== answer) {
            expect(answer.moves.startsWith(choice.moves + ' '))
              .withContext(`${choice.name.en} leads to the answer`)
              .toBeFalse();
          }
        }
      }
    });
  }

  it('prefers wrong choices starting with the same move', () => {
    const najdorf = OPENINGS.find(o => o.eco === 'B90')!;
    const { choices } = buildQuestion(najdorf, seeded(3));
    for (const choice of choices) {
      expect(choice.moves.startsWith('e2e4')).toBeTrue();
    }
  });
});
