import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
} from '@angular/core';

const WIDTH = 300;
const HEIGHT = 100;
const PADDING = 6;

/** Small line chart of a series (oldest value first), with its last value. */
@Component({
  selector: 'app-line-chart',
  template: `
    @if (points) {
      <svg
        [attr.viewBox]="'0 0 ' + width + ' ' + height"
        preserveAspectRatio="none"
        role="img"
        [attr.aria-label]="label">
        <line
          class="grid"
          [attr.x1]="0"
          [attr.x2]="width"
          [attr.y1]="middle"
          [attr.y2]="middle" />
        <polyline class="line" [attr.points]="points" />
      </svg>
      <div class="scale">
        <span>{{ low }}</span>
        <span>{{ high }}</span>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      position: relative;
    }
    svg {
      display: block;
      width: 100%;
      height: 90px;
      overflow: visible;
    }
    .grid {
      stroke: var(--border);
      stroke-dasharray: 3 3;
      vector-effect: non-scaling-stroke;
    }
    .line {
      fill: none;
      stroke: var(--accent);
      stroke-width: 2;
      stroke-linejoin: round;
      vector-effect: non-scaling-stroke;
    }
    .scale {
      position: absolute;
      inset: 0 auto 0 0;
      display: flex;
      flex-direction: column-reverse;
      justify-content: space-between;
      color: var(--text-faint);
      font-size: 0.7em;
      pointer-events: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class LineChartComponent implements OnChanges {
  @Input({ required: true }) values: number[] = [];
  /** Fixed bounds (e.g. 0 and 100 for a percentage); else the data's. */
  @Input() min?: number;
  @Input() max?: number;
  @Input() label = '';

  readonly width = WIDTH;
  readonly height = HEIGHT;
  readonly middle = HEIGHT / 2;
  points: string | null = null;
  low = 0;
  high = 0;

  ngOnChanges(): void {
    const values = this.values;
    if (values.length < 2) {
      this.points = null;
      return;
    }
    let low = this.min ?? Math.min(...values);
    let high = this.max ?? Math.max(...values);
    if (high - low < 1) {
      low -= 1;
      high += 1;
    }
    this.low = Math.round(low);
    this.high = Math.round(high);
    const x = (index: number) =>
      PADDING + ((WIDTH - 2 * PADDING) * index) / (values.length - 1);
    const y = (value: number) =>
      HEIGHT - PADDING - ((HEIGHT - 2 * PADDING) * (value - low)) / (high - low);
    this.points = values
      .map((value, index) => `${x(index).toFixed(1)},${y(value).toFixed(1)}`)
      .join(' ');
  }
}
