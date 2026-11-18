import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BotService } from 'src/app/bot/bot.service';
import { PlayerType } from 'src/app/player/player-type.enum';
import { ChessUtilsService } from '../chess-utils.service';
import { Chessboard } from '../chessboard.model';
import { Position } from '../position.model';
import { PromotionService } from '../promotion/promotion.service';
import { RulesService } from '../rules.service';

/** Square coordinates attached as data to cdkDrag / cdkDropList in the template. */
interface SquareCoordinates {
  x: number;
  y: number;
}

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss'],
})
export class ChessBoardComponent implements OnInit, OnDestroy {
  @Input() whitePiecesPlayerType: PlayerType = PlayerType.User;
  @Input() blackPiecesPlayerType: PlayerType = PlayerType.User;
  chessBoard: Chessboard = new Chessboard(this.chessUtilsService);
  highlightedSquares: Position[] = [];
  promotionPosition: Position | null = null;

  constructor(
    private rulesService: RulesService,
    private chessUtilsService: ChessUtilsService,
    private botService: BotService,
    private promotionService: PromotionService
  ) {}

  private subscriptions: Subscription[] = [];
  ngOnInit(): void {
    this.subscriptions.push(
      this.rulesService.currentPlayerCheckmated.subscribe(() => {
        // the turn has already been toggled: the current player is the one who is mated
        alert(this.chessBoard.getCurrentPlayerColor() + ' king is checkmated');
      })
    );

    this.subscriptions.push(
      this.rulesService.currentPlayerStalemated.subscribe(() => {
        alert(
          this.chessBoard.getCurrentPlayerColor() + ' king is in stalemate'
        );
      })
    );

    this.subscriptions.push(
      this.rulesService.nextPlayersTurn.subscribe(() => {
        if (!this.isCurrentPlayerUser()) {
          // TODO : make bot play
          this.botService.play(this.chessBoard, this.getCurrentPlayerType());
        }
      })
    );

    this.subscriptions.push(
      this.promotionService.promotionPosition$.subscribe(pos => {
        this.promotionPosition = pos;
      })
    );
  }

  getSquareClass(x: number, y: number): { [key: string]: boolean } {
    const currentPosition: Position = new Position(x, y);
    return {
      'white-square': (x + y) % 2 === 0,
      'black-square': (x + y) % 2 !== 0,
      'highlight-square': this.highlightedSquares.some(square =>
        currentPosition.equals(square)
      ),
    };
  }

  highlightAllowedMoves(x: number, y: number) {
    const piecePos = new Position(x, y);
    if (
      this.isCurrentPlayerUser() &&
      this.chessUtilsService.isPieceMovableByColor(
        this.chessBoard.getPieceColorByPos(piecePos),
        this.chessBoard
      )
    ) {
      const squaresToHighlight = this.rulesService.getValidMovesByPiecePos(
        piecePos,
        this.chessBoard
      );
      this.highlightedSquares = squaresToHighlight;
    }
  }

  refreshHighlightedSquares() {
    this.highlightedSquares = [];
  }

  onDrop(
    event: CdkDragDrop<SquareCoordinates, SquareCoordinates, SquareCoordinates>
  ): void {
    const oldPos = new Position(event.item.data.x, event.item.data.y);
    const newPos = new Position(event.container.data.x, event.container.data.y);
    this.refreshHighlightedSquares();
    // prevent user to play when it's bot's turn
    if (this.isCurrentPlayerUser()) {
      this.rulesService.playMove(oldPos, newPos, this.chessBoard);
    }
  }

  showPromotion(row: number, col: number): boolean {
    return (
      this.isCurrentPlayerUser() &&
      this.promotionPosition?.x === col &&
      this.promotionPosition?.y === row
    );
  }

  /** History grouped by full move: [['e4', 'e5'], ['Nf3', 'Nc6'], ['Bb5']]. */
  get movePairs(): string[][] {
    const sans = this.chessBoard.getHistory().map(entry => entry.san);
    const pairs: string[][] = [];
    for (let i = 0; i < sans.length; i += 2) {
      pairs.push(sans.slice(i, i + 2));
    }
    return pairs;
  }

  canUndo(): boolean {
    return (
      this.isCurrentPlayerUser() &&
      this.chessBoard
        .getHistory()
        .some((_, i) => this.getPlayerTypeForPly(i) === PlayerType.User)
    );
  }

  /** Undo moves until it is a user's turn again (i.e. also undo the bot's answer). */
  undo(): void {
    this.refreshHighlightedSquares();
    do {
      if (!this.rulesService.undoMove(this.chessBoard)) {
        return;
      }
    } while (!this.isCurrentPlayerUser());
  }

  /** Player type of the side that played the ply at this history index. */
  private getPlayerTypeForPly(plyIndex: number): PlayerType {
    const whiteStarted =
      this.chessBoard.getHistory()[0]?.stateBefore.isWhiteTurn ?? true;
    const isWhitePly = (plyIndex % 2 === 0) === whiteStarted;
    return isWhitePly ? this.whitePiecesPlayerType : this.blackPiecesPlayerType;
  }

  private isCurrentPlayerUser(): boolean {
    return this.getCurrentPlayerType() === PlayerType.User;
  }

  private getCurrentPlayerType() {
    return this.chessBoard.getIsWhiteTurn()
      ? this.whitePiecesPlayerType
      : this.blackPiecesPlayerType;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
