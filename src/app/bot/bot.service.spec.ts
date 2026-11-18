import { TestBed } from '@angular/core/testing';
import { ChessUtilsService } from '../chess-game/chess-utils.service';
import { Chessboard } from '../chess-game/chessboard.model';
import { Move } from '../chess-game/move.model';
import { PieceName, Square } from '../chess-game/piece.model';
import { Position } from '../chess-game/position.model';
import { RulesService } from '../chess-game/rules.service';
import { PlayerType } from '../player/player-type.enum';
import { BotService } from './bot.service';

describe('BotService', () => {
  let bot: BotService;
  let rules: RulesService;
  let utils: ChessUtilsService;

  const sq = (square: string): Position =>
    new Position(square.charCodeAt(0) - 'a'.charCodeAt(0), +square[1] - 1);

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

  const notation = (move: Move) =>
    move.oldPos.toAlgebraic() + move.newPos.toAlgebraic();

  const isLegal = (chessBoard: Chessboard, move: Move) =>
    rules
      .getAvailableMoves(chessBoard)
      .some(m => notation(m) === notation(move));

  beforeEach(() => {
    TestBed.configureTestingModule({});
    bot = TestBed.inject(BotService);
    rules = TestBed.inject(RulesService);
    utils = TestBed.inject(ChessUtilsService);
  });

  describe('random bot', () => {
    it('plays a legal move', () => {
      const chessBoard = new Chessboard(utils);
      const move = bot.generateBotMove(chessBoard, PlayerType.Random);
      expect(isLegal(chessBoard, move)).toBeTrue();
    });
  });

  describe('minimax bot', () => {
    it('takes an undefended queen', () => {
      const chessBoard = board({
        a1: 'white-king',
        d1: 'white-rook',
        d5: 'black-queen',
        h8: 'black-king',
      });
      expect(notation(bot.generateMinimaxMove(chessBoard))).toBe('d1d5');
    });

    it('does not take a pawn defended by a pawn with its queen', () => {
      const chessBoard = board({
        a1: 'white-king',
        d1: 'white-queen',
        d6: 'black-pawn',
        e7: 'black-pawn',
        h8: 'black-king',
      });
      expect(notation(bot.generateMinimaxMove(chessBoard))).not.toBe('d1d6');
    });

    it('finds a back-rank mate in one', () => {
      const chessBoard = board({
        g1: 'white-king',
        a1: 'white-rook',
        g8: 'black-king',
        f7: 'black-pawn',
        g7: 'black-pawn',
        h7: 'black-pawn',
      });
      expect(notation(bot.generateMinimaxMove(chessBoard))).toBe('a1a8');
    });

    it('prefers a mate to winning material', () => {
      const chessBoard = board(
        {
          g8: 'black-king',
          a8: 'black-rook',
          b2: 'black-knight',
          g1: 'white-king',
          f2: 'white-pawn',
          g2: 'white-pawn',
          h2: 'white-pawn',
          d4: 'white-queen',
        },
        false
      );
      // Ra1+ mates; taking the queen with the knight is impossible, and
      // any other move is worse than mate
      expect(notation(bot.generateMinimaxMove(chessBoard))).toBe('a8a1');
    });

    it('plays a legal move from the initial position in reasonable time', () => {
      const chessBoard = new Chessboard(utils);
      const start = performance.now();
      const move = bot.generateBotMove(chessBoard, PlayerType.Minimax);
      const elapsed = performance.now() - start;
      expect(isLegal(chessBoard, move)).toBeTrue();
      expect(elapsed).toBeLessThan(5000);
    });
  });

  describe('play', () => {
    it('plays the move on the board and promotes to a queen', () => {
      const chessBoard = board({
        a1: 'white-king',
        h1: 'black-king',
        b7: 'white-pawn',
      });
      bot.play(chessBoard, PlayerType.Minimax);
      expect(chessBoard.getPieceByPos(sq('b8'))).toBe('white-queen');
      expect(chessBoard.getIsWhiteTurn()).toBeFalse();
      expect(chessBoard.getHistory().map(entry => entry.san)).toEqual(['b8=Q']);
    });
  });
});
