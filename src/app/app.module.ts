import { DragDropModule } from '@angular/cdk/drag-drop';
import { inject, NgModule, provideAppInitializer } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LocalizePipe, TranslatePipe } from './i18n/translate.pipe';
import { ChessBoardComponent } from './chess-game/chess-board/chess-board.component';
import { ChessPieceComponent } from './chess-game/chess-piece/chess-piece.component';
import { ClickOutsideDirective } from './chess-game/promotion/click-outside.directive';
import { PromotionComponent } from './chess-game/promotion/promotion.component';
import { HomeComponent } from './home/home.component';
import { LearnComponent } from './learn/learn.component';
import { LessonComponent } from './learn/lesson/lesson.component';
import { MoveListComponent } from './chess-game/move-list/move-list.component';
import { OpeningLabelComponent } from './openings/opening-label/opening-label.component';
import { ExplorerComponent } from './play/explorer/explorer.component';
import { PlayVsBotComponent } from './play/play-vs-bot/play-vs-bot.component';
import { PlayerPanelComponent } from './player/player-panel.component';
import { PuzzlesComponent } from './puzzles/puzzles.component';
import { AndroidSettingsComponent } from './settings/android-settings/android-settings.component';
import { LanguageSettingsComponent } from './settings/language-settings/language-settings.component';
import { SettingsComponent } from './settings/settings.component';
import { ThemeSettingsComponent } from './settings/theme-settings/theme-settings.component';
import { BoardThemeService } from './settings/theme-settings/board-theme.service';
import { ThemeService } from './settings/theme-settings/theme.service';
import { UserSettingsComponent } from './settings/user-settings/user-settings.component';
import { QuitComponent } from './toolbar-sidenav/quit/quit.component';
import { SettingsSlidemenuComponent } from './toolbar-sidenav/settings-slidemenu/settings-slidemenu.component';
import { ToolbarSidenavComponent } from './toolbar-sidenav/toolbar-sidenav.component';

import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [
    AppComponent,
    TranslatePipe,
    LocalizePipe,
    ChessBoardComponent,
    ChessPieceComponent,
    PlayerPanelComponent,
    ToolbarSidenavComponent,
    SettingsComponent,
    SettingsSlidemenuComponent,
    QuitComponent,
    LearnComponent,
    LessonComponent,
    HomeComponent,
    ExplorerComponent,
    MoveListComponent,
    OpeningLabelComponent,
    PlayVsBotComponent,
    PromotionComponent,
    PuzzlesComponent,
    ClickOutsideDirective,
    UserSettingsComponent,
    LanguageSettingsComponent,
    ThemeSettingsComponent,
    AndroidSettingsComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DragDropModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    FormsModule,
  ],
  providers: [
    // apply the saved themes (interface, board) before the first render
    provideAppInitializer(() => {
      inject(ThemeService);
      inject(BoardThemeService);
    }),
  ],
})
export class AppModule {}
