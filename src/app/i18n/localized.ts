export type AppLanguage = 'en' | 'fr';

export const APP_LANGUAGES: AppLanguage[] = ['en', 'fr'];

/** A value given in every language of the app (used for content: lessons...). */
export type Localized<T = string> = Record<AppLanguage, T>;
