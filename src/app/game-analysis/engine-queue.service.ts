import { Injectable, OnDestroy } from '@angular/core';
import { BatchEngine, EngineLine } from '../puzzles/generator/batch-engine';

/**
 * One Stockfish worker for the background analyses (statistics, puzzle
 * generator), started on first use. Searches run one after the other: the
 * single-threaded engine handles one position at a time.
 */
@Injectable({
  providedIn: 'root',
})
export class EngineQueueService implements OnDestroy {
  private engine: BatchEngine | null = null;
  /** End of the last queued search. */
  private queue: Promise<unknown> = Promise.resolve();

  /** Best lines of a position, best first (see BatchEngine.evaluate). */
  evaluate(fen: string, depth: number, multiPv = 1): Promise<EngineLine[]> {
    const engine = this.getEngine();
    const result = this.queue.then(() => engine.evaluate(fen, depth, multiPv));
    this.queue = result.catch(() => undefined);
    return result;
  }

  /**
   * Stop everything: the running and queued searches fail. The next search
   * starts a new worker.
   */
  stop(): void {
    this.engine?.terminate();
    this.engine = null;
    this.queue = Promise.resolve();
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private getEngine(): BatchEngine {
    if (!this.engine) {
      this.engine = new BatchEngine();
    }
    return this.engine;
  }
}
