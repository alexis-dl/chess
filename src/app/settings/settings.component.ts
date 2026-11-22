import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslationKey } from '../i18n/translations';
import { NativeAppService } from '../native/native-app.service';

interface SettingsTab {
  path: string;
  label: TranslationKey;
  /** Material icon name. */
  icon: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class SettingsComponent {
  readonly tabs: SettingsTab[] = [
    { path: 'user', label: 'settings.tabs.user', icon: 'person' },
    { path: 'themes', label: 'settings.tabs.themes', icon: 'palette' },
    { path: 'languages', label: 'settings.tabs.languages', icon: 'translate' },
    // download of the app: pointless once in the app
    ...(this.nativeApp.isNative
      ? []
      : [
          {
            path: 'android',
            label: 'settings.tabs.android' as const,
            icon: 'android',
          },
        ]),
  ];

  constructor(private nativeApp: NativeAppService) {}
}
