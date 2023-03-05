package com.chess.entities;

import com.chess.enums.PieceColor;
import com.chess.enums.PieceType;

import lombok.Data;

@Data
public class Piece {

    private PieceType type;
    private PieceColor color;
    private Square square;

    public Piece(PieceType type, PieceColor color, int x, int y) {
        this.color = color;
        this.type = type;
        this.square = new Square(x, y);
    }

    public int getX() {
        return square.getX();
    }

    public int getY() {
        return square.getY();
    }
}
