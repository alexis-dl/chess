import { BOARD_THEMES, BoardThemeService } from './board-theme.service';

describe('BoardThemeService', () => {
  const clear = () => {
    localStorage.removeItem('boardTheme');
    document.documentElement.style.removeProperty('--square-light');
    document.documentElement.style.removeProperty('--square-dark');
  };
  beforeEach(clear);
  afterEach(clear);

  const cssVar = (name: string) =>
    document.documentElement.style.getPropertyValue(name);

  it('has distinct ids and valid colors', () => {
    const ids = BOARD_THEMES.map(theme => theme.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const theme of BOARD_THEMES) {
      expect(theme.light).toMatch(/^#[0-9a-f]{6}$/);
      expect(theme.dark).toMatch(/^#[0-9a-f]{6}$/);
      expect(theme.name.fr).toBeTruthy();
    }
  });

  it('applies the default board, then the saved one on the next visit', () => {
    const service = new BoardThemeService();
    expect(service.theme).toBe(BOARD_THEMES[0]);
    expect(cssVar('--square-light')).toBe(BOARD_THEMES[0].light);

    service.setTheme(BOARD_THEMES[2]);
    expect(cssVar('--square-dark')).toBe(BOARD_THEMES[2].dark);
    expect(new BoardThemeService().theme).toBe(BOARD_THEMES[2]);
  });

  it('falls back to the default board for an unknown saved id', () => {
    localStorage.setItem('boardTheme', 'removed-theme');
    expect(new BoardThemeService().theme).toBe(BOARD_THEMES[0]);
  });
});
