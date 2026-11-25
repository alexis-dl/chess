import { ChangeDetectionStrategy, Component, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Color } from '../chess-game/piece.model';
import { I18nService } from '../i18n/i18n.service';
import { TranslationKey } from '../i18n/translations';
import { GamePlatform } from '../puzzles/generator/game-sources';
import { GameRecord, repertoire, RepertoireLine } from './metrics';
import { StatsService, StatsState } from './stats.service';

export type StatsTab = 'mine' | 'scouting' | 'history';

/** The Statistics sub-pages, in the order of the tabs and of the menu. */
export const STATS_TABS: { id: StatsTab; title: TranslationKey }[] = [
  { id: 'mine', title: 'stats.tab.mine' },
  { id: 'scouting', title: 'stats.tab.scouting' },
  { id: 'history', title: 'stats.tab.history' },
];

/** A game to open in the Analysis page (see AnalysisComponent.ngOnInit). */
@Injectable({
  providedIn: 'root',
})
export class AnalysisHandoffService {
  private pending: { pgn: string; orientation: Color } | null = null;

  open(pgn: string, orientation: Color): void {
    this.pending = { pgn, orientation };
  }

  /** The game to open, once: it is forgotten when read. */
  take(): { pgn: string; orientation: Color } | null {
    const pending = this.pending;
    this.pending = null;
    return pending;
  }
}

/** Statistics page: its tabs, and the selected sub-page. */
@Component({
  selector: 'app-stats',
  template: `
    <div class="stats">
      <nav class="tabs" [attr.aria-label]="'nav.stats' | t">
        @for (tab of tabs; track tab.id) {
          <a [routerLink]="['/stats', tab.id]" routerLinkActive="active">
            {{ tab.title | t }}
          </a>
        }
      </nav>
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class StatsComponent {
  readonly tabs = STATS_TABS;
}

/** The user's own statistics. */
@Component({
  selector: 'app-my-stats',
  template: `
    <app-stats-filters page="mine"></app-stats-filters>
    @if (stats.mine.state$ | async; as state) {
      @if (state.records.length || state.status === 'done') {
        <app-stats-dashboard
          [state]="state"
          [practice]="true"></app-stats-dashboard>
      } @else if (state.status === 'idle') {
        <p class="intro">{{ 'stats.empty' | t }}</p>
      }
    }
  `,
  styleUrls: ['./stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class MyStatsComponent {
  constructor(readonly stats: StatsService) {}
}

/** Another player's openings, results and statistics, to prepare a game. */
@Component({
  selector: 'app-scouting',
  templateUrl: './scouting.component.html',
  styleUrls: ['./stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ScoutingComponent {
  readonly colors: Color[] = ['white', 'black'];
  private cache: { records: GameRecord[]; lines: Record<Color, RepertoireLine[]> } | null =
    null;

  constructor(readonly stats: StatsService) {}

  /** Openings of the period, per color (computed once per list of games). */
  repertoire(state: StatsState, color: Color): RepertoireLine[] {
    if (this.cache?.records !== state.records) {
      const period = state.records.filter(
        record => record.game.date >= state.periodStart
      );
      this.cache = {
        records: state.records,
        lines: {
          white: repertoire(period, 'white'),
          black: repertoire(period, 'black'),
        },
      };
    }
    return this.cache.lines[color].slice(0, 10);
  }

  colorKey(color: Color): TranslationKey {
    return `stats.repertoire.${color}`;
  }
}

/** The user's games of the period, to open in the Analysis page. */
@Component({
  selector: 'app-game-history',
  templateUrl: './game-history.component.html',
  styleUrls: ['./stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class GameHistoryComponent {
  constructor(
    readonly stats: StatsService,
    private handoff: AnalysisHandoffService,
    private router: Router,
    private i18n: I18nService
  ) {}

  inPeriod(state: StatsState): GameRecord[] {
    return state.records.filter(
      record => record.game.date >= state.periodStart
    );
  }

  resultKey(record: GameRecord): TranslationKey {
    return record.score === 1
      ? 'stats.result.win'
      : record.score === 0
        ? 'stats.result.loss'
        : 'stats.result.draw';
  }

  speedKey(record: GameRecord): TranslationKey {
    return `puzzles.speed.${record.game.speed}`;
  }

  moveCount(record: GameRecord): number {
    return Math.ceil(record.plies / 2);
  }

  formatDate(date: number): string {
    return new Date(date).toLocaleDateString(this.i18n.language, {
      day: 'numeric',
      month: 'short',
    });
  }

  platformName(platform: GamePlatform): string {
    return platform === 'lichess' ? 'Lichess' : 'Chess.com';
  }

  open(record: GameRecord): void {
    this.handoff.open(record.game.pgn, record.color);
    void this.router.navigate(['/analysis']);
  }
}
