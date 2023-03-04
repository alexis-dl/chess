package com.chess.entities;

import com.chess.enums.PieceColor;
import com.chess.enums.PieceType;

import lombok.Data;

@Data
public class Piece {

    private PieceType type;
    private PieceColor color;
    private int x;
    private int y;

    public Piece(PieceType type, PieceColor color, int x, int y) {
        this.color = color;
        this.type = type;
        this.x = x;
        this.y = y;

    }
}
