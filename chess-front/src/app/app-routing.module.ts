import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlayerPanelComponent } from './chess-game/player-panel/player-panel.component';
import { SettingsComponent } from './settings/settings.component';
import { ChessGameComponent } from './chess-game/chess-game.component';

const routes: Routes = [
  { path: 'player', component: PlayerPanelComponent },
  { path: 'play', component: ChessGameComponent },
  { path: 'openings', component: Component },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '/play' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
