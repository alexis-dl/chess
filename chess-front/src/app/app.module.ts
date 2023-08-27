import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChessBoardComponent } from './chess-board/chess-board.component';
import { ChessSquareComponent } from './chess-square/chess-square.component';
import { ChessPieceComponent } from './chess-piece/chess-piece.component';
import { PlayerPanelComponent } from './player-panel/player-panel.component';

@NgModule({
  declarations: [AppComponent, ChessBoardComponent, ChessSquareComponent, ChessPieceComponent, PlayerPanelComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
