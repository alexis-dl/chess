import { ChangeDetectionStrategy, Component } from '@angular/core';
import { I18nService } from 'src/app/i18n/i18n.service';
import { AppLanguage } from 'src/app/i18n/localized';

interface LanguageOption {
  language: AppLanguage;
  /** Named in its own language. */
  name: string;
  /** File name of the flag in assets/flags/4x3. */
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { language: 'fr', name: 'Français', flag: 'fr' },
  { language: 'en', name: 'English', flag: 'gb' },
];

@Component({
  selector: 'app-language-settings',
  templateUrl: './language-settings.component.html',
  styleUrls: ['./language-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class LanguageSettingsComponent {
  readonly languages = LANGUAGES;

  constructor(readonly i18n: I18nService) {}
}
