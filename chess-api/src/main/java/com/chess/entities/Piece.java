package com.chess.entities;

import com.chess.enums.PieceColor;
import com.chess.enums.PieceType;

import lombok.Data;

@Data
public class Piece {

    private PieceType type;
    private PieceColor color;
    private Square square;

    public Piece(PieceType type, PieceColor color, Square square) {
        this.type = type;
        this.color = color;
        this.square = square;
    }

    public int getX() {
        return square.getX();
    }

    public int getY() {
        return square.getY();
    }
}
