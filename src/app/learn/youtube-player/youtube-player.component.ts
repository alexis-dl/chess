import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * YouTube video, shown as its thumbnail until clicked: the player (and
 * YouTube's scripts) are only loaded for the videos actually watched.
 * Uses youtube-nocookie.com, which sets no cookie before playback.
 */
@Component({
  selector: 'app-youtube-player',
  templateUrl: './youtube-player.component.html',
  styleUrls: ['./youtube-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class YoutubePlayerComponent {
  @Input({ required: true }) videoId!: string;
  @Input() title = '';

  /** Player URL once the thumbnail was clicked, null before. */
  playerUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  get thumbnailUrl(): string {
    return `https://i.ytimg.com/vi/${this.videoId}/hqdefault.jpg`;
  }

  play(): void {
    // the id comes from our own data (videos.ts), never from the user
    this.playerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
        this.videoId
      )}?autoplay=1&rel=0`
    );
  }
}
