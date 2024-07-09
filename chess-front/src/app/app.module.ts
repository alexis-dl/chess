import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
import { BoardSettingsComponent } from './settings/board-settings/board-settings.component';
import { LanguageSettingsComponent } from './settings/language-settings/language-settings.component';
import { SettingsComponent } from './settings/settings.component';
import { SoundSettingsComponent } from './settings/sound-settings/sound-settings.component';
import { ThemeSettingsComponent } from './settings/theme-settings/theme-settings.component';
import { UserSettingsComponent } from './settings/user-settings/user-settings.component';
import { QuitComponent } from './toolbar-sidenav/quit/quit.component';
import { SettingsSlidemenuComponent } from './toolbar-sidenav/settings-slidemenu/settings-slidemenu.component';
import { ToolbarSidenavComponent } from './toolbar-sidenav/toolbar-sidenav.component';

// PrimeNG modules
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { PanelModule } from 'primeng/panel';
import { RippleModule } from 'primeng/ripple';
import { SlideMenuModule } from 'primeng/slidemenu';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToastModule } from 'primeng/toast';
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
    UserSettingsComponent,
    BoardSettingsComponent,
    SoundSettingsComponent,
    LanguageSettingsComponent,
    ThemeSettingsComponent,
  ],
  providers: [MessageService],
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
    TabMenuModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    PanelModule,
    FormsModule,
    MessagesModule,
    MessageModule,
    ToastModule,
    RippleModule,
  ],
})
export class AppModule {}
