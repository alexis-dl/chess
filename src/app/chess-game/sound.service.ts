import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  sound_pawn = new Audio('assets/audio/sound-pawn.mp3');
  sound_rook = new Audio('assets/audio/sound-rook.mp3');
  sound_knight = new Audio('assets/audio/sound-knight.mp3');
  sound_bishop = new Audio('assets/audio/sound-bishop.mp3');
  sound_queen = new Audio('assets/audio/sound-queen.mp3');
  sound_king = new Audio('assets/audio/sound-king.mp3');
  sound_game_win = new Audio('assets/audio/sound-game-win.mp3');

  stopAllSounds() {
    this.sound_pawn.pause();
    this.sound_pawn.currentTime = 0;

    this.sound_rook.pause();
    this.sound_rook.currentTime = 0;

    this.sound_knight.pause();
    this.sound_knight.currentTime = 0;

    this.sound_bishop.pause();
    this.sound_bishop.currentTime = 0;

    this.sound_queen.pause();
    this.sound_queen.currentTime = 0;

    this.sound_king.pause();
    this.sound_king.currentTime = 0;

    this.sound_game_win.pause();
    this.sound_game_win.currentTime = 0;
  }

  playPawnSound() {
    this.sound_pawn.play();
  }

  playRookSound() {
    this.sound_rook.play();
  }

  playKnightSound() {
    this.sound_knight.play();
  }

  playBishopSound() {
    this.sound_bishop.play();
  }

  playQueenSound() {
    this.sound_queen.play();
  }

  playKingSound() {
    this.sound_king.play();
  }

  playGameWinSound() {
    this.sound_game_win.play();
  }
}
