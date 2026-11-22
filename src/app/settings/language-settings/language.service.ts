import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { I18nService } from 'src/app/i18n/i18n.service';
import { AppLanguage } from 'src/app/i18n/localized';
import { Language } from './language';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  /** Languages the interface is translated into, named in their own language. */
  languages: Language[] = [
    { name: 'Français', code: 'FR', flag: 'FR' },
    { name: 'English', code: 'EN', flag: 'GB' },
  ];

  constructor(private snackBar: MatSnackBar, private i18n: I18nService) {}

  getAvailableLanguages(): Language[] {
    return this.languages;
  }

  getCurrentLanguage(): Language | undefined {
    return this.languages.find(
      lang => lang.code.toLowerCase() === this.i18n.language
    );
  }

  /** Switch the interface language right away and confirm with a snack bar. */
  setCurrentLanguage(selectedLanguage?: Language) {
    if (selectedLanguage) {
      this.i18n.setLanguage(selectedLanguage.code.toLowerCase() as AppLanguage);
      this.notify(
        this.i18n.t('settings.language.saved', {
          language: selectedLanguage.name,
        })
      );
    } else {
      this.notify(this.i18n.t('settings.language.none'));
    }
  }

  private notify(message: string): void {
    this.snackBar.open(message, undefined, { duration: 3000 });
  }
}
