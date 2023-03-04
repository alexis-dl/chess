package com.chess;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Arrays;

import org.junit.jupiter.api.Test;

public class ChessBoardTest {
    @Test
    void createBoardTest() {
        ChessBoard board = new ChessBoard();
        Piece piece = new Piece(PieceType.KING, 0, 0);
        board.setPieces(Arrays.asList(piece));
        assertTrue(board.getPieces().get(0).getType().equals(PieceType.KING));
    }
}
