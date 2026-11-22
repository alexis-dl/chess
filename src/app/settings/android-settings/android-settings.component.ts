import { Component } from '@angular/core';
import { NativeAppService } from 'src/app/native/native-app.service';

/**
 * APK of the latest master commit, published by the "Android APK" workflow
 * (.github/workflows/android.yml) on the "android-latest" release.
 */
export const APK_DOWNLOAD_URL =
  'https://github.com/alexis-dl/chess/releases/download/android-latest/chess.apk';

/** Download of the Android app, from the website. */
@Component({
  selector: 'app-android-settings',
  templateUrl: './android-settings.component.html',
  styleUrls: ['./android-settings.component.scss'],
})
export class AndroidSettingsComponent {
  readonly downloadUrl = APK_DOWNLOAD_URL;

  constructor(readonly nativeApp: NativeAppService) {}
}
