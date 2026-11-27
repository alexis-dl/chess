import { Component, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationKey } from '../i18n/translations';
import { Localized } from '../i18n/localized';
import { LEARN_SECTIONS } from '../learn/learn.component';
import { PUZZLE_PAGES } from '../puzzles/puzzles.component';
import { STATS_TABS } from '../stats/stats-pages';

/** An entry of a dropdown: its link, and its title (a key, or a content value). */
interface MenuItem {
  link: string[];
  key?: TranslationKey;
  title?: Localized;
}

/** A top-bar entry with a dropdown of sub-pages. */
interface NavMenu {
  id: string;
  key: TranslationKey;
  /** Where the entry itself leads: its first sub-page. */
  link: string;
  /** URLs starting with this make the entry active. */
  prefix: string;
  items: MenuItem[];
}

@Component({
    selector: 'app-tool-bar',
    templateUrl: './toolbar-sidenav.component.html',
    styleUrls: ['./toolbar-sidenav.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ToolbarSidenavComponent {
  readonly puzzlesMenu: NavMenu = {
    id: 'puzzles',
    key: 'nav.puzzles',
    link: '/puzzles/themes',
    prefix: '/puzzles',
    items: PUZZLE_PAGES.map(page => ({
      link: ['/puzzles', page.path],
      key: page.menuTitle,
    })),
  };
  readonly learnMenu: NavMenu = {
    id: 'learn',
    key: 'nav.learn',
    link: '/learn/opening',
    prefix: '/learn',
    items: LEARN_SECTIONS.map(section => ({
      link: ['/learn', section.id],
      title: section.title,
    })),
  };
  readonly statsMenu: NavMenu = {
    id: 'stats',
    key: 'nav.stats',
    link: '/stats/mine',
    prefix: '/stats',
    items: STATS_TABS.map(tab => ({ link: ['/stats', tab.id], key: tab.title })),
  };

  /** Id of the open dropdown, if any. */
  openMenu: string | null = null;

  constructor(private router: Router) {}

  isActive(menu: NavMenu): boolean {
    return this.router.url.startsWith(menu.prefix);
  }

  open(menu: NavMenu): void {
    this.openMenu = menu.id;
  }

  close(): void {
    this.openMenu = null;
  }

  /** Keyboard: keep the menu open while the focus is inside it. */
  onFocusOut(event: FocusEvent, element: HTMLElement): void {
    if (!element.contains(event.relatedTarget as Node)) {
      this.close();
    }
  }

  /** Close the menu on a click outside of it. */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!(event.target as Element | null)?.closest?.('.nav-menu')) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }
}
