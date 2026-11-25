import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Color } from '../chess-game/piece.model';
import { Evaluation } from './engine.service';

/** Share of the bar given to White, from 0 to 100 (same curve as Analysis). */
export function whiteShareOf(evaluation: Evaluation | null): number {
  if (!evaluation) {
    return 50;
  }
  if (evaluation.mate !== null) {
    return evaluation.mate > 0 ? 100 : 0;
  }
  // logistic curve: +2 gives about 70 %, +5 about 90 %
  return 100 / (1 + Math.exp(-0.45 * (evaluation.pawns ?? 0)));
}

/** '+0.4', '-1.2', 'M3', '-M2', '…' while unknown. */
export function evaluationLabelOf(evaluation: Evaluation | null): string {
  if (!evaluation) {
    return '…';
  }
  if (evaluation.mate !== null) {
    return (evaluation.mate < 0 ? '-M' : 'M') + Math.abs(evaluation.mate);
  }
  const pawns = evaluation.pawns ?? 0;
  return (pawns > 0 ? '+' : '') + pawns.toFixed(1);
}

/**
 * Vertical evaluation bar: White's share, from White's side of the board.
 * A finished game shows its result instead.
 */
@Component({
  selector: 'app-eval-bar',
  template: `
    <div
      class="bar"
      [class.flipped]="orientation === 'black'"
      [attr.title]="'analysis.evaluation' | t">
      <div class="white" [style.height.%]="share"></div>
      <span class="label" [class.on-white]="share >= 50">{{ label }}</span>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
    .bar {
      position: relative;
      display: flex;
      flex-direction: column-reverse; /* White's part grows from the bottom */
      height: 100%;
      overflow: hidden;
      border-radius: 4px;
      background: #403d39;
    }
    .bar.flipped {
      flex-direction: column;
    }
    .white {
      width: 100%;
      background: #f0f0ee;
      transition: height 0.4s ease;
    }
    .label {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 6px;
      color: #f0f0ee;
      font-size: 0.62em;
      font-weight: 700;
      text-align: center;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      margin: 0 auto;
    }
    .label.on-white {
      color: #403d39;
    }
    .flipped .label {
      top: 6px;
      bottom: auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class EvalBarComponent {
  @Input() evaluation: Evaluation | null = null;
  @Input() orientation: Color = 'white';
  /** '1-0', '0-1' or '½-½' when the game is over. */
  @Input() result: string | null = null;

  get share(): number {
    if (this.result) {
      return this.result === '1-0' ? 100 : this.result === '0-1' ? 0 : 50;
    }
    return whiteShareOf(this.evaluation);
  }

  get label(): string {
    return this.result ?? evaluationLabelOf(this.evaluation);
  }
}
