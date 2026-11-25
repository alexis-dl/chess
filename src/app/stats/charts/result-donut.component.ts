import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
} from '@angular/core';

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface Arc {
  kind: 'win' | 'draw' | 'loss';
  dash: string;
  offset: number;
}

/** Wins, draws and losses as a ring, with the score in the middle. */
@Component({
  selector: 'app-result-donut',
  template: `
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle class="track" cx="50" cy="50" [attr.r]="radius" />
      @for (arc of arcs; track arc.kind) {
        <circle
          [class]="arc.kind"
          cx="50"
          cy="50"
          [attr.r]="radius"
          [attr.stroke-dasharray]="arc.dash"
          [attr.stroke-dashoffset]="arc.offset" />
      }
    </svg>
    <span class="score">{{ score }}%</span>
  `,
  styles: `
    :host {
      position: relative;
      display: block;
      width: 120px;
      height: 120px;
    }
    svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }
    circle {
      fill: none;
      stroke-width: 14;
    }
    .track {
      stroke: var(--surface-sunken);
    }
    .win {
      stroke: var(--accent);
    }
    .draw {
      stroke: var(--text-faint);
    }
    .loss {
      stroke: var(--danger);
    }
    .score {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-strong);
      font-size: 1.3em;
      font-weight: 600;
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ResultDonutComponent implements OnChanges {
  @Input() wins = 0;
  @Input() draws = 0;
  @Input() losses = 0;

  readonly radius = RADIUS;
  arcs: Arc[] = [];
  score = 0;

  ngOnChanges(): void {
    const total = this.wins + this.draws + this.losses;
    this.score = total
      ? Math.round((100 * (this.wins + this.draws / 2)) / total)
      : 0;
    let start = 0;
    this.arcs = [];
    for (const [kind, count] of [
      ['win', this.wins],
      ['draw', this.draws],
      ['loss', this.losses],
    ] as const) {
      if (!count) {
        continue;
      }
      const length = (CIRCUMFERENCE * count) / total;
      this.arcs.push({
        kind,
        dash: `${length} ${CIRCUMFERENCE - length}`,
        offset: -start,
      });
      start += length;
    }
  }
}
