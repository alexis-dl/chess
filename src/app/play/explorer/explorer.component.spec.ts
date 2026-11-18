import { TestBed } from '@angular/core/testing';
import { ChessUtilsService } from 'src/app/chess-game/chess-utils.service';
import { PromotionService } from 'src/app/chess-game/promotion/promotion.service';
import { RulesService } from 'src/app/chess-game/rules.service';
import { parseUci } from 'src/app/puzzles/puzzle-moves';
import { ExplorerComponent } from './explorer.component';

describe('ExplorerComponent', () => {
  let rules: RulesService;
  let explorer: ExplorerComponent;

  /** Play a move on the displayed board, as the board component would. */
  const play = (uci: string) => {
    const { from, to } = parseUci(uci);
    expect(rules.playMove(from, to, explorer.chessBoard)).toBeTrue();
    explorer.ngDoCheck();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    rules = TestBed.inject(RulesService);
    explorer = new ExplorerComponent(
      rules,
      TestBed.inject(PromotionService),
      TestBed.inject(ChessUtilsService)
    );
  });

  it('records the moves played', () => {
    ['e2e4', 'e7e5', 'g1f3'].forEach(play);
    expect(explorer.moves).toEqual(['e4', 'e5', 'Nf3']);
    expect(explorer.ply).toBe(3);
  });

  it('goes back and forth without losing the line', () => {
    ['e2e4', 'e7e5', 'g1f3'].forEach(play);
    explorer.goToPly(1);
    expect(explorer.chessBoard.getHistory().map(e => e.san)).toEqual(['e4']);
    expect(explorer.chessBoard.getIsWhiteTurn()).toBeFalse();
    explorer.goToPly(3);
    expect(explorer.chessBoard.getHistory().length).toBe(3);
    expect(explorer.moves).toEqual(['e4', 'e5', 'Nf3']);
    play('b8c6');
    expect(explorer.moves).toEqual(['e4', 'e5', 'Nf3', 'Nc6']);
  });

  it('keeps the line when the next move is replayed', () => {
    ['e2e4', 'e7e5', 'g1f3'].forEach(play);
    explorer.goToPly(1);
    play('e7e5');
    expect(explorer.ply).toBe(2);
    expect(explorer.moves).toEqual(['e4', 'e5', 'Nf3']);
  });

  it('replaces the rest of the line when another move is played', () => {
    ['e2e4', 'e7e5', 'g1f3'].forEach(play);
    explorer.goToPly(1);
    play('c7c5');
    expect(explorer.moves).toEqual(['e4', 'c5']);
    expect(explorer.ply).toBe(2);
  });

  it('shows the result of the displayed position', () => {
    ['f2f3', 'e7e5', 'g2g4', 'd8h4'].forEach(play);
    expect(explorer.result?.title).toBe('result.checkmate');
    explorer.goToPly(3);
    expect(explorer.result).toBeNull();
    explorer.goToPly(4);
    expect(explorer.result?.detail).toBe('result.blackWins');
  });
});
