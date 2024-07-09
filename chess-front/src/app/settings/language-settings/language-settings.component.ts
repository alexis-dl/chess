import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-language-settings',
  templateUrl: './language-settings.component.html',
  styleUrls: ['./language-settings.component.scss'],
})
export class LanguageSettingsComponent implements OnInit {
  languages: { name: string; code: string }[] = [
    { name: 'Brazilian', code: 'BR' },
    { name: 'Chinese', code: 'CN' },
    { name: 'French', code: 'FR' },
    { name: 'German', code: 'DE' },
    { name: 'Indian', code: 'IN' },
    { name: 'Japanese', code: 'JP' },
    { name: 'Spanish', code: 'ES' },
    { name: 'English', code: 'US' },
  ];

  selectedLanguage: { name: string; code: string } | undefined;

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    // Load selected language from local storage if available
    const savedLanguageName = localStorage.getItem('selectedLanguage');
    if (savedLanguageName) {
      this.selectedLanguage = this.languages.find(
        lang => lang.name === savedLanguageName
      );
    }
  }

  onSubmitLanguage() {
    if (this.selectedLanguage) {
      localStorage.setItem('selectedLanguage', this.selectedLanguage?.name);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Language set to ' + this.selectedLanguage.name,
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No language selected',
      });
    }
  }
}
