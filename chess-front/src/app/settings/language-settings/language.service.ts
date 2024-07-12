import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Language } from './language';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  languages: Language[] = [
    { name: 'French', code: 'FR', flag: 'FR' },
    { name: 'English', code: 'EN', flag: 'GB' },
    { name: 'Spanish', code: 'ES', flag: 'ES' },
    { name: 'German', code: 'DE', flag: 'DE' },
    { name: 'Brazilian', code: 'BR', flag: 'BR' },
    { name: 'Chinese', code: 'CN', flag: 'CN' },
    { name: 'Indian', code: 'IN', flag: 'IN' },
    { name: 'Japanese', code: 'JP', flag: 'JP' },
  ];

  constructor(private messageService: MessageService) {}

  getAvailableLanguages(): Language[] {
    return this.languages;
  }

  getCurrentLanguage() {
    const savedLanguageCode = localStorage.getItem('selectedLanguage'); // language saved in local storage
    const browserLanguageCode = navigator.language.split('-')[0].toUpperCase(); // language of the browser with region removed
    debugger;
    return this.languages.find(
      lang =>
        lang.code === savedLanguageCode ||
        lang.code === browserLanguageCode ||
        lang.code === 'FR'
    );
  }

  setCurrentLanguage(selectedLanguage?: Language) {
    if (selectedLanguage) {
      localStorage.setItem('selectedLanguage', selectedLanguage?.code);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Language set to ' + selectedLanguage.name,
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
