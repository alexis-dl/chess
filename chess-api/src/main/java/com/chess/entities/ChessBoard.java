package com.chess.entities;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.chess.enums.PieceColor;
import com.chess.enums.PieceType;

import lombok.Data;

@Data
@Component
public class ChessBoard {
    private static final int BOARD_LENGTH = 8;
    private List<Piece> pieces = new ArrayList<Piece>();

    public ChessBoard() {
        pieces.add(new Piece(PieceType.ROOK, PieceColor.WHITE, new Square(1, 1)));
        pieces.add(new Piece(PieceType.KNIGHT, PieceColor.WHITE, new Square(2, 1)));
        pieces.add(new Piece(PieceType.BISHOP, PieceColor.WHITE, new Square(3, 1)));
        pieces.add(new Piece(PieceType.QUEEN, PieceColor.WHITE, new Square(4, 1)));
        pieces.add(new Piece(PieceType.KING, PieceColor.WHITE, new Square(5, 1)));
        pieces.add(new Piece(PieceType.BISHOP, PieceColor.WHITE, new Square(6, 1)));
        pieces.add(new Piece(PieceType.KNIGHT, PieceColor.WHITE, new Square(7, 1)));
        pieces.add(new Piece(PieceType.ROOK, PieceColor.WHITE, new Square(8, 1)));
        for (int x = 1; x <= BOARD_LENGTH; x++) {
            pieces.add(new Piece(PieceType.PAWN, PieceColor.WHITE, new Square(x, 2)));
            pieces.add(new Piece(PieceType.PAWN, PieceColor.BLACK, new Square(x, 7)));
        }
        pieces.add(new Piece(PieceType.ROOK, PieceColor.BLACK, new Square(1, 8)));
        pieces.add(new Piece(PieceType.KNIGHT, PieceColor.BLACK, new Square(2, 8)));
        pieces.add(new Piece(PieceType.BISHOP, PieceColor.BLACK, new Square(3, 8)));
        pieces.add(new Piece(PieceType.QUEEN, PieceColor.BLACK, new Square(4, 8)));
        pieces.add(new Piece(PieceType.KING, PieceColor.BLACK, new Square(5, 8)));
        pieces.add(new Piece(PieceType.BISHOP, PieceColor.BLACK, new Square(6, 8)));
        pieces.add(new Piece(PieceType.KNIGHT, PieceColor.BLACK, new Square(7, 8)));
        pieces.add(new Piece(PieceType.ROOK, PieceColor.BLACK, new Square(8, 8)));
    }

    public Piece getPiece(Square square) {
        for (Piece piece : pieces) {
            if (piece.getSquare().equals(square)) {
                return piece;
            }
        }
        return null;
    }

    public Piece getPiece(int x, int y) {
        return getPiece(new Square(x, y));
    }
}