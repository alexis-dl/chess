import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { NativeAppService } from './native/native-app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isQuitRoute: boolean = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    nativeApp: NativeAppService
  ) {
    nativeApp.init();
    // Souscrire aux événements de navigation pour mettre à jour isChessQuitRoute
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isQuitRoute =
          this.activatedRoute.snapshot.firstChild?.routeConfig?.path === 'quit';
      });
  }
}
