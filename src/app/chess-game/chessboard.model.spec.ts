import { ChessUtilsService } from './chess-utils.service';
import { Chessboard } from './chessboard.model';
import { Position } from './position.model';

describe('Chessboard', () => {
  let chessBoard: Chessboard;

  beforeEach(() => {
    chessBoard = new Chessboard(new ChessUtilsService());
  });

  describe('clone', () => {
    it('copies the whole state', () => {
      chessBoard.movePiece(new Position(4, 1), new Position(4, 3)); // e2-e4
      chessBoard.toggleIsWhiteTurn();
      chessBoard.movePiece(new Position(4, 0), new Position(4, 1)); // Ke1-e2

      const copy = chessBoard.clone();

      expect(copy).not.toBe(chessBoard);
      expect(copy.getPieces()).toEqual(chessBoard.getPieces());
      expect(copy.getIsWhiteTurn()).toBe(chessBoard.getIsWhiteTurn());
      expect(copy.getEnPassantColIndex()).toBe(
        chessBoard.getEnPassantColIndex()
      );
      expect(copy.getCastlingRights()).toEqual(chessBoard.getCastlingRights());
    });

    it('is independent from the original board', () => {
      const copy = chessBoard.clone();

      copy.movePiece(new Position(4, 1), new Position(4, 3)); // e2-e4
      copy.movePiece(new Position(7, 0), new Position(7, 2)); // Rh1-h3 (no check)
      copy.toggleIsWhiteTurn();

      expect(chessBoard.getPiece(4, 1)).toBe('white-pawn');
      expect(chessBoard.getPiece(4, 3)).toBe('');
      expect(chessBoard.getIsWhiteTurn()).toBeTrue();
      expect(chessBoard.getEnPassantColIndex()).toBe(-1);
      expect(chessBoard.canCastle('white', true)).toBeTrue();
    });
  });
});
