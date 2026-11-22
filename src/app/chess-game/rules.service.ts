import { Injectable } from '@angular/core';
import { Subject, take } from 'rxjs';
import { ChessUtilsService } from './chess-utils.service';
import { Chessboard } from './chessboard.model';
import { Move } from './move.model';
import {
  Color,
  getOpponentColor,
  PieceName,
  PieceType,
  toPieceName,
} from './piece.model';
import { Position } from './position.model';
import { PromotionService } from './promotion/promotion.service';

/** Draws applied automatically (stalemate has its own event). */
export type DrawReason =
  'fifty-move-rule' | 'threefold-repetition' | 'insufficient-material';

/** Piece letters used in standard algebraic notation (pawns have none). */
const SAN_LETTERS: Record<PieceType, string> = {
  pawn: '',
  knight: 'N',
  bishop: 'B',
  rook: 'R',
  queen: 'Q',
  king: 'K',
};

/** [deltaX, deltaY] */
type Direction = readonly [number, number];

const ROOK_DIRECTIONS: Direction[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
const BISHOP_DIRECTIONS: Direction[] = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];
/** Queen slides and king steps in all 8 directions. */
const ALL_DIRECTIONS: Direction[] = [...ROOK_DIRECTIONS, ...BISHOP_DIRECTIONS];
const KNIGHT_JUMPS: Direction[] = [
  [2, 1],
  [1, 2],
  [-1, 2],
  [-2, 1],
  [-2, -1],
  [-1, -2],
  [1, -2],
  [2, -1],
];

@Injectable({
  providedIn: 'root',
})
export class RulesService {
  /** true for white's turn, false for black's */
  public nextPlayersTurn: Subject<boolean> = new Subject<boolean>();

  public currentPlayerCheckmated: Subject<void> = new Subject<void>();
  public currentPlayerStalemated: Subject<void> = new Subject<void>();
  public gameDrawn: Subject<DrawReason> = new Subject<DrawReason>();

  constructor(
    private chessUtilsService: ChessUtilsService,
    private promotionService: PromotionService
  ) {}

  /**
   * Verify if move is playable according to the rules and play it.
   * Also updates every game linked indicators.
   * @returns boolean that indicates if the move could have been played.
   */
  playMove(
    oldPos: Position,
    newPos: Position,
    chessBoard: Chessboard
  ): boolean {
    if (!this.isMoveValid(oldPos, newPos, chessBoard)) {
      return false;
    }
    if (this.isPawnPromotion(oldPos, newPos, chessBoard)) {
      this.triggerPromotionUI(oldPos, newPos, chessBoard);
    } else {
      this.commitMove(oldPos, newPos, chessBoard);
    }
    return true;
  }

  /**
   * Like playMove, but a promotion uses the given piece instead of asking the
   * user (to replay a recorded game).
   * @returns false when the move is illegal, or is a promotion without piece.
   */
  playMoveWithPromotion(
    oldPos: Position,
    newPos: Position,
    chessBoard: Chessboard,
    promotionPiece?: PieceName
  ): boolean {
    if (!this.isMoveValid(oldPos, newPos, chessBoard)) {
      return false;
    }
    const isPromotion = this.isPawnPromotion(oldPos, newPos, chessBoard);
    if (isPromotion !== !!promotionPiece) {
      return false;
    }
    this.commitMove(oldPos, newPos, chessBoard, promotionPiece);
    return true;
  }

  /**
   * Undo the last played move. A pending promotion is cancelled.
   * @returns false when there is no move to undo.
   */
  undoMove(chessBoard: Chessboard): boolean {
    this.promotionService.cancelPromotion();
    const lastEntry = chessBoard.popHistory();
    if (!lastEntry) {
      return false;
    }
    chessBoard.restoreState(lastEntry.stateBefore);
    return true;
  }

  /** True if the king of the player whose turn it is is in check. */
  isInCheck(chessBoard: Chessboard): boolean {
    return this.isKingChecked(chessBoard.getCurrentPlayerColor(), chessBoard);
  }

