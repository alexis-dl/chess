package com.chess;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import com.chess.config.TestConfig;
import com.chess.entities.ChessBoard;
import com.chess.entities.Square;
import com.chess.service.RulesService;

@ContextConfiguration(classes = TestConfig.class)
@ExtendWith(SpringExtension.class)
public class RulesServiceTest {
    @Autowired
    RulesService rulesService;
    @Autowired
    ChessBoard chessBoard;

    @Test
    void testGetAvailableSquaresforWhiteRook() {
        List<Square> availableSquares = rulesService.getAvailableSquares(chessBoard.getPiece(1, 1));
        assertEquals(0, availableSquares.size());
    }

    @Test
    void testGetAvailableSquaresforWhiteKnight() {
        List<Square> availableSquares = rulesService.getAvailableSquares(chessBoard.getPiece(2, 1));
        assertEquals(2, availableSquares.size());
        assertEquals(new Square(1, 3), availableSquares.get(0));
        assertEquals(new Square(3, 3), availableSquares.get(1));
    }

    @Test
    void testGetAvailableSquaresforWhiteBishop() {
        List<Square> availableSquares = rulesService.getAvailableSquares(chessBoard.getPiece(3, 1));
        assertEquals(0, availableSquares.size());
    }

    @Test
    void testGetAvailableSquaresforWhiteQueen() {
        List<Square> availableSquares = rulesService.getAvailableSquares(chessBoard.getPiece(4, 1));
        assertEquals(0, availableSquares.size());
    }

    @Test
    void testGetAvailableSquaresforWhiteKing() {
        List<Square> availableSquares = rulesService.getAvailableSquares(chessBoard.getPiece(5, 1));
        assertEquals(0, availableSquares.size());
    }

    @Test
    void testGetAvailableSquaresforWhitePawn() {
        List<Square> availableSquares = rulesService.getAvailableSquares(chessBoard.getPiece(1, 2));
        assertEquals(2, availableSquares.size());
        assertEquals(new Square(1, 3), availableSquares.get(0));
        assertEquals(new Square(1, 4), availableSquares.get(1));
    }

    // TODO : Tests For En Passant & isKingInCheck
}
