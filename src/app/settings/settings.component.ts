import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { Subscription } from 'rxjs';
import { I18nService } from '../i18n/i18n.service';
import { NativeAppService } from '../native/native-app.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  items: MenuItem[] = [];
  private subscription?: Subscription;

  constructor(
    private i18n: I18nService,
    private nativeApp: NativeAppService
  ) {}

  /** PrimeNG menus take plain labels: rebuild them when the language changes. */
  ngOnInit(): void {
    this.subscription = this.i18n.language$.subscribe(() => {
      this.items = [
        {
          label: this.i18n.t('settings.tabs.user'),
          icon: PrimeIcons.USER,
          routerLink: 'user',
        },
        {
          label: this.i18n.t('settings.tabs.board'),
          icon: PrimeIcons.TH_LARGE,
          routerLink: 'board',
        },
        {
          label: this.i18n.t('settings.tabs.themes'),
          icon: PrimeIcons.PALETTE,
          routerLink: 'themes',
        },
        {
          label: this.i18n.t('settings.tabs.languages'),
          icon: PrimeIcons.LANGUAGE,
          routerLink: 'languages',
        },
        {
          label: this.i18n.t('settings.tabs.sounds'),
          icon: PrimeIcons.MEGAPHONE,
          routerLink: 'sounds',
        },
        // download of the app: pointless once in the app
        {
          label: this.i18n.t('settings.tabs.android'),
          icon: PrimeIcons.ANDROID,
          routerLink: 'android',
          visible: !this.nativeApp.isNative,
        },
      ];
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
