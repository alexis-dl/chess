import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslationKey } from 'src/app/i18n/translations';

interface MenuEntry {
  path: string;
  label: TranslationKey;
  /** Material icon name. */
  icon: string;
}

@Component({
    selector: 'app-settings-slidemenu',
    templateUrl: './settings-slidemenu.component.html',
    styleUrls: ['./settings-slidemenu.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SettingsSlidemenuComponent {
  readonly items: MenuEntry[] = [
    { path: '/home', label: 'menu.home', icon: 'home' },
    { path: '/settings', label: 'nav.settings', icon: 'settings' },
    { path: '/quit', label: 'menu.quit', icon: 'power_settings_new' },
  ];
}
