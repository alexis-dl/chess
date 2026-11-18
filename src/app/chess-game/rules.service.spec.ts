import { TestBed } from '@angular/core/testing';
import { ChessUtilsService } from './chess-utils.service';
import { Chessboard } from './chessboard.model';
import { PieceName, Square } from './piece.model';
import { Position } from './position.model';
import { PromotionService } from './promotion/promotion.service';
import { RulesService } from './rules.service';

describe('RulesService', () => {
  let rules: RulesService;
  let utils: ChessUtilsService;
  let promotionService: PromotionService;

  /** 'e4' -> Position(4, 3) */
  const sq = (square: string): Position =>
    new Position(square.charCodeAt(0) - 'a'.charCodeAt(0), +square[1] - 1);

  /** Build an empty board containing only the given pieces. */
  const board = (
    setup: Record<string, PieceName>,
    whiteTurn = true
  ): Chessboard => {
    const chessBoard = new Chessboard(utils);
    chessBoard.setPieces(
      Array.from({ length: 8 }, () => Array<Square>(8).fill(''))
    );
    for (const [square, piece] of Object.entries(setup)) {
      chessBoard.setPieceByPos(piece, sq(square));
    }
    chessBoard.setIsWhiteTurn(whiteTurn);
    return chessBoard;
  };

  const validMoves = (chessBoard: Chessboard, from: string): string[] =>
    rules
      .getValidMovesByPiecePos(sq(from), chessBoard)
      .map(p => String.fromCharCode(97 + p.x) + (p.y + 1))
      .sort();

  const canMove = (chessBoard: Chessboard, from: string, to: string) =>
    validMoves(chessBoard, from).includes(to);

  const play = (chessBoard: Chessboard, from: string, to: string) =>
    rules.playMove(sq(from), sq(to), chessBoard);

  beforeEach(() => {
    TestBed.configureTestingModule({});
    rules = TestBed.inject(RulesService);
    utils = TestBed.inject(ChessUtilsService);
    promotionService = TestBed.inject(PromotionService);
  });

  describe('initial position', () => {
    it('has 20 available moves for white', () => {
      expect(rules.getAvailableMoves(new Chessboard(utils)).length).toBe(20);
    });

    it('lets a knight jump over pawns', () => {
      expect(validMoves(new Chessboard(utils), 'g1')).toEqual(['f3', 'h3']);
    });

    it('gives no move to a blocked bishop', () => {
      expect(validMoves(new Chessboard(utils), 'c1')).toEqual([]);
    });
  });

  describe('playMove', () => {
    it('plays a legal move and switches turn', () => {
      const chessBoard = new Chessboard(utils);
      const turns: boolean[] = [];
      rules.nextPlayersTurn.subscribe(isWhite => turns.push(isWhite));

      expect(play(chessBoard, 'e2', 'e4')).toBeTrue();
      expect(chessBoard.getPieceByPos(sq('e4'))).toBe('white-pawn');
      expect(chessBoard.getPieceByPos(sq('e2'))).toBe('');
      expect(chessBoard.getIsWhiteTurn()).toBeFalse();
      expect(turns).toEqual([false]);
    });

    it('refuses an illegal move', () => {
      const chessBoard = new Chessboard(utils);
      expect(play(chessBoard, 'e2', 'e5')).toBeFalse();
      expect(chessBoard.getPieceByPos(sq('e2'))).toBe('white-pawn');
      expect(chessBoard.getIsWhiteTurn()).toBeTrue();
    });

    it("refuses to move the opponent's piece", () => {
      expect(play(new Chessboard(utils), 'e7', 'e5')).toBeFalse();
    });
  });

  describe('piece moves', () => {
    it('slides a rook until it meets a piece, capturing enemies only', () => {
      const chessBoard = board({
        a1: 'white-king',
        h8: 'black-king',
        d4: 'white-rook',
        d6: 'black-pawn',
        f4: 'white-pawn',
      });
      expect(validMoves(chessBoard, 'd4')).toEqual(
        ['a4', 'b4', 'c4', 'd1', 'd2', 'd3', 'd5', 'd6', 'e4'].sort()
      );
    });

    it('moves a bishop on diagonals only', () => {
      const chessBoard = board({
        a8: 'white-king',
        h1: 'black-king',
        a1: 'white-bishop',
      });
      expect(validMoves(chessBoard, 'a1')).toEqual(
        ['b2', 'c3', 'd4', 'e5', 'f6', 'g7', 'h8'].sort()
      );
    });

    it('gives a queen in the center 27 moves on an empty board', () => {
      const chessBoard = board({
        a2: 'white-king',
        h7: 'black-king',
        d4: 'white-queen',
      });
      expect(validMoves(chessBoard, 'd4').length).toBe(27);
    });

    it('lets a pawn capture diagonally but not forward', () => {
      const chessBoard = board({
        a1: 'white-king',
        h8: 'black-king',
        e4: 'white-pawn',
        e5: 'black-pawn',
        d5: 'black-knight',
      });
      expect(validMoves(chessBoard, 'e4')).toEqual(['d5']);
    });

    it('prevents the king from moving into check', () => {
      const chessBoard = board({
        e1: 'white-king',
        h8: 'black-king',
        d8: 'black-rook',
      });
      expect(canMove(chessBoard, 'e1', 'd1')).toBeFalse();
      expect(canMove(chessBoard, 'e1', 'd2')).toBeFalse();
      expect(canMove(chessBoard, 'e1', 'f1')).toBeTrue();
    });

    it('keeps a pinned piece from moving off the pin line', () => {
      const chessBoard = board({
        e1: 'white-king',
        e2: 'white-bishop',
        e8: 'black-rook',
        a8: 'black-king',
      });
      expect(validMoves(chessBoard, 'e2')).toEqual([]);
    });

    it('only allows moves that parry a check', () => {
      const chessBoard = board({
        e1: 'white-king',
        a2: 'white-rook',
        e8: 'black-rook',
        a8: 'black-king',
      });
      // the rook can only block on e2
      expect(validMoves(chessBoard, 'a2')).toEqual(['e2']);
    });
  });

  describe('en passant', () => {
    it('captures en passant right after a double pawn push', () => {
      const chessBoard = board(
        {
          e1: 'white-king',
          e8: 'black-king',
          e5: 'white-pawn',
          d7: 'black-pawn',
        },
        false
      );
      play(chessBoard, 'd7', 'd5');

      expect(canMove(chessBoard, 'e5', 'd6')).toBeTrue();
      expect(play(chessBoard, 'e5', 'd6')).toBeTrue();
      expect(chessBoard.getPieceByPos(sq('d6'))).toBe('white-pawn');
      expect(chessBoard.getPieceByPos(sq('d5'))).toBe('');
    });

    it('is no longer available one move later', () => {
      const chessBoard = board(
        {
          e1: 'white-king',
          h8: 'black-king',
          e5: 'white-pawn',
          d7: 'black-pawn',
        },
        false
      );
      play(chessBoard, 'd7', 'd5');
      play(chessBoard, 'e1', 'f1');
      play(chessBoard, 'h8', 'g8');
      expect(canMove(chessBoard, 'e5', 'd6')).toBeFalse();
    });
  });

  describe('promotion', () => {
    it('detects a pawn reaching the last row', () => {
      const chessBoard = board({
        a1: 'white-king',
        h1: 'black-king',
        e7: 'white-pawn',
      });
      expect(rules.isPawnPromotion(sq('e7'), sq('e8'), chessBoard)).toBeTrue();
      expect(rules.isPawnPromotion(sq('a1'), sq('a2'), chessBoard)).toBeFalse();
    });

    it('replaces the pawn by the selected piece', () => {
      const chessBoard = board({
        a1: 'white-king',
        h1: 'black-king',
        e7: 'white-pawn',
      });
      expect(play(chessBoard, 'e7', 'e8')).toBeTrue();
      // the move waits for the user's choice
      expect(chessBoard.getPieceByPos(sq('e7'))).toBe('white-pawn');

      promotionService.selectPiece('white-queen');
      expect(chessBoard.getPieceByPos(sq('e8'))).toBe('white-queen');
      expect(chessBoard.getPieceByPos(sq('e7'))).toBe('');
      expect(chessBoard.getIsWhiteTurn()).toBeFalse();
    });

    it('leaves the board untouched when the promotion is cancelled', () => {
      const chessBoard = board({
        a1: 'white-king',
        h1: 'black-king',
        e7: 'white-pawn',
      });
      play(chessBoard, 'e7', 'e8');
      promotionService.cancelPromotion();
      expect(chessBoard.getPieceByPos(sq('e7'))).toBe('white-pawn');
      expect(chessBoard.getPieceByPos(sq('e8'))).toBe('');
      expect(chessBoard.getIsWhiteTurn()).toBeTrue();
    });
  });

  describe('end of game', () => {
    it("detects the fool's mate", () => {
      const chessBoard = new Chessboard(utils);
      const checkmated = jasmine.createSpy('checkmated');
      const stalemated = jasmine.createSpy('stalemated');
      rules.currentPlayerCheckmated.subscribe(checkmated);
      rules.currentPlayerStalemated.subscribe(stalemated);

      play(chessBoard, 'f2', 'f3');
      play(chessBoard, 'e7', 'e5');
      play(chessBoard, 'g2', 'g4');
      play(chessBoard, 'd8', 'h4');

      expect(checkmated).toHaveBeenCalledTimes(1);
      expect(stalemated).not.toHaveBeenCalled();
      expect(chessBoard.getCurrentPlayerColor()).toBe('white');
    });

    it('detects a stalemate', () => {
      const chessBoard = board({
        b6: 'white-king',
        c5: 'white-queen',
        a8: 'black-king',
      });
      const checkmated = jasmine.createSpy('checkmated');
      const stalemated = jasmine.createSpy('stalemated');
      rules.currentPlayerCheckmated.subscribe(checkmated);
      rules.currentPlayerStalemated.subscribe(stalemated);

      play(chessBoard, 'c5', 'c7');

      expect(stalemated).toHaveBeenCalledTimes(1);
      expect(checkmated).not.toHaveBeenCalled();
    });
  });

  describe('castling', () => {
    const base: Record<string, PieceName> = {
      e1: 'white-king',
      a1: 'white-rook',
      h1: 'white-rook',
      e8: 'black-king',
    };

    it('allows both castlings when the path is clear', () => {
      const chessBoard = board(base);
      expect(canMove(chessBoard, 'e1', 'g1')).toBeTrue();
      expect(canMove(chessBoard, 'e1', 'c1')).toBeTrue();
    });

    it('moves the rook to f1 on kingside castling', () => {
      const chessBoard = board(base);
      expect(play(chessBoard, 'e1', 'g1')).toBeTrue();
      expect(chessBoard.getPieceByPos(sq('g1'))).toBe('white-king');
      expect(chessBoard.getPieceByPos(sq('f1'))).toBe('white-rook');
      expect(chessBoard.getPieceByPos(sq('h1'))).toBe('');
    });

    it('moves the rook to d1 on queenside castling', () => {
      const chessBoard = board(base);
      expect(play(chessBoard, 'e1', 'c1')).toBeTrue();
      expect(chessBoard.getPieceByPos(sq('c1'))).toBe('white-king');
      expect(chessBoard.getPieceByPos(sq('d1'))).toBe('white-rook');
      expect(chessBoard.getPieceByPos(sq('a1'))).toBe('');
    });

    it('allows black castling', () => {
      const chessBoard = board(
        {
          e8: 'black-king',
          a8: 'black-rook',
          h8: 'black-rook',
          e1: 'white-king',
        },
        false
      );
      expect(canMove(chessBoard, 'e8', 'g8')).toBeTrue();
      expect(canMove(chessBoard, 'e8', 'c8')).toBeTrue();
    });

    it('is not possible from the initial position', () => {
      expect(canMove(new Chessboard(utils), 'e1', 'g1')).toBeFalse();
    });

    it('is blocked by a piece between king and rook', () => {
      const chessBoard = board({ ...base, b1: 'white-knight' });
      expect(canMove(chessBoard, 'e1', 'c1')).toBeFalse();
      expect(canMove(chessBoard, 'e1', 'g1')).toBeTrue();
    });

    it('is not possible while in check', () => {
      const chessBoard = board({ ...base, e5: 'black-rook' });
      expect(canMove(chessBoard, 'e1', 'g1')).toBeFalse();
      expect(canMove(chessBoard, 'e1', 'c1')).toBeFalse();
    });

    it('cannot pass through an attacked square', () => {
      const chessBoard = board({ ...base, f5: 'black-rook' });
      expect(canMove(chessBoard, 'e1', 'g1')).toBeFalse();
      expect(canMove(chessBoard, 'e1', 'c1')).toBeTrue();
    });

    it('cannot land on an attacked square', () => {
      const chessBoard = board({ ...base, g5: 'black-rook' });
      expect(canMove(chessBoard, 'e1', 'g1')).toBeFalse();
    });

    it('is allowed when only b1 is attacked (queenside)', () => {
      const chessBoard = board({ ...base, b5: 'black-rook' });
      expect(canMove(chessBoard, 'e1', 'c1')).toBeTrue();
    });

    it('only counts diagonal pawn attacks', () => {
      // a black pawn on g2 attacks f1 (and h1), not g1
      expect(
        canMove(board({ ...base, g2: 'black-pawn' }), 'e1', 'g1')
      ).toBeFalse();
      // a black pawn on g3 attacks f2/h2: castling is fine
      expect(
        canMove(board({ ...base, g3: 'black-pawn' }), 'e1', 'g1')
      ).toBeTrue();
    });

    it('is lost after the king has moved, even if it came back', () => {
      const chessBoard = board({ ...base, a8: 'black-rook' });
      play(chessBoard, 'e1', 'f1');
      play(chessBoard, 'a8', 'a7');
      play(chessBoard, 'f1', 'e1');
      play(chessBoard, 'a7', 'a8');
      expect(canMove(chessBoard, 'e1', 'g1')).toBeFalse();
      expect(canMove(chessBoard, 'e1', 'c1')).toBeFalse();
    });

    it('is lost on one side after that rook has moved', () => {
      const chessBoard = board(base);
      play(chessBoard, 'h1', 'h2');
      play(chessBoard, 'e8', 'd8');
      play(chessBoard, 'h2', 'h1');
      play(chessBoard, 'd8', 'e8');
      expect(canMove(chessBoard, 'e1', 'g1')).toBeFalse();
      expect(canMove(chessBoard, 'e1', 'c1')).toBeTrue();
    });

    it('is lost when the rook is captured', () => {
      const chessBoard = board({ ...base, h8: 'black-rook' }, false);
      play(chessBoard, 'h8', 'h1');
      expect(chessBoard.canCastle('white', true)).toBeFalse();
      expect(chessBoard.canCastle('white', false)).toBeTrue();
    });
  });
});
