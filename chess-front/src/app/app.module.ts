import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChessBoardComponent } from './chess-game/chess-board/chess-board.component';
import { ChessPieceComponent } from './chess-game/chess-piece/chess-piece.component';
import { PlayerPanelComponent } from './player-panel/player-panel.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { ToolbarSidenavComponent } from './toolbar-sidenav/toolbar-sidenav.component';
import { SettingsComponent } from './settings/settings.component';
import { SlideMenuModule } from 'primeng/slidemenu';
import { SettingsSlidemenuComponent } from './toolbar-sidenav/settings-slidemenu/settings-slidemenu.component';
import { QuitComponent } from './toolbar-sidenav/quit/quit.component';
import { OpeningsComponent } from './openings/openings.component';
import { BotComponent } from './bot/bot.component';
import { HomeComponent } from './home/home.component';
import { ExplorerComponent } from './play/explorer/explorer.component';
import { PlayVsBotComponent } from './play/play-vs-bot/play-vs-bot.component';

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
    BotComponent,
    HomeComponent,
    ExplorerComponent,
    PlayVsBotComponent,
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
