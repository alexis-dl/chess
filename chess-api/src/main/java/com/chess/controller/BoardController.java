package com.chess.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chess.entities.ChessBoard;
import com.chess.entities.Piece;
import com.chess.entities.Square;
import com.chess.service.RulesService;

@RestController
@RequestMapping("/chessboard")
public class BoardController {

    @Autowired
    private ChessBoard board;
    @Autowired
    private RulesService rulesService;

    @GetMapping
    public List<Piece> getChessBoard() {
        return board.getPieces();
    }

    @GetMapping("/availableSquares/{x}/{y}")
    public List<Square> getAvailableSquares(@PathVariable int x, @PathVariable int y) {
        return rulesService.getAvailableSquares(board.getPiece(x, y));
    }
}
