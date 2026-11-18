import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { APP_LANGUAGES, AppLanguage, Localized } from './localized';
import { TranslationKey, TRANSLATIONS } from './translations';

/** Kept for compatibility with the former setting ('FR', 'EN'...). */
const STORAGE_KEY = 'selectedLanguage';
const DEFAULT_LANGUAGE: AppLanguage = 'fr';

export type TranslationParams = Record<string, string | number>;

/** Current language of the interface and translation of texts. */
@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private readonly languageSubject = new BehaviorSubject<AppLanguage>(
    this.initialLanguage()
  );
  readonly language$ = this.languageSubject.asObservable();

  constructor() {
    this.applyToDocument(this.language);
  }

  get language(): AppLanguage {
    return this.languageSubject.value;
  }

  setLanguage(language: AppLanguage): void {
    try {
      localStorage.setItem(STORAGE_KEY, language.toUpperCase());
    } catch {
      // storage unavailable: the choice only lasts for this visit
    }
    this.applyToDocument(language);
    this.languageSubject.next(language);
  }

  /** Text of a key in the current language, with its {placeholders} filled. */
  t(key: TranslationKey, params: TranslationParams = {}): string {
    const text = TRANSLATIONS[this.language][key] ?? key;
    return text.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in params ? String(params[name]) : match
    );
  }

  /** Version of a content value in the current language. */
  localize<T>(value: Localized<T>): T {
    return value[this.language];
  }

  /** Saved choice, else the browser language when supported, else French. */
  private initialLanguage(): AppLanguage {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      // ignore: fall back to the browser language
    }
    const candidates = [saved, ...(navigator.languages ?? [navigator.language])]
      .filter((code): code is string => !!code)
      .map(code => code.slice(0, 2).toLowerCase());
    return (
      candidates.find((code): code is AppLanguage =>
        APP_LANGUAGES.includes(code as AppLanguage)
      ) ?? DEFAULT_LANGUAGE
    );
  }

  private applyToDocument(language: AppLanguage): void {
    document.documentElement.lang = language;
  }
}
