import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlayerPanelComponent } from './chess-game/player-panel/player-panel.component';
import { SettingsComponent } from './settings/settings.component';
import { ChessGameComponent } from './chess-game/chess-game.component';
import { QuitComponent } from './toolbar-sidenav/quit/quit.component';
import { OpeningsComponent } from './openings/openings.component';

const routes: Routes = [
  { path: 'player', component: PlayerPanelComponent },
  { path: 'play', component: ChessGameComponent },
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
