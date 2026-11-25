import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
} from '@angular/core';
import { TranslationKey } from '../../i18n/translations';
import {
  computeMetrics,
  Metric,
  METRIC_IDS,
  MetricId,
  results,
  rollingAverage,
} from '../metrics';
import { StatsState } from '../stats.service';

interface MetricCard {
  id: MetricId;
  metric: Metric;
  /** Change since the previous period, in points; null if unknown. */
  delta: number | null;
  chart: number[];
}

/**
 * Cards of a player's statistics over a period: rating, results, and the
 * indicators computed from the analysis of the games.
 */
@Component({
  selector: 'app-stats-dashboard',
  templateUrl: './stats-dashboard.component.html',
  styleUrls: ['./stats-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class StatsDashboardComponent implements OnChanges {
  @Input({ required: true }) state!: StatsState;
  /** Show the "Practice" button of the tactics (own account). */
  @Input() practice = false;

  games = 0;
  wins = 0;
  draws = 0;
  losses = 0;
  ratings: number[] = [];
  ratingDelta: number | null = null;
  cards: MetricCard[] = [];
  /** The analysis of the period's games is not finished. */
  analysing = false;

  ngOnChanges(): void {
    const { records, periodStart } = this.state;
    const current = records.filter(record => record.game.date >= periodStart);
    const previous = records.filter(record => record.game.date < periodStart);
    this.games = current.length;
    ({ wins: this.wins, draws: this.draws, losses: this.losses } =
      results(current));

    this.ratings = [...current]
      .sort((a, b) => a.game.date - b.game.date)
      .map(record => record.rating)
      .filter((rating): rating is number => rating !== null);
    this.ratingDelta =
      this.ratings.length > 1
        ? this.ratings[this.ratings.length - 1] - this.ratings[0]
        : null;

    const now = computeMetrics(current);
    const before = computeMetrics(previous);
    this.cards = METRIC_IDS.map(id => ({
      id,
      metric: now[id],
      delta:
        now[id].value !== null && before[id].value !== null
          ? now[id].value! - before[id].value!
          : null,
      chart: rollingAverage(now[id].perGame),
    }));
    this.analysing = current.some(record => !record.values);
  }

  titleKey(id: MetricId): TranslationKey {
    return `stats.metric.${id}`;
  }

  helpKey(id: MetricId): TranslationKey {
    return `stats.metric.${id}.help`;
  }

  sampleKey(id: MetricId): TranslationKey {
    return id === 'tactics' ? 'stats.sample.moments' : 'stats.sample.games';
  }

  /** No time management without clocks, the others need the analysis. */
  needsAnalysis(id: MetricId): boolean {
    return id !== 'time';
  }
}