  /**
   * Play an already validated move, record it in the history and emit the
   * game events (checkmate, stalemate or next player's turn).
   */
  private commitMove(
    oldPos: Position,
    newPos: Position,
    chessBoard: Chessboard,
    promotionPiece?: PieceName
  ): void {
    const stateBefore = chessBoard.saveState();
    const sanWithoutCheck = this.getSanWithoutCheck(
      oldPos,
      newPos,
      chessBoard,
      promotionPiece
    );

    chessBoard.movePiece(oldPos, newPos);
    if (promotionPiece) {
      chessBoard.setPieceByPos(promotionPiece, newPos);
    }
    chessBoard.toggleIsWhiteTurn();

    const isInCheck = this.isInCheck(chessBoard);
    const hasAnyMove = this.hasPlayerAnyMove(chessBoard);
    const checkSuffix = isInCheck ? (hasAnyMove ? '+' : '#') : '';
    chessBoard.pushHistory({
      move: { oldPos, newPos },
      san: sanWithoutCheck + checkSuffix,
      stateBefore,
    });

    if (!hasAnyMove) {
      if (isInCheck) {
        this.currentPlayerCheckmated.next();
      } else {
        this.currentPlayerStalemated.next();
      }
      return;
    }
    const drawReason = this.getDrawReason(chessBoard);
    if (drawReason) {
      this.gameDrawn.next(drawReason);
    } else {
      //send nextPlayersTurn event when game is not over.
      this.nextPlayersTurn.next(chessBoard.getIsWhiteTurn());
    }
  }

  /** Automatic draw that applies to the current position, if any. */
  getDrawReason(chessBoard: Chessboard): DrawReason | null {
    if (this.isInsufficientMaterial(chessBoard)) {
      return 'insufficient-material';
    }
    if (this.isThreefoldRepetition(chessBoard)) {
      return 'threefold-repetition';
    }
    if (chessBoard.getHalfmoveClock() >= 100) {
      return 'fifty-move-rule';
    }
    return null;
  }

  /** The current position has occurred at least 3 times. */
  isThreefoldRepetition(chessBoard: Chessboard): boolean {
    const currentKey = Chessboard.getPositionKey(chessBoard.saveState());
    const previousOccurrences = chessBoard
      .getHistory()
      .filter(
        entry => Chessboard.getPositionKey(entry.stateBefore) === currentKey
      ).length;
    return previousOccurrences + 1 >= 3;
  }

  /**
   * Neither side can checkmate: king against king, king and a single minor
   * piece against king, or only bishops all standing on squares of one color.
   */
  isInsufficientMaterial(chessBoard: Chessboard): boolean {
    const minorPieces: { type: PieceType; squareColor: number }[] = [];
    for (let y = 0; y < Chessboard.BOARD_SIZE; y++) {
      for (let x = 0; x < Chessboard.BOARD_SIZE; x++) {
        const type = chessBoard.getPieceTypeByPos(new Position(x, y));
        if (type === null || type === 'king') {
          continue;
        }
        if (type !== 'knight' && type !== 'bishop') {
          return false; // a pawn, rook or queen can always mate
        }
        minorPieces.push({ type, squareColor: (x + y) % 2 });
      }
    }
    return (
      minorPieces.length <= 1 ||
      minorPieces.every(
        piece =>
          piece.type === 'bishop' &&
          piece.squareColor === minorPieces[0].squareColor
      )
    );
  }

  /**
   * Standard algebraic notation of a legal move, computed before playing it
   * (check/mate suffix excluded).
   */
  getSanWithoutCheck(
    oldPos: Position,
    newPos: Position,
    chessBoard: Chessboard,
    promotionPiece?: PieceName
  ): string {
    const piece = chessBoard.getPieceByPos(oldPos);
    if (!piece) {
      return '';
    }
    const type = this.chessUtilsService.getType(piece);
    const destination = newPos.toAlgebraic();

    if (type === 'king' && Math.abs(newPos.x - oldPos.x) === 2) {
      return newPos.x > oldPos.x ? 'O-O' : 'O-O-O';
    }

    if (type === 'pawn') {
      // a diagonal pawn move is always a capture (possibly en passant)
      const capture =
        oldPos.x !== newPos.x ? oldPos.toAlgebraic()[0] + 'x' : '';
      const promotion = promotionPiece
        ? '=' + SAN_LETTERS[this.chessUtilsService.getType(promotionPiece)]
        : '';
      return capture + destination + promotion;
    }

    const capture = chessBoard.getPieceByPos(newPos) ? 'x' : '';
    return (
      SAN_LETTERS[type] +
      this.getSanDisambiguation(piece, oldPos, newPos, chessBoard) +
      capture +
      destination
    );
  }

