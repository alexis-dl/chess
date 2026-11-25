import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { TranslationKey } from '../../i18n/translations';
import {
  GAME_PLATFORMS,
  GAME_SPEEDS,
  GamePlatform,
  GameSpeed,
} from '../../puzzles/generator/game-sources';
import { PERIODS, PlayerStats, StatsQuery, StatsService } from '../stats.service';

/**
 * Form choosing whose games and which period to show, with the progress of
 * the loading. The query is remembered per page.
 */
@Component({
  selector: 'app-stats-filters',
  templateUrl: './stats-filters.component.html',
  styleUrls: ['./stats-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class StatsFiltersComponent implements OnInit {
  @Input({ required: true }) page!: 'mine' | 'scouting';

  readonly platforms = GAME_PLATFORMS;
  readonly speeds = GAME_SPEEDS;
  readonly periods = PERIODS;
  query!: StatsQuery;

  constructor(private statsService: StatsService) {}

  get stats(): PlayerStats {
    return this.statsService[this.page];
  }

  ngOnInit(): void {
    this.query = { ...this.statsService.loadQuery(this.page) };
    // first visit with a known account: show it right away
    if (this.stats.state.status === 'idle' && this.query.username) {
      this.show();
    }
  }

  show(): void {
    const username = this.query.username.trim();
    if (!username) {
      return;
    }
    this.query = { ...this.query, username };
    this.statsService.saveQuery(this.page, this.query);
    void this.stats.load(this.query);
  }

  stop(): void {
    this.stats.stop();
  }

  setPlatform(platform: GamePlatform): void {
    this.query = { ...this.query, platform };
  }

  speedKey(speed: GameSpeed): TranslationKey {
    return `puzzles.speed.${speed}`;
  }

  platformName(platform: GamePlatform): string {
    return platform === 'lichess' ? 'Lichess' : 'Chess.com';
  }
}
