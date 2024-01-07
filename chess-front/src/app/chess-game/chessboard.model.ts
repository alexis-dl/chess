import { ChessUtilsService } from './chess-utils.service';
import { Position } from './position.model';

export class Chessboard {
  static readonly BOARD_SIZE = 8;

  private pieces: string[][] = [];
  private isWhiteTurn: boolean = true;
  private enPassantColIndex: number = -1;

  constructor(private chessUtilsService: ChessUtilsService) {
    this.initializeChessBoard();
  }

  /**
   * Move the piece from Position A to Position B without verification of validity.
   * @returns the eaten piece if there is one.
   */
  movePiece(oldPos: Position, newPos: Position): string {
    const movingPiece = this.getPieceByPos(oldPos);
    let eatenPiece = this.getPieceByPos(newPos);
    const isPieceAPawn = this.chessUtilsService.isPawn(movingPiece);

    // move and eat piece
    this.setPieceByPos('', oldPos);
    this.setPieceByPos(movingPiece, newPos);

    // if move is en passant, eat piece in diagonal
    const isWhitePawn = movingPiece === 'white-pawn';
    const isBlackPawn = movingPiece === 'black-pawn';
    if (
      ((isWhitePawn && oldPos.y === 4) || (isBlackPawn && oldPos.y === 3)) &&
      newPos.x === this.getEnPassantColIndex()
    ) {
      const eatenPawnPos = new Position(this.getEnPassantColIndex(), oldPos.y);
      eatenPiece = this.getPieceByPos(eatenPawnPos);
      this.setPieceByPos('', eatenPawnPos);
    }

    // register column for possible en passant
    if (isPieceAPawn && Math.abs(oldPos.y - newPos.y) === 2) {
      this.setEnPassantColIndex(oldPos.x);
    } else {
      this.setEnPassantColIndex(-1); // reseting en passant possibility
    }
    return eatenPiece;
  }

  getPlayerPiecesByColor(pieceColor: string): string[][] {
    // we put opposite player's pieces to ''
    return this.pieces.map(row =>
      row.map(pieceName =>
        this.chessUtilsService.getColor(pieceName) === pieceColor
          ? pieceName
          : ''
      )
    );
  }

  getCurrentPlayerColor(): string {
    return this.isWhiteTurn ? 'white' : 'black';
  }

  getNextPlayerColor(): string {
    return this.isWhiteTurn ? 'black' : 'white';
  }

  getPieceColorByPos(position: Position): string {
    return this.chessUtilsService.getColor(this.getPieceByPos(position));
  }

  getPieceColor(x: number, y: number): string {
    return this.chessUtilsService.getColor(this.getPiece(x, y));
  }

  // y is row and x column
  getPiece(x: number, y: number): string {
    return this.pieces[y][x];
  }

  setPiece(pieceName: string, x: number, y: number) {
    this.pieces[y][x] = pieceName;
  }

  getPieceByPos(position: Position): string {
    return this.getPiece(position.x, position.y);
  }

  setPieceByPos(pieceName: string, position: Position) {
    this.setPiece(pieceName, position.x, position.y);
  }

  findPiecePosition(pieceName: string): Position | null {
    for (let row = 0; row < this.pieces.length; row++) {
      const col = this.pieces[row].findIndex(value => value === pieceName);
      if (col !== -1) {
        return new Position(col, row);
      }
    }
    return null; // Element not found, but shouldn't happen
  }

  private initializeChessBoard(): void {
    for (let i = 0; i < 8; i++) {
      this.pieces[i] = [];
      for (let j = 0; j < 8; j++) {
        // Initial chess pieces setup can be adjusted based on your needs
        this.pieces[i][j] = this.chessUtilsService.getInitialChessPiece(i, j);
      }
    }
  }

  /**
   * Getter pieces
   * @return {string[][] }
   */
  public getPieces(): string[][] {
    return this.pieces;
  }

  /**
   * Getter isWhiteTurn
   * @return {boolean }
   */
  public getIsWhiteTurn(): boolean {
    return this.isWhiteTurn;
  }

  /**
   * Getter enPassantColIndex
   * @return {number }
   */
  public getEnPassantColIndex(): number {
    return this.enPassantColIndex;
  }

  /**
   * Setter pieces
   * @param {string[][] } value
   */
  public setPieces(value: string[][]) {
    this.pieces = value;
  }

  /**
   * Setter isWhiteTurn
   * @param {boolean } value
   */
  public setIsWhiteTurn(value: boolean) {
    this.isWhiteTurn = value;
  }

  /**
   * Setter enPassantColIndex
   * @param {number } value
   */
  public setEnPassantColIndex(value: number) {
    this.enPassantColIndex = value;
  }

  toggleIsWhiteTurn(): void {
    this.isWhiteTurn = !this.isWhiteTurn;
  }
}