  /**
   * When several identical pieces can reach the same square, SAN adds the
   * origin file, else the origin rank, else both (e.g. 'Nbd2', 'R1a3').
   */
  private getSanDisambiguation(
    piece: PieceName,
    oldPos: Position,
    newPos: Position,
    chessBoard: Chessboard
  ): string {
    const rivals: Position[] = [];
    for (let y = 0; y < Chessboard.BOARD_SIZE; y++) {
      for (let x = 0; x < Chessboard.BOARD_SIZE; x++) {
        const pos = new Position(x, y);
        if (
          !pos.equals(oldPos) &&
          chessBoard.getPieceByPos(pos) === piece &&
          this.getValidMovesByPiecePos(pos, chessBoard).some(move =>
            move.equals(newPos)
          )
        ) {
          rivals.push(pos);
        }
      }
    }
    if (rivals.length === 0) {
      return '';
    }
    const origin = oldPos.toAlgebraic();
    if (rivals.every(rival => rival.x !== oldPos.x)) {
      return origin[0];
    }
    if (rivals.every(rival => rival.y !== oldPos.y)) {
      return origin[1];
    }
    return origin;
  }

  /** All legal moves of the player whose turn it is. */
  getAvailableMoves(chessBoard: Chessboard): Move[] {
    const currentPlayerColor = chessBoard.getCurrentPlayerColor();
    const allMoves: Move[] = [];

    for (let y = 0; y < Chessboard.BOARD_SIZE; y++) {
      for (let x = 0; x < Chessboard.BOARD_SIZE; x++) {
        const oldPos = new Position(x, y);
        if (chessBoard.getPieceColorByPos(oldPos) !== currentPlayerColor) {
          continue;
        }
        for (const newPos of this.getValidMovesByPiecePos(oldPos, chessBoard)) {
          allMoves.push({ oldPos, newPos });
        }
      }
    }
    return allMoves;
  }

  private hasPlayerAnyMove(chessBoard: Chessboard): boolean {
    return this.getAvailableMoves(chessBoard).length > 0;
  }

  /**  Give a validation for a given move :
        - verify if it's white/black's turn.
        - verify that the piece can reach the square.
        - verify if own king is checked after the move. */
  private isMoveValid(
    oldPos: Position,
    newPos: Position,
    chessBoard: Chessboard
  ): boolean {
    const pieceColor = chessBoard.getPieceColorByPos(oldPos);
    if (pieceColor !== chessBoard.getCurrentPlayerColor()) {
      return false;
    }
    return (
      this.getCandidateMovesByPiecePos(oldPos, chessBoard).some(move =>
        move.equals(newPos)
      ) && this.isKingSafeAfterMove(oldPos, newPos, pieceColor, chessBoard)
    );
  }

  // get all valid moves for a given PiecePos, verifying that the own king is not checked after the move.
  getValidMovesByPiecePos(
    piecePos: Position,
    chessBoard: Chessboard
  ): Position[] {
    const pieceColor = chessBoard.getPieceColorByPos(piecePos);
    if (pieceColor !== chessBoard.getCurrentPlayerColor()) {
      return [];
    }
    return this.getCandidateMovesByPiecePos(piecePos, chessBoard).filter(
      newPos =>
        this.isKingSafeAfterMove(piecePos, newPos, pieceColor, chessBoard)
    );
  }

  /** Simulate the move and check that it does not leave the own king in check. */
  private isKingSafeAfterMove(
    oldPos: Position,
    newPos: Position,
    color: Color,
    chessBoard: Chessboard
  ): boolean {
    const cloneChessboard = chessBoard.clone();
    cloneChessboard.movePiece(oldPos, newPos);
    return !this.isKingChecked(color, cloneChessboard);
  }

  /** Regular piece moves plus castling moves (castling is not an attacking move). */
  private getCandidateMovesByPiecePos(
    piecePos: Position,
    chessBoard: Chessboard
  ): Position[] {
    return [
      ...this.getMovesByPiecePos(piecePos, chessBoard),
      ...this.getCastlingMoves(piecePos, chessBoard),
    ];
  }

