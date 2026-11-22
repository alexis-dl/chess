import { Pipe, PipeTransform } from '@angular/core';
import { I18nService, TranslationParams } from './i18n.service';
import { Localized } from './localized';
import { TranslationKey } from './translations';

/**
 * {{ 'nav.play' | t }} or {{ 'puzzles.mateIn' | t: { moves: 2 } }}.
 * Impure so that the texts change as soon as the language does.
 */
@Pipe({
    name: 't', pure: false,
    standalone: false
})
export class TranslatePipe implements PipeTransform {
  constructor(private i18n: I18nService) {}

  transform(key: TranslationKey, params?: TranslationParams): string {
    return this.i18n.t(key, params);
  }
}

/** {{ lesson.title | localize }} for content given in every language. */
@Pipe({
    name: 'localize', pure: false,
    standalone: false
})
export class LocalizePipe implements PipeTransform {
  constructor(private i18n: I18nService) {}

  transform<T>(value: Localized<T>): T {
    return this.i18n.localize(value);
  }
}
