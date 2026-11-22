import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** Stockfish build served from src/assets/stockfish (see its README). */
const ENGINE_URL = 'assets/stockfish/stockfish-18-lite-single.js';
/** Deep enough to be meaningful, short enough to answer in a few seconds. */
const SEARCH_DEPTH = 18;

/** Engine opinion on a position, always from White's point of view. */
export interface Evaluation {
  depth: number;
  /** Advantage in pawns (+1.5: White is better by a pawn and a half). */
  pawns: number | null;
  /** Mate in so many moves: positive if White mates, negative if Black. */
  mate: number | null;
  /** First move of the best line, in UCI notation. */
  bestMove: string | null;
}

/**
 * Reads a Stockfish 'info' line. Its score is from the side to move: it is
 * turned to White's point of view.
 * @returns null for lines without a score and a line of moves.
 */
export function parseInfo(
  line: string,
  whiteToMove: boolean
): Evaluation | null {
  if (!line.startsWith('info ') || /\b(lower|upper)bound\b/.test(line)) {
    return null; // lowerbound / upperbound scores are not final
  }
  const depth = /\bdepth (\d+)/.exec(line);
  const score = /\bscore (cp|mate) (-?\d+)/.exec(line);
  const pv = /\bpv ([a-h][1-8][a-h][1-8][qrbn]?)/.exec(line);
  if (!depth || !score || !pv) {
    return null;
  }
  const sign = whiteToMove ? 1 : -1;
  const value = sign * Number(score[2]);
  return {
    depth: Number(depth[1]),
    pawns: score[1] === 'cp' ? value / 100 : null,
    mate: score[1] === 'mate' ? value : null,
    bestMove: pv[1],
  };
}

/**
 * Stockfish running in a Web Worker, started on first use. Analyses one
 * position at a time: a new position stops the previous search.
 */
@Injectable({
  providedIn: 'root',
})
export class EngineService implements OnDestroy {
  private readonly evaluationSubject = new BehaviorSubject<Evaluation | null>(
    null
  );
  readonly evaluation$ = this.evaluationSubject.asObservable();
  /** False when the browser cannot run the engine. */
  available = typeof Worker !== 'undefined';

  private worker?: Worker;
  /** A search is running: the engine answers 'bestmove' when it ends. */
  private searching = false;
  private stopSent = false;
  /** Position to analyse once the running search has ended. */
  private pendingFen: string | null = null;
  /** The running search is for the position wanted now (else: ignored). */
  private searchWanted = false;
  private whiteToMove = true;

  constructor(private zone: NgZone) {}

  /**
   * Analyse a position, given as a FEN. A running search is stopped first:
   * the single-threaded engine crashes if it is given a new position before
   * the previous search has ended, so the new one waits for its 'bestmove'.
   */
  analyse(fen: string): void {
    if (!this.getWorker()) {
      return;
    }
    this.evaluationSubject.next(null);
    this.pendingFen = fen;
    if (this.searching) {
      this.stopSearch();
    } else {
      this.startPending();
    }
  }

  stop(): void {
    this.pendingFen = null;
    if (this.searching) {
      this.stopSearch();
    }
    this.evaluationSubject.next(null);
  }

  ngOnDestroy(): void {
    this.worker?.terminate();
  }

  private getWorker(): Worker | undefined {
    if (!this.worker && this.available) {
      try {
        // relative to <base href>: works under /chess/ and in the Android app
        const url = new URL(ENGINE_URL, document.baseURI);
        this.worker = new Worker(url);
        this.worker.onmessage = event => this.onLine(String(event.data));
        this.worker.onerror = () => {
          this.available = false;
          this.zone.run(() => this.evaluationSubject.next(null));
        };
        this.worker.postMessage('uci');
      } catch {
        this.available = false;
      }
    }
    return this.worker;
  }

  private startPending(): void {
    const fen = this.pendingFen;
    if (!this.worker || fen === null) {
      return;
    }
    this.pendingFen = null;
    this.whiteToMove = fen.split(' ')[1] !== 'b';
    this.worker.postMessage(`position fen ${fen}`);
    this.worker.postMessage(`go depth ${SEARCH_DEPTH}`);
    this.searching = true;
    this.searchWanted = true;
  }

  /** Ask the running search to end; its output is ignored from now on. */
  private stopSearch(): void {
    this.searchWanted = false;
    if (!this.stopSent) {
      this.stopSent = true;
      this.worker?.postMessage('stop');
    }
  }

  private onLine(line: string): void {
    if (line.startsWith('bestmove')) {
      this.searching = false;
      this.stopSent = false;
      this.startPending(); // the position asked for during the search
      return;
    }
    if (!this.searchWanted) {
      return; // output of a stopped search
    }
    const evaluation = parseInfo(line, this.whiteToMove);
    if (evaluation) {
      this.zone.run(() => this.evaluationSubject.next(evaluation));
    }
  }
}
