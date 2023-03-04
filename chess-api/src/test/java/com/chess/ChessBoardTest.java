package com.chess;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

public class ChessBoardTest {
    @Test
    void initChessBoardTest() {
        ChessBoard board = new ChessBoard();
        assertEquals(PieceType.QUEEN, board.getPiece(4, 1).getType());
        assertEquals(PieceColor.WHITE, board.getPiece(4, 1).getColor());
        assertEquals(PieceType.QUEEN, board.getPiece(4, 8).getType());
        assertEquals(PieceColor.BLACK, board.getPiece(4, 8).getColor());
        assertNull(board.getPiece(4, 4));
    }
}
