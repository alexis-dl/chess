import { Injectable } from '@angular/core';

export type Theme = 'dark' | 'light';
export const THEMES: Theme[] = ['dark', 'light'];

const STORAGE_KEY = 'theme';

/**
 * Color theme, saved on this device. Applied as data-theme on <html>, which
 * selects the palette defined in styles.scss.
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme: Theme = this.load();

  constructor() {
    this.apply(this.currentTheme);
  }

  get theme(): Theme {
    return this.currentTheme;
  }

  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // storage unavailable: the theme only lasts for this visit
    }
    this.apply(theme);
  }

  private apply(theme: Theme): void {
    document.documentElement.dataset['theme'] = theme;
  }

  private load(): Theme {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return THEMES.includes(saved as Theme) ? (saved as Theme) : 'dark';
    } catch {
      return 'dark';
    }
  }
}
