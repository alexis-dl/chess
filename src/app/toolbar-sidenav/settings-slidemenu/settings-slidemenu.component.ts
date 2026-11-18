import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { I18nService } from 'src/app/i18n/i18n.service';

@Component({
  selector: 'app-settings-slidemenu',
  templateUrl: './settings-slidemenu.component.html',
  styleUrls: ['./settings-slidemenu.component.scss'],
})
export class SettingsSlidemenuComponent implements OnInit, OnDestroy {
  items: MenuItem[] = [];
  private subscription?: Subscription;

  constructor(private i18n: I18nService) {}

  /** PrimeNG menus take plain labels: rebuild them when the language changes. */
  ngOnInit() {
    this.subscription = this.i18n.language$.subscribe(() => {
      this.items = [
        {
          label: this.i18n.t('menu.home'),
          icon: 'pi pi-fw pi-home',
          routerLink: '/home',
        },
        {
          label: this.i18n.t('nav.settings'),
          icon: 'pi pi-fw pi-cog',
          routerLink: '/settings',
        },
        {
          label: this.i18n.t('menu.quit'),
          icon: 'pi pi-fw pi-power-off',
          routerLink: '/quit',
        },
      ];
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
