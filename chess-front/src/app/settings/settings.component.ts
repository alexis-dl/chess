import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem, PrimeIcons } from 'primeng/api';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  constructor(private router: Router) {}

  items: MenuItem[] = [
    {
      label: 'User',
      icon: PrimeIcons.USER,
      routerLink: 'user',
    },
    { label: 'Board & Pieces', icon: PrimeIcons.TH_LARGE, routerLink: 'board' },
    { label: 'Themes', icon: PrimeIcons.PALETTE, routerLink: 'themes' },
    { label: 'Languages', icon: PrimeIcons.LANGUAGE, routerLink: 'languages' },
    { label: 'Sounds', icon: PrimeIcons.MEGAPHONE, routerLink: 'sounds' },
  ];
  activeItem: MenuItem = this.items[0];

  // languages: any[] = [
  //   { label: 'English', value: 'en' },
  //   { label: 'Spanish', value: 'es' },
  //   { label: 'French', value: 'fr' },
  //   { label: 'German', value: 'de' },
  // ];

  selectedLanguage: string = 'language';
}
