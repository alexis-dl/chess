import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GamePuzzle } from './game-puzzle.model';
import type { GamePlatform, GameSpeed } from './game-sources';

const PUZZLES_KEY = 'chess.gamePuzzles';
const ANALYSED_KEY = 'chess.gamePuzzles.analysedGames';
const SETTINGS_KEY = 'chess.gamePuzzles.settings';

/** Last values of the generator form. */
export interface GeneratorSettings {
  platform: GamePlatform;
  username: string;
  count: number;
  speeds: GameSpeed[];
}

/**
 * Puzzles generated from the player's games, kept in the browser
 * (localStorage), with the games already analysed so that they are not
 * analysed twice.
 */
@Injectable({
  providedIn: 'root',
})
export class GamePuzzleStoreService {
  private readonly puzzlesSubject = new BehaviorSubject<GamePuzzle[]>(
    read<GamePuzzle[]>(PUZZLES_KEY, [])
  );
  /** Most recent games first. */
  readonly puzzles$ = this.puzzlesSubject.asObservable();
  private analysed = new Set(read<string[]>(ANALYSED_KEY, []));

  get puzzles(): GamePuzzle[] {
    return this.puzzlesSubject.value;
  }

  isAnalysed(gameKey: string): boolean {
    return this.analysed.has(gameKey);
  }

  markAnalysed(gameKey: string): void {
    this.analysed.add(gameKey);
    write(ANALYSED_KEY, [...this.analysed]);
  }

  add(puzzle: GamePuzzle): void {
    if (this.puzzles.some(existing => existing.id === puzzle.id)) {
      return;
    }
    const puzzles = [...this.puzzles, puzzle].sort(
      (a, b) => b.game.date - a.game.date || a.id.localeCompare(b.id)
    );
    this.puzzlesSubject.next(puzzles);
    write(PUZZLES_KEY, puzzles);
  }

  /** Remove every puzzle, and forget the analysed games. */
  clear(): void {
    this.analysed.clear();
    this.puzzlesSubject.next([]);
    write(PUZZLES_KEY, []);
    write(ANALYSED_KEY, []);
  }

  loadSettings(): GeneratorSettings | null {
    return read<GeneratorSettings | null>(SETTINGS_KEY, null);
  }

  saveSettings(settings: GeneratorSettings): void {
    write(SETTINGS_KEY, settings);
  }
}

function read<T>(key: string, fallback: T): T {
  try {
    const text = localStorage.getItem(key);
    return text ? (JSON.parse(text) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable (private mode...): kept for this visit only
  }
}
