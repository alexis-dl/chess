import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';
import { Opening } from '../openings';

/** Name of the opening reached by a game, in the current language. */
@Component({
  selector: 'app-opening-label',
  template: `
    <mat-icon class="icon">menu_book</mat-icon>
    <span class="name">{{ opening.name | localize }}</span>
  `,
  styleUrls: ['./opening-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class OpeningLabelComponent {
  @Input() opening!: Opening;

  /** The ECO code stays internal, but can be read from the DOM. */
  @HostBinding('attr.data-eco')
  get eco(): string {
    return this.opening.eco;
  }
}
