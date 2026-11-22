import { Injectable, NgZone } from '@angular/core';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

/**
 * Behaviour specific to the Android app (Capacitor). Does nothing on the
 * website, which is built from the same code.
 */
@Injectable({
  providedIn: 'root',
})
export class NativeAppService {
  readonly isNative = Capacitor.isNativePlatform();

  constructor(private zone: NgZone) {}

  init(): void {
    if (!this.isNative) {
      return;
    }
    // Android back button: go back in the app's history, quit at its start.
    App.addListener('backButton', ({ canGoBack }) => {
      this.zone.run(() => {
        if (canGoBack) {
          history.back();
        } else {
          App.exitApp();
        }
      });
    });
  }
}
