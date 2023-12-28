import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { Position } from '../position';
import { RulesService } from '../rules.service';
import { Chessboard } from '../chessboard';
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

  onDrop(event: CdkDragDrop<any>): void {
    const oldPos: Position = event.item.data;
    const newPos: Position = event.container.data;
    // if(rulesService.isMoveValid())
    if (this.rulesService.isMoveValid(oldPos, newPos, this.chessBoard)) {
      this.rulesService.movePiece(oldPos, newPos, this.chessBoard);
      // send an alert if king are checked
      // this.rulesService.isKingChecked(
      //   this.chessUtilsService.getColor('white'),
      //   this.chessBoard
      // );
      // this.rulesService.isKingChecked(
      //   this.chessUtilsService.getColor('black'),
      //   this.chessBoard
      // );
    }
  }
}
