import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SlideMenuModule } from 'primeng/slidemenu';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChessBoardComponent } from './chess-game/chess-board/chess-board.component';
import { ChessPieceComponent } from './chess-game/chess-piece/chess-piece.component';
import { ClickOutsideDirective } from './chess-game/promotion/click-outside.directive';
import { PromotionComponent } from './chess-game/promotion/promotion.component';
import { HomeComponent } from './home/home.component';
import { OpeningsComponent } from './openings/openings.component';
import { ExplorerComponent } from './play/explorer/explorer.component';
import { PlayVsBotComponent } from './play/play-vs-bot/play-vs-bot.component';
import { PlayerPanelComponent } from './player/player-panel.component';
import { SettingsComponent } from './settings/settings.component';
import { QuitComponent } from './toolbar-sidenav/quit/quit.component';
import { SettingsSlidemenuComponent } from './toolbar-sidenav/settings-slidemenu/settings-slidemenu.component';
import { ToolbarSidenavComponent } from './toolbar-sidenav/toolbar-sidenav.component';

@NgModule({
  declarations: [
    AppComponent,
    ChessBoardComponent,
    ChessPieceComponent,
    PlayerPanelComponent,
    ToolbarSidenavComponent,
    SettingsComponent,
    SettingsSlidemenuComponent,
    QuitComponent,
    OpeningsComponent,
    HomeComponent,
    ExplorerComponent,
    PlayVsBotComponent,
    PromotionComponent,
    ClickOutsideDirective,
  ],
  providers: [],
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
    SlideMenuModule,
  ],
})
export class AppModule {}
