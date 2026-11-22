import { Component } from '@angular/core';
import { TranslationKey } from '../i18n/translations';

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
})
export class SettingsComponent {
  readonly tabs: SettingsTab[] = [
    { path: 'user', label: 'settings.tabs.user', icon: 'person' },
    { path: 'board', label: 'settings.tabs.board', icon: 'grid_view' },
    { path: 'themes', label: 'settings.tabs.themes', icon: 'palette' },
    { path: 'languages', label: 'settings.tabs.languages', icon: 'translate' },
    { path: 'sounds', label: 'settings.tabs.sounds', icon: 'volume_up' },
  ];
}
