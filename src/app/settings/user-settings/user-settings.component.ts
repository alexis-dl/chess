import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { I18nService } from 'src/app/i18n/i18n.service';
import { TranslationKey } from 'src/app/i18n/translations';
import { resizeImage } from './resize-image';
import { USER_NAME_MAX_LENGTH, UserService } from './user.service';

/**
 * Name and icon are edited here, and applied together by Save. An imported
 * image replaces the current icon.
 */
@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UserSettingsComponent {
  readonly maxLength = USER_NAME_MAX_LENGTH;
  name = this.userService.name;
  avatar = this.userService.avatar;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private i18n: I18nService
  ) {}

  get canSave(): boolean {
    const trimmed = this.name.trim();
    return (
      trimmed.length > 0 &&
      (trimmed !== this.userService.name ||
        this.avatar !== this.userService.avatar)
    );
  }

  save(): void {
    if (!this.canSave || !this.userService.setName(this.name)) {
      return;
    }
    this.userService.setAvatar(this.avatar);
    this.name = this.userService.name;
    this.notify('settings.user.saved');
  }

  async onImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // allow choosing the same file again
    if (!file) {
      return;
    }
    try {
      this.avatar = await resizeImage(file);
    } catch {
      this.notify('settings.user.invalidImage');
    }
  }

  private notify(key: TranslationKey): void {
    this.snackBar.open(this.i18n.t(key), undefined, { duration: 3000 });
  }
}
