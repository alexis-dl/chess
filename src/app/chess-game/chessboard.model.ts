import { ChessUtilsService } from './chess-utils.service';
import { Color, PieceName, PieceType, Square } from './piece.model';
import { Position } from './position.model';

export interface CastlingRights {
  whiteKingSide: boolean;
  whiteQueenSide: boolean;
  blackKingSide: boolean;
  blackQueenSide: boolean;
}

export class Chessboard {
  static readonly BOARD_SIZE = 8;

  /** pieces[y][x]: y is the row (0 = white's back rank), x the column. */
  private pieces: Square[][] = [];
  private isWhiteTurn = true;
  private enPassantColIndex = -1;
  private castlingRights: CastlingRights = {
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true,
  };

  constructor(private chessUtilsService: ChessUtilsService) {
    this.initializeChessBoard();
  }

  /**
   * Move the piece from Position A to Position B without verification of validity.
   * @returns the eaten piece if there is one.
   */
  movePiece(oldPos: Position, newPos: Position): Square {
    const movingPiece = this.getPieceByPos(oldPos);
    const movingType = this.chessUtilsService.getType(movingPiece);
    let eatenPiece = this.getPieceByPos(newPos);

    // move and eat piece
    this.setPieceByPos('', oldPos);
    this.setPieceByPos(movingPiece, newPos);

    // if move is en passant, eat piece in diagonal
    const isWhitePawn = movingPiece === 'white-pawn';
    const isBlackPawn = movingPiece === 'black-pawn';
    if (
      ((isWhitePawn && oldPos.y === 4) || (isBlackPawn && oldPos.y === 3)) &&
      newPos.x === this.enPassantColIndex
    ) {
      const eatenPawnPos = new Position(this.enPassantColIndex, oldPos.y);
      eatenPiece = this.getPieceByPos(eatenPawnPos);
      this.setPieceByPos('', eatenPawnPos);
    }

    // if move is a castling (king moving two squares), move the rook too
    if (movingType === 'king' && Math.abs(newPos.x - oldPos.x) === 2) {
      const isKingSide = newPos.x > oldPos.x;
      const rookOldPos = new Position(isKingSide ? 7 : 0, oldPos.y);
      const rookNewPos = new Position(isKingSide ? 5 : 3, oldPos.y);
      this.setPieceByPos(this.getPieceByPos(rookOldPos), rookNewPos);
      this.setPieceByPos('', rookOldPos);
    }

    this.updateCastlingRights(oldPos, newPos);

    // register column for possible en passant
    if (movingType === 'pawn' && Math.abs(oldPos.y - newPos.y) === 2) {
      this.enPassantColIndex = oldPos.x;
    } else {
      this.enPassantColIndex = -1; // reseting en passant possibility
    }
    return eatenPiece;
  }

  /**
   * Any move starting from or landing on a king/rook initial square
   * (king or rook moved, or rook captured) removes the matching castling rights.
   */
  private updateCastlingRights(oldPos: Position, newPos: Position): void {
    for (const pos of [oldPos, newPos]) {
      if (pos.y === 0) {
        if (pos.x === 0 || pos.x === 4)
          this.castlingRights.whiteQueenSide = false;
        if (pos.x === 7 || pos.x === 4)
          this.castlingRights.whiteKingSide = false;
      } else if (pos.y === 7) {
        if (pos.x === 0 || pos.x === 4)
          this.castlingRights.blackQueenSide = false;
        if (pos.x === 7 || pos.x === 4)
          this.castlingRights.blackKingSide = false;
      }
    }
  }

  canCastle(color: Color, kingSide: boolean): boolean {
    if (color === 'white') {
      return kingSide
        ? this.castlingRights.whiteKingSide
        : this.castlingRights.whiteQueenSide;
    }
    return kingSide
      ? this.castlingRights.blackKingSide
      : this.castlingRights.blackQueenSide;
  }

  public getCastlingRights(): CastlingRights {
    return this.castlingRights;
  }

  public setCastlingRights(value: CastlingRights) {
    this.castlingRights = value;
  }

  /**
   * Independent copy of the board state (pieces, turn, en passant, castling rights).
   * The stateless ChessUtilsService is shared, not copied.
   */
  clone(): Chessboard {
    const copy = new Chessboard(this.chessUtilsService);
    copy.pieces = this.pieces.map(row => [...row]);
    copy.isWhiteTurn = this.isWhiteTurn;
    copy.enPassantColIndex = this.enPassantColIndex;
    copy.castlingRights = { ...this.castlingRights };
    return copy;
  }

  getCurrentPlayerColor(): Color {
    return this.isWhiteTurn ? 'white' : 'black';
  }

  getNextPlayerColor(): Color {
    return this.isWhiteTurn ? 'black' : 'white';
  }

  getPieceColorByPos(position: Position): Color | null {
    return this.chessUtilsService.getColor(this.getPieceByPos(position));
  }

  getPieceTypeByPos(position: Position): PieceType | null {
    return this.chessUtilsService.getType(this.getPieceByPos(position));
  }

  getPiece(x: number, y: number): Square {
    return this.pieces[y][x];
  }

  setPiece(square: Square, x: number, y: number) {
    this.pieces[y][x] = square;
  }

  getPieceByPos(position: Position): Square {
    return this.getPiece(position.x, position.y);
  }

  setPieceByPos(square: Square, position: Position) {
    this.setPiece(square, position.x, position.y);
  }

  findPiecePosition(pieceName: PieceName): Position | null {
    for (let row = 0; row < this.pieces.length; row++) {
      const col = this.pieces[row].findIndex(value => value === pieceName);
      if (col !== -1) {
        return new Position(col, row);
      }
    }
    return null;
  }

  private initializeChessBoard(): void {
    for (let y = 0; y < Chessboard.BOARD_SIZE; y++) {
      this.pieces[y] = [];
      for (let x = 0; x < Chessboard.BOARD_SIZE; x++) {
        this.pieces[y][x] = this.chessUtilsService.getInitialChessPiece(y, x);
      }
    }
  }

  public getPieces(): Square[][] {
    return this.pieces;
  }

  public setPieces(value: Square[][]) {
    this.pieces = value;
  }

  public getIsWhiteTurn(): boolean {
    return this.isWhiteTurn;
  }

  public setIsWhiteTurn(value: boolean) {
    this.isWhiteTurn = value;
  }

  public getEnPassantColIndex(): number {
    return this.enPassantColIndex;
  }

  public setEnPassantColIndex(value: number) {
    this.enPassantColIndex = value;
  }

  toggleIsWhiteTurn(): void {
    this.isWhiteTurn = !this.isWhiteTurn;
  }
}
