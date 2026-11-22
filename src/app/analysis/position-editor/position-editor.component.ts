import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ChessUtilsService } from 'src/app/chess-game/chess-utils.service';
import {
  BoardState,
  CastlingRights,
  Chessboard,
} from 'src/app/chess-game/chessboard.model';
import { parseFen, toFen } from 'src/app/chess-game/fen';
import {
  Color,
  PieceName,
  PieceType,
  Square,
  toPieceName,
} from 'src/app/chess-game/piece.model';
import { RulesService } from 'src/app/chess-game/rules.service';
import { TranslationKey } from 'src/app/i18n/translations';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const PALETTE_TYPES: PieceType[] = [
  'king',
  'queen',
  'rook',
  'bishop',
  'knight',
  'pawn',
];

type CastlingRight = keyof CastlingRights;

/** Squares the king and the rook must stand on for each castling right. */
const CASTLING_SQUARES: Record<
  CastlingRight,
  { king: [number, number]; rook: [number, number]; color: Color }
> = {
  whiteKingSide: { king: [4, 0], rook: [7, 0], color: 'white' },
  whiteQueenSide: { king: [4, 0], rook: [0, 0], color: 'white' },
  blackKingSide: { king: [4, 7], rook: [7, 7], color: 'black' },
  blackQueenSide: { king: [4, 7], rook: [0, 7], color: 'black' },
};

/** Set up any position: place pieces, choose the side to move and castling. */
@Component({
  selector: 'app-position-editor',
  templateUrl: './position-editor.component.html',
  styleUrls: ['./position-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PositionEditorComponent implements OnInit {
  /** Position to start editing from. */
  @Input() fen = INITIAL_FEN;
  @Input() orientation: Color = 'white';
  /** FEN of the position, once valid. */
  @Output() applied = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  readonly colors: Color[] = ['white', 'black'];
  readonly palette: Record<Color, PieceName[]> = {
    white: PALETTE_TYPES.map(type => toPieceName('white', type)),
    black: PALETTE_TYPES.map(type => toPieceName('black', type)),
  };
  readonly castlingRights: { right: CastlingRight; label: TranslationKey }[] =
    [
      { right: 'whiteKingSide', label: 'analysis.editor.whiteOO' },
      { right: 'whiteQueenSide', label: 'analysis.editor.whiteOOO' },
      { right: 'blackKingSide', label: 'analysis.editor.blackOO' },
      { right: 'blackQueenSide', label: 'analysis.editor.blackOOO' },
    ];

  /** pieces[y][x], y = 0 for rank 1. */
  pieces: Square[][] = [];
  whiteToMove = true;
  castling: CastlingRights = {
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true,
  };
  /** Piece placed by a click, or null to erase. */
  selected: PieceName | null = 'white-pawn';
  error: TranslationKey | null = null;

  constructor(
    private rulesService: RulesService,
    private chessUtilsService: ChessUtilsService
  ) {}

  ngOnInit(): void {
    this.load(this.fen);
  }

  /** Ranks from top to bottom, files from left to right, as displayed. */
  get rows(): number[] {
    return this.orientation === 'white'
      ? [7, 6, 5, 4, 3, 2, 1, 0]
      : [0, 1, 2, 3, 4, 5, 6, 7];
  }

  get columns(): number[] {
    return this.orientation === 'white'
      ? [0, 1, 2, 3, 4, 5, 6, 7]
      : [7, 6, 5, 4, 3, 2, 1, 0];
  }

  isLight(x: number, y: number): boolean {
    return (x + y) % 2 === 1;
  }

  imageOf(square: Square): string | null {
    return this.chessUtilsService.getPieceImagePath(square);
  }

  /** Put the selected piece, or remove the piece if it is the same one. */
  place(x: number, y: number): void {
    const current = this.pieces[y][x];
    this.pieces[y][x] =
      this.selected && current !== this.selected ? this.selected : '';
    this.error = null;
  }

  canCastle(right: CastlingRight): boolean {
    const { king, rook, color } = CASTLING_SQUARES[right];
    return (
      this.pieces[king[1]][king[0]] === toPieceName(color, 'king') &&
      this.pieces[rook[1]][rook[0]] === toPieceName(color, 'rook')
    );
  }

  startPosition(): void {
    this.load(INITIAL_FEN);
  }

  clear(): void {
    this.pieces = this.pieces.map(row => row.map(() => ''));
    this.error = null;
  }

  apply(): void {
    this.error = this.validate();
    if (!this.error) {
      this.applied.emit(toFen(this.state(), 1));
    }
  }

  private load(fen: string): void {
    const { state } = parseFen(fen);
    this.pieces = state.pieces.map(row => [...row]);
    this.whiteToMove = state.isWhiteTurn;
    this.castling = { ...state.castlingRights };
    this.error = null;
  }

  /** Castling rights are kept only where king and rook are in place. */
  private state(): BoardState {
    const castling = { ...this.castling };
    for (const right of Object.keys(castling) as CastlingRight[]) {
      castling[right] = castling[right] && this.canCastle(right);
    }
    return {
      pieces: this.pieces.map(row => [...row]),
      isWhiteTurn: this.whiteToMove,
      enPassantColIndex: -1,
      castlingRights: castling,
      halfmoveClock: 0,
    };
  }

  private validate(): TranslationKey | null {
    const count = (piece: PieceName) =>
      this.pieces.flat().filter(square => square === piece).length;
    if (count('white-king') !== 1 || count('black-king') !== 1) {
      return 'analysis.editor.kings';
    }
    const backRanks = [...this.pieces[0], ...this.pieces[7]];
    if (backRanks.some(square => square === 'white-pawn' || square === 'black-pawn')) {
      return 'analysis.editor.pawns';
    }
    // the side that just moved cannot have left its king in check
    const board = new Chessboard(this.chessUtilsService, {
      ...this.state(),
      isWhiteTurn: !this.whiteToMove,
    });
    if (this.rulesService.isInCheck(board)) {
      return 'analysis.editor.check';
    }
    return null;
  }
}
