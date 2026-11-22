import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LearnComponent } from './learn/learn.component';
import { LessonComponent } from './learn/lesson/lesson.component';
import { ExplorerComponent } from './play/explorer/explorer.component';
import { PlayVsBotComponent } from './play/play-vs-bot/play-vs-bot.component';
import { PuzzlesComponent } from './puzzles/puzzles.component';
import { AndroidSettingsComponent } from './settings/android-settings/android-settings.component';
import { LanguageSettingsComponent } from './settings/language-settings/language-settings.component';
import { SettingsComponent } from './settings/settings.component';
import { ThemeSettingsComponent } from './settings/theme-settings/theme-settings.component';
import { UserSettingsComponent } from './settings/user-settings/user-settings.component';
import { QuitComponent } from './toolbar-sidenav/quit/quit.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'play', component: PlayVsBotComponent },
  { path: 'puzzles', component: PuzzlesComponent },
  { path: 'explorer', component: ExplorerComponent },
  { path: 'learn', redirectTo: 'learn/opening', pathMatch: 'full' },
  {
    path: 'learn/opening',
    component: LearnComponent,
    data: { section: 'opening' },
  },
  {
    path: 'learn/middlegame',
    component: LearnComponent,
    data: { section: 'middlegame' },
  },
  {
    path: 'learn/endgame',
    component: LearnComponent,
    data: { section: 'endgame' },
  },
  {
    path: 'learn/pawn-structures',
    component: LearnComponent,
    data: { section: 'pawn-structures' },
  },
  { path: 'learn/:section/:lesson', component: LessonComponent },
  // former page
  { path: 'openings', redirectTo: 'learn/opening' },
  {
    path: 'settings',
    component: SettingsComponent,
    children: [
      { path: '', redirectTo: 'user', pathMatch: 'full' },
      { path: 'user', component: UserSettingsComponent },
      { path: 'themes', component: ThemeSettingsComponent },
      { path: 'languages', component: LanguageSettingsComponent },
      { path: 'android', component: AndroidSettingsComponent },
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
