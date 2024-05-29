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
        alert(this.chessBoard.getNextPlayerColor() + ' king is checkmated');
      })
    );

    this.subscriptions.push(
      this.rulesService.currentPlayerStalemated.subscribe(() => {
        alert(this.chessBoard.getNextPlayerColor() + ' king is in stalemate');
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

  onDrop(event: CdkDragDrop<any>): void {
    const oldPos: Position = event.item.data;
    const newPos: Position = event.container.data;

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
