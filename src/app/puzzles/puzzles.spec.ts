import { TestBed } from '@angular/core/testing';
import { ChessUtilsService } from '../chess-game/chess-utils.service';
import { Chessboard } from '../chess-game/chessboard.model';
import { parseFen } from '../chess-game/fen';
import { Move } from '../chess-game/move.model';
import { PromotionPieceType } from '../chess-game/piece.model';
import { RulesService } from '../chess-game/rules.service';
import { parseUci } from './puzzle-moves';
import { PUZZLES } from './puzzle.model';

/** Validates the puzzle collection with the rules engine. */
describe('PUZZLES', () => {
  let rules: RulesService;
  let utils: ChessUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    rules = TestBed.inject(RulesService);
    utils = TestBed.inject(ChessUtilsService);
  });

  const uci = (move: Move) =>
    move.oldPos.toAlgebraic() + move.newPos.toAlgebraic();

  /** Play a move on a copy of the board (promotion to queen by default). */
  const play = (
    board: Chessboard,
    move: Move,
    promotion: PromotionPieceType = 'queen'
  ): Chessboard => {
    const copy = board.clone();
    const color = board.getCurrentPlayerColor();
    const promoting = rules.isPawnPromotion(move.oldPos, move.newPos, board);
    copy.movePiece(move.oldPos, move.newPos);
    if (promoting) {
      copy.setPieceByPos(`${color}-${promotion}`, move.newPos);
    }
    copy.toggleIsWhiteTurn();
    return copy;
  };

  const isMate = (board: Chessboard) =>
    rules.getAvailableMoves(board).length === 0 && rules.isInCheck(board);

  /** The side to move can force checkmate within `moves` of its moves. */
  const forcesMate = (board: Chessboard, moves: number): boolean =>
    rules.getAvailableMoves(board).some(move => wins(play(board, move), moves));

  /** After a move: the opponent is mated, or every reply still loses. */
  const wins = (afterMove: Chessboard, moves: number): boolean => {
    if (isMate(afterMove)) {
      return true;
    }
    if (moves <= 1) {
      return false;
    }
    const replies = rules.getAvailableMoves(afterMove);
    return (
      replies.length > 0 &&
      replies.every(reply => forcesMate(play(afterMove, reply), moves - 1))
    );
  };

  for (const puzzle of PUZZLES) {
    describe(`${puzzle.id} (${puzzle.goal})`, () => {
      const solverMoves = Math.ceil(puzzle.solution.length / 2);

      it('has a goal matching its solution length', () => {
        expect(puzzle.goal).toBe(`Mate in ${solverMoves}`);
      });

      it('has a legal solution ending in checkmate', () => {
        let board = new Chessboard(utils, parseFen(puzzle.fen).state);
        for (const step of puzzle.solution) {
          const { from, to, promotion } = parseUci(step);
          const legal = rules
            .getAvailableMoves(board)
            .find(move => move.oldPos.equals(from) && move.newPos.equals(to));
          expect(legal).withContext(`${step} is legal`).toBeDefined();
          if (!legal) {
            return;
          }
          board = play(board, legal, promotion);
        }
        expect(isMate(board)).withContext('ends in checkmate').toBeTrue();
      });

      if (solverMoves > 1) {
        it('has a single winning first move and no faster mate', () => {
          const board = new Chessboard(utils, parseFen(puzzle.fen).state);
          expect(forcesMate(board, solverMoves - 1))
            .withContext('no faster mate')
            .toBeFalse();
          const winningMoves = rules
            .getAvailableMoves(board)
            .filter(move => wins(play(board, move), solverMoves))
            .map(uci);
          expect(winningMoves).toEqual([puzzle.solution[0]]);
        });
      }
    });
  }
});
