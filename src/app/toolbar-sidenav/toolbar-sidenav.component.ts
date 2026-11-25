import { Component, ElementRef, HostListener, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { LEARN_SECTIONS } from '../learn/learn.component';
import { STATS_TABS } from '../stats/stats-pages';

@Component({
    selector: 'app-tool-bar',
    templateUrl: './toolbar-sidenav.component.html',
    styleUrls: ['./toolbar-sidenav.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ToolbarSidenavComponent {
  @ViewChild('learnMenu') learnMenu?: ElementRef<HTMLElement>;
  @ViewChild('statsMenu') statsMenu?: ElementRef<HTMLElement>;

  readonly learnSections = LEARN_SECTIONS;
  readonly statsTabs = STATS_TABS;
  learnOpen = false;
  statsOpen = false;

  constructor(private router: Router) {}

  get isLearnActive(): boolean {
    return this.router.url.startsWith('/learn');
  }

  get isStatsActive(): boolean {
    return this.router.url.startsWith('/stats');
  }

  openLearn(): void {
    this.learnOpen = true;
    this.statsOpen = false;
  }

  openStats(): void {
    this.statsOpen = true;
    this.learnOpen = false;
  }

  closeStats(): void {
    this.statsOpen = false;
  }

  onStatsFocusOut(event: FocusEvent): void {
    if (!this.statsMenu?.nativeElement.contains(event.relatedTarget as Node)) {
      this.closeStats();
    }
  }

  closeLearn(): void {
    this.learnOpen = false;
  }

  /** Keyboard: keep the menu open while the focus is inside it. */
  onLearnFocusOut(event: FocusEvent): void {
    if (!this.learnMenu?.nativeElement.contains(event.relatedTarget as Node)) {
      this.closeLearn();
    }
  }

  /** Close the menu on a click outside of it. */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.learnMenu?.nativeElement.contains(event.target as Node)) {
      this.closeLearn();
    }
    if (!this.statsMenu?.nativeElement.contains(event.target as Node)) {
      this.closeStats();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeLearn();
    this.closeStats();
  }
}
