import { Component, OnInit } from '@angular/core';
import { Language } from './language';
import { LanguageService } from './language.service';

@Component({
  selector: 'app-language-settings',
  templateUrl: './language-settings.component.html',
  styleUrls: ['./language-settings.component.scss'],
})
export class LanguageSettingsComponent implements OnInit {
  languages: Language[] = [];
  selectedLanguage?: Language;

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.languages = this.languageService.getAvailableLanguages();
    this.selectedLanguage = this.languageService.getCurrentLanguage();
  }

  onSubmitLanguage() {
    this.languageService.setCurrentLanguage(this.selectedLanguage);
  }
}
