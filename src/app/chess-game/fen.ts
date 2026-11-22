import { BoardState } from './chessboard.model';
import { Color, PieceType, Square } from './piece.model';

const FEN_PIECES: Record<string, PieceType> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};

export interface FenPosition {
  state: BoardState;
  /** Move number of the next move, from the last FEN field. */
  fullmoveNumber: number;
}

/**
 * Parse a position in Forsyth-Edwards Notation, e.g.
 * 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'.
 * @throws Error when the FEN is malformed.
 */
export function parseFen(fen: string): FenPosition {
  const [placement, turn, castling = '-', enPassant = '-', halfmove, fullmove] =
    fen.trim().split(/\s+/);
  const ranks = placement?.split('/') ?? [];
  if (ranks.length !== 8 || (turn !== 'w' && turn !== 'b')) {
    throw new Error(`Invalid FEN: ${fen}`);
  }

  // FEN lists rank 8 first; pieces[0] is rank 1
  const pieces: Square[][] = ranks
    .map(rank => {
      const row: Square[] = [];
      for (const char of rank) {
        if (/[1-8]/.test(char)) {
          row.push(...Array<Square>(+char).fill(''));
        } else {
          const type = FEN_PIECES[char.toLowerCase()];
          if (!type) {
            throw new Error(`Invalid FEN piece '${char}': ${fen}`);
          }
          const color: Color = char === char.toUpperCase() ? 'white' : 'black';
          row.push(`${color}-${type}`);
        }
      }
      if (row.length !== 8) {
        throw new Error(`Invalid FEN rank '${rank}': ${fen}`);
      }
      return row;
    })
    .reverse();

  return {
    state: {
      pieces,
      isWhiteTurn: turn === 'w',
      enPassantColIndex:
        enPassant === '-' ? -1 : enPassant.charCodeAt(0) - 'a'.charCodeAt(0),
      castlingRights: {
        whiteKingSide: castling.includes('K'),
        whiteQueenSide: castling.includes('Q'),
        blackKingSide: castling.includes('k'),
        blackQueenSide: castling.includes('q'),
      },
      halfmoveClock: Number(halfmove) || 0,
    },
    fullmoveNumber: Number(fullmove) || 1,
  };
}

const FEN_LETTERS: Record<PieceType, string> = {
  pawn: 'p',
  knight: 'n',
  bishop: 'b',
  rook: 'r',
  queen: 'q',
  king: 'k',
};

/** Inverse of parseFen. */
export function toFen(state: BoardState, fullmoveNumber = 1): string {
  const placement = [...state.pieces]
    .reverse() // FEN lists rank 8 first
    .map(row => {
      let rank = '';
      let empty = 0;
      for (const square of row) {
        if (!square) {
          empty++;
          continue;
        }
        if (empty) {
          rank += empty;
          empty = 0;
        }
        const [color, type] = square.split('-') as [Color, PieceType];
        const letter = FEN_LETTERS[type];
        rank += color === 'white' ? letter.toUpperCase() : letter;
      }
      return empty ? rank + empty : rank;
    })
    .join('/');

  const rights = state.castlingRights;
  const castling =
    [
      rights.whiteKingSide ? 'K' : '',
      rights.whiteQueenSide ? 'Q' : '',
      rights.blackKingSide ? 'k' : '',
      rights.blackQueenSide ? 'q' : '',
    ].join('') || '-';

  // the en passant target is behind the pawn that just moved two squares
  const enPassant =
    state.enPassantColIndex < 0
      ? '-'
      : String.fromCharCode('a'.charCodeAt(0) + state.enPassantColIndex) +
        (state.isWhiteTurn ? '6' : '3');

  return [
    placement,
    state.isWhiteTurn ? 'w' : 'b',
    castling,
    enPassant,
    state.halfmoveClock,
    fullmoveNumber,
  ].join(' ');
}
