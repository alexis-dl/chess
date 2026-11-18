import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LEARN_SECTIONS } from '../learn/learn.component';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './toolbar-sidenav.component.html',
  styleUrls: ['./toolbar-sidenav.component.scss'],
})
export class ToolbarSidenavComponent {
  @ViewChild('learnMenu') learnMenu?: ElementRef<HTMLElement>;

  readonly learnSections = LEARN_SECTIONS;
  learnOpen = false;

  constructor(private router: Router) {}

  get isLearnActive(): boolean {
    return this.router.url.startsWith('/learn');
  }

  openLearn(): void {
    this.learnOpen = true;
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
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeLearn();
  }
}
