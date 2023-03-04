package com.chess;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class ChessBoard {
    private static final int BOARD_LENGTH = 8;
    private List<Piece> pieces = new ArrayList<Piece>();

    public ChessBoard() {
        pieces.add(new Piece(PieceType.ROOK, 1, 1));
        pieces.add(new Piece(PieceType.KNIGHT, 2, 1));
        pieces.add(new Piece(PieceType.BISHOP, 3, 1));
        pieces.add(new Piece(PieceType.QUEEN, 4, 1));
        pieces.add(new Piece(PieceType.KING, 5, 1));
        pieces.add(new Piece(PieceType.BISHOP, 6, 1));
        pieces.add(new Piece(PieceType.KNIGHT, 7, 1));
        pieces.add(new Piece(PieceType.ROOK, 8, 1));
        for (int x = 1; x <= BOARD_LENGTH; x++) {
            pieces.add(new Piece(PieceType.PAWN, x, 2));
            pieces.add(new Piece(PieceType.PAWN, x, 7));
        }
        pieces.add(new Piece(PieceType.ROOK, 1, 8));
        pieces.add(new Piece(PieceType.KNIGHT, 2, 8));
        pieces.add(new Piece(PieceType.BISHOP, 3, 8));
        pieces.add(new Piece(PieceType.QUEEN, 4, 8));
        pieces.add(new Piece(PieceType.KING, 5, 8));
        pieces.add(new Piece(PieceType.BISHOP, 6, 8));
        pieces.add(new Piece(PieceType.KNIGHT, 7, 8));
        pieces.add(new Piece(PieceType.ROOK, 8, 8));
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
