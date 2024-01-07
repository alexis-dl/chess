import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings/settings.component';
import { QuitComponent } from './toolbar-sidenav/quit/quit.component';
import { OpeningsComponent } from './openings/openings.component';
import { HomeComponent } from './home/home.component';
import { ExplorerComponent } from './play/explorer/explorer.component';
import { PlayVsBotComponent } from './play/play-vs-bot/play-vs-bot.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'play', component: PlayVsBotComponent },
  { path: 'explorer', component: ExplorerComponent },
  { path: 'openings', component: OpeningsComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'quit', component: QuitComponent },
  { path: '**', redirectTo: '/play' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
