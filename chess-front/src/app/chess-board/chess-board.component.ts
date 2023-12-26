import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { Position } from '../position';
import { RulesService } from '../rules.service';
import { ChessBoard } from '../chessBoard';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss'],
})
export class ChessBoardComponent implements OnInit {
  chessBoard: ChessBoard = new ChessBoard();
  highlightedSquares: Position[] = [];

  constructor(private rulesService: RulesService) {}

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
    const squaresToHighlight = this.rulesService.getMovesByPieceType(
      piecePos,
      this.chessBoard
    );

    this.highlightedSquares = squaresToHighlight;
  }

  onDrop(event: CdkDragDrop<any>): void {
    const oldPos: Position = event.item.data;
    const newPos: Position = event.container.data;
    // if(rulesService.isMoveValid())
    if (
      this.rulesService
        .getMovesByPieceType(new Position(oldPos.x, oldPos.y), this.chessBoard)
        .some(move => move.equals(newPos))
    ) {
      const piece = this.chessBoard.getPiece(oldPos);
      this.chessBoard.setPiece('', oldPos);
      this.chessBoard.setPiece(piece, newPos);
    }
  }
}
