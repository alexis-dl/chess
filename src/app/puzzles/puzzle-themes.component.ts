import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslationKey } from '../i18n/translations';
import {
  PUZZLE_THEMES,
  PuzzleCategory,
  PuzzleThemeInfo,
  PUZZLES,
} from './puzzle.model';

/** Same key as PuzzlesComponent: ids of the solved puzzles of the collection. */
const SOLVED_STORAGE_KEY = 'chess.solvedPuzzles';

interface ThemeCard {
  theme: PuzzleThemeInfo;
  total: number;
  solved: number;
}

/** Puzzle themes page: one card per theme, tactical ideas then openings. */
@Component({
  selector: 'app-puzzle-themes',
  templateUrl: './puzzle-themes.component.html',
  styleUrls: ['./puzzle-themes.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PuzzleThemesComponent {
  readonly categories: { id: PuzzleCategory; cards: ThemeCard[] }[];

  constructor() {
    const solved = readSolved();
    const card = (theme: PuzzleThemeInfo): ThemeCard => {
      const puzzles = PUZZLES.filter(puzzle => puzzle.theme === theme.id);
      return {
        theme,
        total: puzzles.length,
        solved: puzzles.filter(puzzle => solved.has(puzzle.id)).length,
      };
    };
    this.categories = (['tactics', 'openings'] as PuzzleCategory[]).map(
      id => ({
        id,
        cards: PUZZLE_THEMES.filter(theme => theme.category === id).map(card),
      })
    );
  }

  categoryKey(category: PuzzleCategory): TranslationKey {
    return `puzzles.category.${category}`;
  }

  titleKey(theme: PuzzleThemeInfo): TranslationKey {
    return `puzzles.theme.${theme.id}`;
  }

  infoKey(theme: PuzzleThemeInfo): TranslationKey {
    return `puzzles.themeInfo.${theme.id}`;
  }
}

function readSolved(): Set<string> {
  try {
    const ids: unknown = JSON.parse(
      localStorage.getItem(SOLVED_STORAGE_KEY) ?? '[]'
    );
    return new Set(Array.isArray(ids) ? ids.map(String) : []);
  } catch {
    return new Set();
  }
}
