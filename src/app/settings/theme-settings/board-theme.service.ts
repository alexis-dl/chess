import { Injectable } from '@angular/core';
import { Localized } from 'src/app/i18n/localized';

export interface BoardTheme {
  id: string;
  name: Localized;
  light: string;
  dark: string;
}

/** Square colors the user can pick; the first one is the default. */
export const BOARD_THEMES: BoardTheme[] = [
  {
    id: 'classic',
    name: { en: 'Classic', fr: 'Classique' },
    light: '#eddcbd',
    dark: '#b48a65',
  },
  {
    id: 'forest',
    name: { en: 'Forest', fr: 'Forêt' },
    light: '#e8edd5',
    dark: '#6f9a56',
  },
  {
    id: 'sky',
    name: { en: 'Sky', fr: 'Ciel' },
    light: '#dfe6ec',
    dark: '#7f9cb3',
  },
  {
    id: 'ocean',
    name: { en: 'Ocean', fr: 'Océan' },
    light: '#e1eef4',
    dark: '#3f7ea6',
  },
  {
    id: 'mint',
    name: { en: 'Mint', fr: 'Menthe' },
    light: '#e3f1ea',
    dark: '#6fae95',
  },
  {
    id: 'sand',
    name: { en: 'Sand', fr: 'Sable' },
    light: '#f0e2c4',
    dark: '#c2a06c',
  },
  {
    id: 'walnut',
    name: { en: 'Walnut', fr: 'Noyer' },
    light: '#e0c9a6',
    dark: '#8b5e3c',
  },
  {
    id: 'coral',
    name: { en: 'Coral', fr: 'Corail' },
    light: '#f6e3e1',
    dark: '#d38f8a',
  },
  {
    id: 'lavender',
    name: { en: 'Lavender', fr: 'Lavande' },
    light: '#ece6f5',
    dark: '#8b73b8',
  },
  {
    id: 'stone',
    name: { en: 'Stone', fr: 'Pierre' },
    light: '#d9d9d9',
    dark: '#8c8c8c',
  },
  {
    id: 'slate',
    name: { en: 'Slate', fr: 'Ardoise' },
    light: '#c9ced6',
    dark: '#5b6575',
  },
  {
    id: 'night',
    name: { en: 'Night', fr: 'Nuit' },
    light: '#6b7382',
    dark: '#363c48',
  },
];

const STORAGE_KEY = 'boardTheme';

/**
 * Colors of the board squares, saved on this device. Applied as the
 * --square-light and --square-dark variables, read by every board.
 */
@Injectable({
  providedIn: 'root',
})
export class BoardThemeService {
  private current: BoardTheme = this.load();

  constructor() {
    this.apply(this.current);
  }

  get theme(): BoardTheme {
    return this.current;
  }

  setTheme(theme: BoardTheme): void {
    this.current = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme.id);
    } catch {
      // storage unavailable: the board only lasts for this visit
    }
    this.apply(theme);
  }

  private apply(theme: BoardTheme): void {
    const style = document.documentElement.style;
    style.setProperty('--square-light', theme.light);
    style.setProperty('--square-dark', theme.dark);
  }

  private load(): BoardTheme {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      // fall back to the default board
    }
    return BOARD_THEMES.find(theme => theme.id === saved) ?? BOARD_THEMES[0];
  }
}
