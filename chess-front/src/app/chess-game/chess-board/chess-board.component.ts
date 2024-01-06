import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { Position } from '../position.model';
import { RulesService } from '../rules.service';
import { Chessboard } from '../chessboard.model';
import { ChessUtilsService } from '../chess-utils.service';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss'],
})
export class ChessBoardComponent implements OnInit {
  chessBoard: Chessboard = new Chessboard(this.chessUtilsService);
  highlightedSquares: Position[] = [];

  constructor(
    private rulesService: RulesService,
    private chessUtilsService: ChessUtilsService
  ) {}

  ngOnInit(): void {}

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
    const squaresToHighlight = this.rulesService.getValidMovesByPiecePos(
      piecePos,
      this.chessBoard
    );

    this.highlightedSquares = squaresToHighlight;
  }

  refreshHighlightedSquares() {
    this.highlightedSquares = [];
  }

  onDrop(event: CdkDragDrop<any>): void {
    const oldPos: Position = event.item.data;
    const newPos: Position = event.container.data;

    if (this.rulesService.isMoveValid(oldPos, newPos, this.chessBoard)) {
      this.rulesService.movePiece(oldPos, newPos, this.chessBoard);
      this.refreshHighlightedSquares();
      // verify game end
      if (!this.rulesService.hasCurrentPlayerAnyMove(this.chessBoard)) {
        this.rulesService.hasCurrentPlayerAnyMove(this.chessBoard);
        if (
          this.rulesService.isKingChecked(
            this.chessBoard.getPlayerColor(),
            this.chessBoard
          )
        ) {
          alert(this.chessBoard.getPlayerColor() + ' king is checkmated');
        } else {
          alert(this.chessBoard.getPlayerColor() + ' king is in stalemate');
        }
      }
    }
  }
}
