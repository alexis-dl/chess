package com.chess.entities;

import java.util.ArrayList;
import java.util.List;

import com.chess.enums.PieceColor;
import com.chess.enums.PieceType;

import lombok.Data;

@Data
public class ChessBoard {
    private static final int BOARD_LENGTH = 8;
    private List<Piece> pieces = new ArrayList<Piece>();

    public ChessBoard() {
        pieces.add(new Piece(PieceType.ROOK, PieceColor.WHITE, 1, 1));
        pieces.add(new Piece(PieceType.KNIGHT, PieceColor.WHITE, 2, 1));
        pieces.add(new Piece(PieceType.BISHOP, PieceColor.WHITE, 3, 1));
        pieces.add(new Piece(PieceType.QUEEN, PieceColor.WHITE, 4, 1));
        pieces.add(new Piece(PieceType.KING, PieceColor.WHITE, 5, 1));
        pieces.add(new Piece(PieceType.BISHOP, PieceColor.WHITE, 6, 1));
        pieces.add(new Piece(PieceType.KNIGHT, PieceColor.WHITE, 7, 1));
        pieces.add(new Piece(PieceType.ROOK, PieceColor.WHITE, 8, 1));
        for (int x = 1; x <= BOARD_LENGTH; x++) {
            pieces.add(new Piece(PieceType.PAWN, PieceColor.WHITE, x, 2));
            pieces.add(new Piece(PieceType.PAWN, PieceColor.BLACK, x, 7));
        }
        pieces.add(new Piece(PieceType.ROOK, PieceColor.BLACK, 1, 8));
        pieces.add(new Piece(PieceType.KNIGHT, PieceColor.BLACK, 2, 8));
        pieces.add(new Piece(PieceType.BISHOP, PieceColor.BLACK, 3, 8));
        pieces.add(new Piece(PieceType.QUEEN, PieceColor.BLACK, 4, 8));
        pieces.add(new Piece(PieceType.KING, PieceColor.BLACK, 5, 8));
        pieces.add(new Piece(PieceType.BISHOP, PieceColor.BLACK, 6, 8));
        pieces.add(new Piece(PieceType.KNIGHT, PieceColor.BLACK, 7, 8));
        pieces.add(new Piece(PieceType.ROOK, PieceColor.BLACK, 8, 8));
    }

    public Piece getPiece(int x, int y) {
        for (Piece piece : pieces) {
            if (piece.getX() == x && piece.getY() == y) {
                return piece;
            }
        }
        return null;
    }
}
