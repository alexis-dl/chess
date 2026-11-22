import { ChessUtilsService } from './chess-utils.service';
import { Chessboard } from './chessboard.model';
import { parseFen, toFen } from './fen';

describe('parseFen', () => {
  it('reads the initial position', () => {
    const { state, fullmoveNumber } = parseFen(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    );
    const initial = new Chessboard(new ChessUtilsService()).saveState();
    expect(state).toEqual(initial);
    expect(fullmoveNumber).toBe(1);
  });

  it('reads the side to move, en passant, clocks and castling rights', () => {
    const { state, fullmoveNumber } = parseFen(
      'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b Kq c6 3 12'
    );
    expect(state.isWhiteTurn).toBeFalse();
    expect(state.enPassantColIndex).toBe(2);
    expect(state.halfmoveClock).toBe(3);
    expect(fullmoveNumber).toBe(12);
    expect(state.castlingRights).toEqual({
      whiteKingSide: true,
      whiteQueenSide: false,
      blackKingSide: false,
      blackQueenSide: true,
    });
  });

  it('places pieces with rank 8 first and files a to h', () => {
    const { state } = parseFen('7k/8/8/8/8/8/8/R3K3 w - - 0 1');
    expect(state.pieces[0][0]).toBe('white-rook'); // a1
    expect(state.pieces[0][4]).toBe('white-king'); // e1
    expect(state.pieces[7][7]).toBe('black-king'); // h8
  });

  it('rejects malformed positions', () => {
    expect(() => parseFen('8/8/8 w - - 0 1')).toThrowError();
    expect(() => parseFen('8/8/8/8/8/8/8/9 w - - 0 1')).toThrowError();
    expect(() => parseFen('8/8/8/8/8/8/8/7x w - - 0 1')).toThrowError();
    expect(() => parseFen('8/8/8/8/8/8/8/8 x - - 0 1')).toThrowError();
  });
});

describe('toFen', () => {
  const FENS = [
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b Kq - 3 12',
    'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
    '8/8/4k3/8/8/4K3/8/8 b - - 40 61',
  ];

  for (const fen of FENS) {
    it(`writes back ${fen}`, () => {
      const { state, fullmoveNumber } = parseFen(fen);
      expect(toFen(state, fullmoveNumber)).toBe(fen);
    });
  }
});
