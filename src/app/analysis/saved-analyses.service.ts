import { Injectable } from '@angular/core';
import { GameTag } from './game-import.service';

/** A game or position under analysis, as kept on this device. */
export interface SavedAnalysis {
  id: string;
  name: string;
  /** ISO date of the last save. */
  savedAt: string;
  /** Start position. */
  fen: string;
  /** Moves from the start position, in UCI notation. */
  moves: string[];
  /** Headers of the imported PGN (players, event...), if any. */
  tags?: GameTag[];
  /** Time left after each move, in seconds, if the PGN had clocks. */
  clocks?: (number | null)[];
}

const LIST_KEY = 'savedAnalyses';
const LAST_KEY = 'lastAnalysis';

/**
 * Analyses saved by the user, plus the last one opened (kept automatically,
 * to resume it). Stored in localStorage.
 */
@Injectable({
  providedIn: 'root',
})
export class SavedAnalysesService {
  private list: SavedAnalysis[] = read<SavedAnalysis[]>(LIST_KEY) ?? [];

  /** Most recent first. */
  get all(): readonly SavedAnalysis[] {
    return this.list;
  }

  get last(): Omit<SavedAnalysis, 'id' | 'name'> | null {
    return read(LAST_KEY);
  }

  /**
   * Save a new analysis, or update the one with this id.
   * @returns false when the storage is unavailable or full.
   */
  save(analysis: SavedAnalysis): boolean {
    this.list = [
      analysis,
      ...this.list.filter(saved => saved.id !== analysis.id),
    ];
    return write(LIST_KEY, this.list);
  }

  delete(id: string): void {
    this.list = this.list.filter(saved => saved.id !== id);
    write(LIST_KEY, this.list);
  }

  rememberLast(
    fen: string,
    moves: string[],
    tags: GameTag[],
    clocks: (number | null)[]
  ): void {
    write(LAST_KEY, {
      fen,
      moves,
      tags,
      clocks,
      savedAt: new Date().toISOString(),
    });
  }
}

function read<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
