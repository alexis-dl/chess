package com.chess;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

public class ChessBoardTest {
    @Test
    void initChessBoardTest() {
        ChessBoard board = new ChessBoard();
        assertEquals(PieceType.QUEEN, board.getPiece(4, 1).getType());
        assertNull(board.getPiece(4, 4));
    }
}
