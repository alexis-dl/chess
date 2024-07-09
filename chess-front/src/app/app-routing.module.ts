import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OpeningsComponent } from './openings/openings.component';
import { ExplorerComponent } from './play/explorer/explorer.component';
import { PlayVsBotComponent } from './play/play-vs-bot/play-vs-bot.component';
import { BoardSettingsComponent } from './settings/board-settings/board-settings.component';
import { LanguageSettingsComponent } from './settings/language-settings/language-settings.component';
import { SettingsComponent } from './settings/settings.component';
import { SoundSettingsComponent } from './settings/sound-settings/sound-settings.component';
import { ThemeSettingsComponent } from './settings/theme-settings/theme-settings.component';
import { UserSettingsComponent } from './settings/user-settings/user-settings.component';
import { QuitComponent } from './toolbar-sidenav/quit/quit.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'play', component: PlayVsBotComponent },
  { path: 'explorer', component: ExplorerComponent },
  { path: 'openings', component: OpeningsComponent },
  {
    path: 'settings',
    component: SettingsComponent,
    children: [
      { path: 'user', component: UserSettingsComponent },
      { path: 'board', component: BoardSettingsComponent },
      { path: 'themes', component: ThemeSettingsComponent },
      { path: 'languages', component: LanguageSettingsComponent },
      { path: 'sounds', component: SoundSettingsComponent },
    ],
  },
  { path: 'quit', component: QuitComponent },
  { path: '**', redirectTo: '/play' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
