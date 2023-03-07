package com.chess;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
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

    @BeforeEach
    void init() {
        rulesService = new RulesService();
    }

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
        // TODO fix same board for all tests
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

    @Test
    void testMovePieceForBlackQueenThrows() throws Exception {
        Square s1 = new Square(4, 8);
        Square s2 = new Square(4, 4);

        assertThrows(Exception.class, () -> rulesService.movePiece(s1, s2));
    }

    @Test
    void testMovePieceForWhitePawn() throws Exception {
        Square s1 = new Square(2, 2);
        Square s2 = new Square(2, 3);

        rulesService.movePiece(s1, s2);
        assertFalse(chessBoard.hasPiece(s1));
        assertTrue(chessBoard.hasPiece(s2));

    }
    // TODO : Tests For En Passant & isKingInCheck
}