  /**
   * Castling destinations for the king at piecePos. Checks castling rights,
   * empty squares between king and rook, king not in check and not passing
   * through an attacked square. The destination square is checked by isMoveValid.
   */
  private getCastlingMoves(
    piecePos: Position,
    chessBoard: Chessboard
  ): Position[] {
    const piece = chessBoard.getPieceByPos(piecePos);
    if (piece !== 'white-king' && piece !== 'black-king') {
      return [];
    }
    const color = this.chessUtilsService.getColor(piece);
    const row = color === 'white' ? 0 : 7;
    if (piecePos.x !== 4 || piecePos.y !== row) {
      return [];
    }
    const opponentColor = getOpponentColor(color);
    if (this.isSquareAttacked(piecePos, opponentColor, chessBoard)) {
      return [];
    }

    const moves: Position[] = [];
    const sides = [
      { kingSide: true, rookX: 7, emptyXs: [5, 6], passX: 5, destX: 6 },
      { kingSide: false, rookX: 0, emptyXs: [1, 2, 3], passX: 3, destX: 2 },
    ];
    for (const side of sides) {
      if (
        chessBoard.canCastle(color, side.kingSide) &&
        chessBoard.getPiece(side.rookX, row) === toPieceName(color, 'rook') &&
        side.emptyXs.every(x => !chessBoard.getPiece(x, row)) &&
        !this.isSquareAttacked(
          new Position(side.passX, row),
          opponentColor,
          chessBoard
        )
      ) {
        moves.push(new Position(side.destX, row));
      }
    }
    return moves;
  }

  /** Method that retrieve all available moves for a piece, regarding to its type.
   Does NOT verify if king is checked or if it's white/black's turn (KISS). **/
  private getMovesByPiecePos(
    piecePos: Position,
    chessBoard: Chessboard
  ): Position[] {
    const piece = chessBoard.getPieceByPos(piecePos);
    if (!piece) {
      return [];
    }
    const color = this.chessUtilsService.getColor(piece);

    switch (this.chessUtilsService.getType(piece)) {
      case 'king':
        return this.getStepMoves(piecePos, color, ALL_DIRECTIONS, chessBoard);
      case 'queen':
        return this.getSlidingMoves(
          piecePos,
          color,
          ALL_DIRECTIONS,
          chessBoard
        );
      case 'rook':
        return this.getSlidingMoves(
          piecePos,
          color,
          ROOK_DIRECTIONS,
          chessBoard
        );
      case 'bishop':
        return this.getSlidingMoves(
          piecePos,
          color,
          BISHOP_DIRECTIONS,
          chessBoard
        );
      case 'knight':
        return this.getStepMoves(piecePos, color, KNIGHT_JUMPS, chessBoard);
      case 'pawn':
        return this.getPawnMoves(piecePos, color, chessBoard);
    }
  }

  /**
   * Moves of a sliding piece (queen, rook, bishop): goes as far as possible in
   * each direction, stopping on the first piece met (included if it is an enemy).
   */
  private getSlidingMoves(
    piecePos: Position,
    color: Color,
    directions: Direction[],
    chessBoard: Chessboard
  ): Position[] {
    const moves: Position[] = [];
    for (const [deltaX, deltaY] of directions) {
      let newPos = piecePos.addX(deltaX).addY(deltaY);
      while (newPos.isInsideTheBoard()) {
        const targetColor = chessBoard.getPieceColorByPos(newPos);
        if (targetColor !== color) {
          moves.push(newPos);
        }
        if (targetColor !== null) {
          break;
        }
        newPos = newPos.addX(deltaX).addY(deltaY);
      }
    }
    return moves;
  }

  /**
   * Moves of a stepping piece (king, knight): one jump per delta, onto an empty
   * square or an enemy piece.
   */
  private getStepMoves(
    piecePos: Position,
    color: Color,
    deltas: Direction[],
    chessBoard: Chessboard
  ): Position[] {
    return deltas
      .map(([deltaX, deltaY]) => piecePos.addX(deltaX).addY(deltaY))
      .filter(
        newPos =>
          newPos.isInsideTheBoard() &&
          chessBoard.getPieceColorByPos(newPos) !== color
      );
  }

