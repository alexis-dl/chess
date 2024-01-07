import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChessUtilsService } from '../chess-utils.service';
import { Chessboard } from '../chessboard.model';
import { Position } from '../position.model';
import { RulesService } from '../rules.service';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss'],
})
export class ChessBoardComponent implements OnInit, OnDestroy {
  @Input() whitePiecesPlayerType: string = 'user';
  @Input() blackPiecesPlayerType: string = 'user';
  chessBoard: Chessboard = new Chessboard(this.chessUtilsService);
  highlightedSquares: Position[] = [];

  constructor(
    private rulesService: RulesService,
    private chessUtilsService: ChessUtilsService
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
        if (!this.currentPlayerIsUser()) {
          alert(
            this.chessBoard.getCurrentPlayerColor() + " c'est au bot de jouer"
          );
          // TODO : make bot play
        }
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
      this.currentPlayerIsUser() &&
      this.chessUtilsService.isPieceMovableByColor(
        this.chessBoard.getPieceColorByPos(piecePos),
        this.chessBoard.getIsWhiteTurn()
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
    if (this.currentPlayerIsUser()) {
      this.rulesService.playMove(oldPos, newPos, this.chessBoard);
    }
  }
  private currentPlayerIsUser() {
    return this.chessBoard.getIsWhiteTurn()
      ? this.whitePiecesPlayerType === 'user'
      : this.blackPiecesPlayerType === 'user';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
