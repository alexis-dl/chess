import { TestBed } from '@angular/core/testing';
import {
  GameImportError,
  GameImportService,
  pgnTags,
  sanTokens,
} from './game-import.service';

describe('GameImportService', () => {
  let service: GameImportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameImportService);
  });

  it('reads a PGN with headers, comments, variations and annotations', () => {
    const pgn = `[Event "Casual"]
[White "A"]
[Black "B"]

1. e4 e5 {the open game} 2. Bc4 (2. Nf3 Nc6 (2... d6)) 2... Nc6 3. Qh5!? $1
Nf6?? 4. Qxf7# 1-0`;
    expect(service.import(pgn).moves).toEqual([
      'e2e4',
      'e7e5',
      'f1c4',
      'b8c6',
      'd1h5',
      'g8f6',
      'h5f7',
    ]);
  });

  it('reads castling written with letters or zeros', () => {
    const moves = '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. 0-0 Nf6 5. d3 O-O';
    const { moves: uci } = service.import(moves);
    expect(uci[6]).toBe('e1g1');
    expect(uci[9]).toBe('e8g8');
  });

  it('reads a promotion, with or without "="', () => {
    const fen = '[FEN "8/P7/8/8/8/8/8/k6K w - - 0 1"]';
    expect(service.import(`${fen} 1. a8=Q+`).moves).toEqual(['a7a8q']);
    expect(service.import(`${fen} 1. a8N`).moves).toEqual(['a7a8n']);
  });

  it('reads a FEN alone', () => {
    const game = service.import(
      'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2'
    );
    expect(game.moves).toEqual([]);
    expect(game.start.fullmoveNumber).toBe(2);
    expect(game.start.state.isWhiteTurn).toBeTrue();
  });

  it('rejects an empty text, an illegal move and a broken FEN', () => {
    const errorOf = (text: string) => {
      try {
        service.import(text);
        return null;
      } catch (error) {
        return error as GameImportError;
      }
    };
    expect(errorOf('  ')?.key).toBe('analysis.import.empty');
    const illegal = errorOf('1. e4 e5 2. Ke3');
    expect(illegal?.key).toBe('analysis.import.invalid');
    expect(illegal?.move).toBe('Ke3');
    expect(errorOf('[FEN "not a fen"] 1. e4')?.key).toBe(
      'analysis.import.invalid'
    );
  });

  it('reads a full online game with its headers', () => {
    const pgn = `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2026.08.14"]
[Round "?"]
[White "PlayerOne"]
[Black "PlayerTwo"]
[Result "0-1"]
[TimeControl "600"]
[WhiteElo "961"]
[BlackElo "1833"]
[Termination "PlayerTwo a gagné au temps"]
[ECO "A80"]
[EndTime "13:22:32 GMT+0000"]
[Link "https://www.chess.com/game/live/1?move=0"]

1. d4 f5 2. Bf4 Nf6 3. f3 e6 4. e3 d5 5. Bb5+ c6 6. Ba4 Qa5+ 7. Nc3 Qb6 8. Bb3
Qd8 9. Nge2 Be7 10. O-O Nbd7 11. Qd3 Nh5 12. e4 Nxf4 13. Nxf4 Nf6 14. e5 Nd7 15.
Nce2 Nb6 16. c4 dxc4 17. Bxc4 Nxc4 18. Qxc4 Qd7 19. Rac1 O-O 20. Ng3 Kf7 21. Kh1
g5 22. Nfh5 Rg8 23. Rfd1 a5 24. Nf6 Bxf6 25. exf6 Kxf6 26. Qc3 Qd5 27. b3 Bd7
28. Qe3 Kf7 29. Rc5 Qd6 30. Qe5 Qe7 31. Nh5 b6 32. Rc3 a4 33. d5 exd5 34. Rxc6
Bxc6 35. Qxf5+ Ke8 36. Nf6+ Kf7 37. Nxg8+ Kxg8 38. bxa4 h6 39. Qg6+ Qg7 40. Qxc6
Rd8 41. Rxd5 Rxd5 42. Qxd5+ Kh8 0-1`;
    const game = service.import(pgn);
    expect(game.moves.length).toBe(84);
    expect(game.moves[42]).toBe('f4h5'); // 22. Nfh5: the knight from f4
    expect(game.tags.length).toBe(14);
    expect(game.tags.find(tag => tag.name === 'Link')?.value).toBe(
      'https://www.chess.com/game/live/1?move=0'
    );
    expect(game.tags[4]).toEqual({ name: 'White', value: 'PlayerOne' });
    expect(game.tags.find(tag => tag.name === 'Termination')?.value).toBe(
      'PlayerTwo a gagné au temps'
    );
  });

  it('reads escaped quotes in headers, and no header for a FEN', () => {
    expect(pgnTags('[Event "The \\"big\\" one"] 1. e4')).toEqual([
      { name: 'Event', value: 'The "big" one' },
    ]);
    expect(service.import('8/8/4k3/8/8/4K3/8/8 w - - 0 1').tags).toEqual([]);
  });

  it('reads the clock left after each move', () => {
    const pgn = `[TimeControl "600"]

1. e4 {[%clk 0:09:58.1]} 1... e5 {[%clk 0:09:55]} 2. Nf3 {[%clk 0:09:50]}
(2. f4 {[%clk 0:01:00]}) 2... Nc6 {a comment [%clk 1:00:02]} 3. Bb5 *`;
    const game = service.import(pgn);
    expect(game.moves.length).toBe(5);
    expect(game.clocks).toEqual([598.1, 595, 590, 3602, null]);
    expect(game.tags).toEqual([{ name: 'TimeControl', value: '600' }]);
  });

  it('has no clocks when the PGN has none', () => {
    expect(service.import('1. e4 e5').clocks).toEqual([]);
  });

  it('splits move text into SAN tokens', () => {
    expect(sanTokens('12... Nf6 13. O-O-O 1/2-1/2')).toEqual([
      'Nf6',
      'O-O-O',
    ]);
  });
});
