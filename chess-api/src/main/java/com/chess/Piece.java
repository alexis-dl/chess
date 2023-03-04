package com.chess;

import lombok.Data;

@Data
public class Piece {

    private PieceType type;
    private int x;
    private int y;

    public Piece(PieceType type, int x, int y) {
        this.type = type;
        this.x = x;
        this.y = y;

    }
}
