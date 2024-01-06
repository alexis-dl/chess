import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-settings-slidemenu',
  templateUrl: './settings-slidemenu.component.html',
  styleUrls: ['./settings-slidemenu.component.scss'],
})
export class SettingsSlidemenuComponent {
  items: MenuItem[] = [];

  ngOnInit() {
    this.items = [
      { label: 'Home', icon: 'pi pi-fw pi-home', routerLink: '/home' },
      {
        label: 'Settings',
        icon: 'pi pi-fw pi-cog',
        routerLink: '/settings',
      },
      {
        label: 'Quit',
        icon: 'pi pi-fw pi-power-off',
        routerLink: '/quit',
      },
    ];
  }
}
