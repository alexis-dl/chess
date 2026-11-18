import { TestBed } from '@angular/core/testing';
import { LEARN_SECTIONS } from '../learn/learn.component';
import { LESSONS } from '../learn/lessons/lesson.model';
import { PUZZLES } from '../puzzles/puzzle.model';
import { I18nService } from './i18n.service';
import { APP_LANGUAGES, Localized } from './localized';
import { TranslationKey, TRANSLATIONS } from './translations';

const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();

describe('translations', () => {
  const keys = Object.keys(TRANSLATIONS.en) as TranslationKey[];

  for (const language of APP_LANGUAGES) {
    it(`has a non-empty text for every key in ${language}`, () => {
      const empty = keys.filter(key => !TRANSLATIONS[language][key]?.trim());
      expect(empty).toEqual([]);
      expect(Object.keys(TRANSLATIONS[language]).sort()).toEqual(
        [...keys].sort()
      );
    });
  }

  it('uses the same {placeholders} in every language', () => {
    const mismatches = keys.filter(key =>
      APP_LANGUAGES.some(
        language =>
          placeholders(TRANSLATIONS[language][key]).join() !==
          placeholders(TRANSLATIONS.en[key]).join()
      )
    );
    expect(mismatches).toEqual([]);
  });

  it('has a theme name for every puzzle', () => {
    for (const puzzle of PUZZLES) {
      expect(keys).toContain(`puzzles.theme.${puzzle.theme}` as TranslationKey);
    }
  });

  describe('content', () => {
    const texts: { where: string; value: Localized }[] = [
      ...LEARN_SECTIONS.flatMap(section => [
        { where: `${section.id} title`, value: section.title },
        { where: `${section.id} description`, value: section.description },
      ]),
      ...LESSONS.flatMap(lesson => [
        { where: `${lesson.id} title`, value: lesson.title },
        { where: `${lesson.id} summary`, value: lesson.summary },
        ...lesson.steps.map((step, i) => ({
          where: `${lesson.id} step ${i + 1} title`,
          value: step.title,
        })),
      ]),
    ];

    it('is translated in every language', () => {
      const missing = texts.filter(({ value }) =>
        APP_LANGUAGES.some(language => !value[language]?.trim())
      );
      expect(missing.map(text => text.where)).toEqual([]);
    });

    it('has the same paragraphs in every language for each lesson step', () => {
      for (const lesson of LESSONS) {
        lesson.steps.forEach((step, i) => {
          for (const language of APP_LANGUAGES) {
            expect(step.text[language].length)
              .withContext(`${lesson.id} step ${i + 1} (${language})`)
              .toBe(step.text.en.length);
            expect(step.text[language].every(p => p.trim().length > 0))
              .withContext(`${lesson.id} step ${i + 1} (${language})`)
              .toBeTrue();
          }
        });
      }
    });
  });
});

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(() => {
    localStorage.removeItem('selectedLanguage');
    TestBed.configureTestingModule({});
    service = TestBed.inject(I18nService);
  });

  afterEach(() => localStorage.removeItem('selectedLanguage'));

  it('translates keys and fills placeholders', () => {
    service.setLanguage('en');
    expect(service.t('nav.play')).toBe('Play');
    expect(service.t('puzzles.solvedCount', { solved: 3, total: 8 })).toBe(
      '3 / 8 solved'
    );
    service.setLanguage('fr');
    expect(service.t('nav.play')).toBe('Jouer');
    expect(service.t('puzzles.mateIn', { moves: 2 })).toBe('Mat en 2');
  });

  it('localizes content values', () => {
    service.setLanguage('fr');
    expect(service.localize({ en: 'Opening', fr: 'Ouverture' })).toBe(
      'Ouverture'
    );
  });

  it('remembers the language and sets the document language', () => {
    const emitted: string[] = [];
    service.language$.subscribe(language => emitted.push(language));
    service.setLanguage('en');
    service.setLanguage('fr');
    expect(localStorage.getItem('selectedLanguage')).toBe('FR');
    expect(document.documentElement.lang).toBe('fr');
    expect(emitted.slice(-2)).toEqual(['en', 'fr']);
  });
});
