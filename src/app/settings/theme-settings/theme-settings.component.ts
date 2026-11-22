import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { I18nService } from 'src/app/i18n/i18n.service';
import { TranslationKey } from 'src/app/i18n/translations';
import {
  BOARD_THEMES,
  BoardTheme,
  BoardThemeService,
} from './board-theme.service';
import { Theme, THEMES, ThemeService } from './theme.service';

const THEME_LABELS: Record<Theme, TranslationKey> = {
  dark: 'settings.theme.dark',
  light: 'settings.theme.light',
};

const THEME_ICONS: Record<Theme, string> = {
  dark: 'dark_mode',
  light: 'light_mode',
};

interface PreviewSquare {
  /** Rank shown on the squares of the a-file. */
  rank?: number;
  light: boolean;
  piece?: string;
}

/** Corner of a position (a8 to c6), to preview the board colors. */
const PREVIEW_PIECES: (string | undefined)[][] = [
  ['black-rook', 'black-king', 'black-knight'],
  [undefined, 'black-pawn', undefined],
  ['white-bishop', undefined, 'white-queen'],
];

/**
 * Interface theme (applied right away) and board colors (previewed, then
 * applied by Save).
 */
@Component({
  selector: 'app-theme-settings',
  templateUrl: './theme-settings.component.html',
  styleUrls: ['./theme-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ThemeSettingsComponent {
  readonly themes = THEMES.map(theme => ({
    theme,
    label: THEME_LABELS[theme],
    icon: THEME_ICONS[theme],
  }));
  readonly boardThemes = BOARD_THEMES;
  readonly preview: PreviewSquare[][] = PREVIEW_PIECES.map((row, i) =>
    row.map((piece, file) => {
      const rank = 8 - i;
      return {
        rank: file === 0 ? rank : undefined,
        light: (file + rank) % 2 === 0,
        piece,
      };
    })
  );
  /** Board picked in the grid, not saved yet. */
  boardTheme = this.boardThemeService.theme;

  constructor(
    readonly themeService: ThemeService,
    private boardThemeService: BoardThemeService,
    private snackBar: MatSnackBar,
    private i18n: I18nService
  ) {}

  get boardChanged(): boolean {
    return this.boardTheme !== this.boardThemeService.theme;
  }

  cancelBoard(): void {
    this.boardTheme = this.boardThemeService.theme;
  }

  saveBoard(): void {
    if (this.boardChanged) {
      this.boardThemeService.setTheme(this.boardTheme);
      this.snackBar.open(
        this.i18n.t('settings.board.saved'),
        undefined,
        { duration: 3000 }
      );
    }
  }

  squareColor(square: PreviewSquare, theme: BoardTheme): string {
    return square.light ? theme.light : theme.dark;
  }
}
