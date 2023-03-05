package com.chess.entities;

import lombok.Data;

@Data
public class Square {
    private int x;
    private int y;

    public Square(int x, int y) {
        this.x = x;
        this.y = y;
    }
}
