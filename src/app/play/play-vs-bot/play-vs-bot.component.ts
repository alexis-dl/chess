import { Component, DoCheck, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BotService } from 'src/app/bot/bot.service';
import { BabyBot } from 'src/app/bot/models/babybot.model';
import { NormalBot } from 'src/app/bot/models/normalbot.model';
import { ChessUtilsService } from 'src/app/chess-game/chess-utils.service';
import { Chessboard } from 'src/app/chess-game/chessboard.model';
import {
  Color,
  PieceName,
  PieceType,
  toPieceName,
} from 'src/app/chess-game/piece.model';
import { PromotionService } from 'src/app/chess-game/promotion/promotion.service';
import { DrawReason, RulesService } from 'src/app/chess-game/rules.service';
import { PlayerType } from 'src/app/player/player-type.enum';
import { Player } from 'src/app/player/player.model';
import { TranslationKey } from 'src/app/i18n/translations';
import { Opening } from 'src/app/openings/openings';
import { OpeningService } from 'src/app/openings/opening.service';

/** Pause before the bot answers, so that the user's move is displayed first. */
const BOT_MOVE_DELAY_MS = 300;

const BOT_DESCRIPTIONS: Partial<Record<PlayerType, TranslationKey>> = {
  [PlayerType.Random]: 'play.bot.random',
  [PlayerType.Minimax]: 'play.bot.minimax',
};

/** Pieces in the order they are displayed once captured, with their value. */
const MATERIAL: { type: PieceType; value: number; startCount: number }[] = [
  { type: 'pawn', value: 1, startCount: 8 },
  { type: 'knight', value: 3, startCount: 2 },
  { type: 'bishop', value: 3, startCount: 2 },
  { type: 'rook', value: 5, startCount: 2 },
  { type: 'queen', value: 9, startCount: 1 },
];

/** Translation keys, so that the result follows a language change. */
interface GameResult {
  title: TranslationKey;
  detail: TranslationKey;
}

interface MaterialSummary {
  /** Pieces captured by each color. */
  captured: Record<Color, PieceName[]>;
  /** White material minus black material, in pawns. */
  balance: number;
}

/** A game between the user (white) and a bot (black). */
@Component({
    selector: 'app-play-vs-bot',
    templateUrl: './play-vs-bot.component.html',
    styleUrls: ['./play-vs-bot.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PlayVsBotComponent implements OnInit, DoCheck, OnDestroy {
  readonly user: Player = {
    name: 'Chacalito53',
    elo: 1549,
    profilePicture: 'assets/pictures/chacalito-profile-pic.png',
    playerType: PlayerType.User,
  };
  readonly bots: Player[] = [new BabyBot(), new NormalBot()];
  bot: Player = this.bots[1];

  chessBoard: Chessboard = new Chessboard(this.chessUtilsService);
  result: GameResult | null = null;
  moves: string[] = [];
  material: MaterialSummary = {
    captured: { white: [], black: [] },
    balance: 0,
  };
  /** Last known opening reached by the game. */
  opening: Opening | null = null;

  private renderedKey = '';
  private botTimeout?: ReturnType<typeof setTimeout>;
  private subscriptions: Subscription[] = [];

  constructor(
    private rulesService: RulesService,
    private botService: BotService,
    private promotionService: PromotionService,
    private chessUtilsService: ChessUtilsService,
    private openingService: OpeningService
  ) {}

  get isUserTurn(): boolean {
    return this.chessBoard.getIsWhiteTurn();
  }

  get canMove(): boolean {
    return this.isUserTurn && !this.result;
  }

  get canUndo(): boolean {
    return (
      this.chessBoard.getHistory().length > 0 &&
      (this.isUserTurn || this.result !== null)
    );
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.rulesService.currentPlayerCheckmated.subscribe(() => {
        // the side to move is the one that is mated
        const winner = this.chessBoard.getNextPlayerColor();
        this.result = {
          title: 'result.checkmate',
          detail: winner === 'white' ? 'result.whiteWins' : 'result.blackWins',
        };
      }),
      this.rulesService.currentPlayerStalemated.subscribe(() => {
        this.result = { title: 'result.stalemate', detail: 'result.draw' };
      }),
      this.rulesService.gameDrawn.subscribe((reason: DrawReason) => {
        this.result = { title: 'result.draw', detail: `draw.${reason}` };
      }),
      this.rulesService.nextPlayersTurn.subscribe(() => {
        if (!this.isUserTurn) {
          this.scheduleBotMove();
        }
      })
    );
  }

  /** Recompute the move list and material only when the position changed. */
  ngDoCheck(): void {
    const key =
      Chessboard.getPositionKey(this.chessBoard.saveState()) +
      this.chessBoard.getHistory().length;
    if (key !== this.renderedKey) {
      this.renderedKey = key;
      this.moves = this.chessBoard.getHistory().map(entry => entry.san);
      this.material = this.computeMaterial();
      this.opening = this.openingService.identify(this.chessBoard);
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.botTimeout);
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  botDescription(bot: Player): TranslationKey | null {
    return BOT_DESCRIPTIONS[bot.playerType] ?? null;
  }

  /** Take back the last user move (and the bot's answer). */
  undo(): void {
    clearTimeout(this.botTimeout);
    this.result = null;
    do {
      if (!this.rulesService.undoMove(this.chessBoard)) {
        return;
      }
    } while (!this.isUserTurn);
  }

  newGame(): void {
    clearTimeout(this.botTimeout);
    this.promotionService.cancelPromotion();
    this.chessBoard = new Chessboard(this.chessUtilsService);
    this.result = null;
  }

  selectBot(bot: Player): void {
    if (bot !== this.bot) {
      this.bot = bot;
      this.newGame();
    }
  }

  /** Asynchronous so that the UI renders the user's move first. */
  private scheduleBotMove(): void {
    clearTimeout(this.botTimeout);
    const chessBoard = this.chessBoard;
    this.botTimeout = setTimeout(() => {
      if (chessBoard === this.chessBoard && !this.result) {
        this.botService.play(chessBoard, this.bot.playerType);
      }
    }, BOT_MOVE_DELAY_MS);
  }

  private computeMaterial(): MaterialSummary {
    const count = (piece: PieceName) =>
      this.chessBoard
        .getPieces()
        .reduce(
          (total, row) => total + row.filter(square => square === piece).length,
          0
        );
    const summary: MaterialSummary = {
      captured: { white: [], black: [] },
      balance: 0,
    };
    for (const { type, value, startCount } of MATERIAL) {
      const white = count(toPieceName('white', type));
      const black = count(toPieceName('black', type));
      summary.balance += (white - black) * value;
      // promoted pieces can make the count exceed the start count
      for (let i = 0; i < startCount - black; i++) {
        summary.captured.white.push(toPieceName('black', type));
      }
      for (let i = 0; i < startCount - white; i++) {
        summary.captured.black.push(toPieceName('white', type));
      }
    }
    return summary;
  }
}