  private getPawnMoves(
    piecePos: Position,
    color: Color,
    chessBoard: Chessboard
  ): Position[] {
    const moves: Position[] = [];
    const direction = color === 'white' ? 1 : -1;

    // one square forward, then two from the initial row
    const forwardOne = piecePos.addY(direction);
    if (
      forwardOne.isInsideTheBoard() &&
      !chessBoard.getPieceByPos(forwardOne)
    ) {
      moves.push(forwardOne);

      const initialRow = color === 'white' ? 1 : 6;
      const forwardTwo = forwardOne.addY(direction);
      if (piecePos.y === initialRow && !chessBoard.getPieceByPos(forwardTwo)) {
        moves.push(forwardTwo);
      }
    }

    // diagonal captures
    const opponentColor = getOpponentColor(color);
    for (const deltaX of [-1, 1]) {
      const attackPos = piecePos.addX(deltaX).addY(direction);
      if (
        attackPos.isInsideTheBoard() &&
        chessBoard.getPieceColorByPos(attackPos) === opponentColor
      ) {
        moves.push(attackPos);
      }
    }

    // en passant
    const enPassantColIndex = chessBoard.getEnPassantColIndex();
    const enPassantRow = color === 'white' ? 4 : 3;
    if (
      enPassantColIndex !== -1 &&
      piecePos.y === enPassantRow &&
      Math.abs(piecePos.x - enPassantColIndex) === 1
    ) {
      moves.push(new Position(enPassantColIndex, enPassantRow + direction));
    }
    return moves;
  }

  /** Check if the king of the given color is in check on the given chessboard. */
  private isKingChecked(color: Color, chessBoard: Chessboard): boolean {
    const kingPos = chessBoard.findPiecePosition(toPieceName(color, 'king'));
    return (
      kingPos !== null &&
      this.isSquareAttacked(kingPos, getOpponentColor(color), chessBoard)
    );
  }

  /**
   * Check if any piece of attackerColor attacks the given square. Looks from
   * the square outwards (pawn and knight squares, king neighbours, rays) rather
   * than generating every enemy move.
   */
  private isSquareAttacked(
    square: Position,
    attackerColor: Color,
    chessBoard: Chessboard
  ): boolean {
    const pieceAt = ([deltaX, deltaY]: Direction) => {
      const pos = square.addX(deltaX).addY(deltaY);
      return pos.isInsideTheBoard() ? chessBoard.getPieceByPos(pos) : '';
    };

    // pawns only attack diagonally forward: an attacking pawn stands one row behind
    const pawnRow = attackerColor === 'white' ? -1 : 1;
    const pawn = toPieceName(attackerColor, 'pawn');
    if (pieceAt([-1, pawnRow]) === pawn || pieceAt([1, pawnRow]) === pawn) {
      return true;
    }

    const knight = toPieceName(attackerColor, 'knight');
    if (KNIGHT_JUMPS.some(jump => pieceAt(jump) === knight)) {
      return true;
    }

    const king = toPieceName(attackerColor, 'king');
    if (ALL_DIRECTIONS.some(direction => pieceAt(direction) === king)) {
      return true;
    }

    const queen = toPieceName(attackerColor, 'queen');
    const sliders: [Direction[], PieceName][] = [
      [ROOK_DIRECTIONS, toPieceName(attackerColor, 'rook')],
      [BISHOP_DIRECTIONS, toPieceName(attackerColor, 'bishop')],
    ];
    for (const [directions, slider] of sliders) {
      for (const [deltaX, deltaY] of directions) {
        let pos = square.addX(deltaX).addY(deltaY);
        while (pos.isInsideTheBoard()) {
          const piece = chessBoard.getPieceByPos(pos);
          if (piece) {
            if (piece === slider || piece === queen) {
              return true;
            }
            break;
          }
          pos = pos.addX(deltaX).addY(deltaY);
        }
      }
    }
    return false;
  }

  /**
   * Checks if the pawn reaches the promotion row.
   */
  isPawnPromotion(
    oldPos: Position,
    newPos: Position,
    chessBoard: Chessboard
  ): boolean {
    const isPawn = chessBoard.getPieceTypeByPos(oldPos) === 'pawn';
    const pieceColor = chessBoard.getPieceColorByPos(oldPos);
    const isLastRow =
      (pieceColor === 'white' && newPos.y === 7) ||
      (pieceColor === 'black' && newPos.y === 0);
    return isPawn && isLastRow;
  }

  private triggerPromotionUI(
    oldPos: Position,
    newPos: Position,
    chessBoard: Chessboard
  ): void {
    this.promotionService.showPromotionUI(newPos);
    this.promotionService.promotionPiece$.pipe(take(1)).subscribe(piece => {
      if (piece) {
        this.commitMove(oldPos, newPos, chessBoard, piece);
      }
    });
  }
}
