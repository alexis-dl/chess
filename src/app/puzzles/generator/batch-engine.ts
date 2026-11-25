/** Stockfish build served from src/assets/stockfish (see its README). */
const ENGINE_URL = 'assets/stockfish/stockfish-18-lite-single.js';

/** One line of the engine, scored from the side to move's point of view. */
export interface EngineLine {
  /** Advantage in centipawns, null when the score is a mate. */
  cp: number | null;
  /** Mate in so many moves: positive if the side to move mates. 0: it is mated. */
  mate: number | null;
  /** Best line, in UCI notation (empty when the game is over). */
  pv: string[];
}

interface InfoLine extends EngineLine {
  multipv: number;
}

/**
 * Reads a Stockfish 'info' line with a score (and a line, when there is a
 * move to play). Bound scores are not final: null.
 */
export function parseMultiPvInfo(line: string): InfoLine | null {
  if (!line.startsWith('info ') || /\b(lower|upper)bound\b/.test(line)) {
    return null;
  }
  const score = /\bscore (cp|mate) (-?\d+)/.exec(line);
  if (!score) {
    return null;
  }
  const multipv = /\bmultipv (\d+)/.exec(line);
  const pv = /\bpv ((?:[a-h][1-8][a-h][1-8][qrbn]?\s*)+)/.exec(line);
  const value = Number(score[2]);
  return {
    multipv: multipv ? Number(multipv[1]) : 1,
    cp: score[1] === 'cp' ? value : null,
    mate: score[1] === 'mate' ? value : null,
    pv: pv ? pv[1].trim().split(/\s+/) : [],
  };
}

/**
 * Stockfish in its own Web Worker, for analysing many positions one after
 * the other (the Analysis page has its own engine, see EngineService).
 */
export class BatchEngine {
  private readonly worker: Worker;
  private pending: {
    resolve: (lines: EngineLine[]) => void;
    reject: (error: Error) => void;
  } | null = null;
  private lines = new Map<number, EngineLine>();
  private failed: Error | null = null;

  constructor() {
    // relative to <base href>: works under a sub-path and in the Android app
    this.worker = new Worker(new URL(ENGINE_URL, document.baseURI));
    this.worker.onmessage = event => this.onLine(String(event.data));
    this.worker.onerror = () => this.fail(new Error('engine-crashed'));
    this.worker.postMessage('uci');
  }

  /** Forget what was learnt on the previous game (hash table). */
  newGame(): void {
    this.worker.postMessage('ucinewgame');
  }

  /**
   * Best lines of a position, best first. One search at a time: the
   * single-threaded engine crashes if given a position while searching.
   */
  evaluate(fen: string, depth: number, multiPv = 1): Promise<EngineLine[]> {
    if (this.failed) {
      return Promise.reject(this.failed);
    }
    if (this.pending) {
      return Promise.reject(new Error('engine-busy'));
    }
    return new Promise((resolve, reject) => {
      this.pending = { resolve, reject };
      this.lines.clear();
      this.worker.postMessage(`setoption name MultiPV value ${multiPv}`);
      this.worker.postMessage(`position fen ${fen}`);
      this.worker.postMessage(`go depth ${depth}`);
    });
  }

  terminate(): void {
    this.worker.terminate();
    this.fail(new Error('engine-stopped'));
  }

  private onLine(line: string): void {
    if (line.startsWith('bestmove')) {
      const pending = this.pending;
      this.pending = null;
      pending?.resolve(
        [...this.lines.entries()]
          .sort(([a], [b]) => a - b)
          .map(([, value]) => value)
      );
      return;
    }
    const info = parseMultiPvInfo(line);
    if (info && this.pending) {
      const { multipv, ...value } = info;
      this.lines.set(multipv, value); // deeper lines replace shallower ones
    }
  }

  private fail(error: Error): void {
    this.failed = error;
    const pending = this.pending;
    this.pending = null;
    pending?.reject(error);
  }
}
