import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChessBoardComponent } from './chess-board/chess-board.component';
import { PlayerPanelComponent } from './player-panel/player-panel.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  { path: 'player', component: PlayerPanelComponent },
  { path: 'play', component: ChessBoardComponent },
  { path: 'openings', component: Component },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '/play' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
