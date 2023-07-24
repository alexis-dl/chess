package com.chess.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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

    @CrossOrigin(origins = "http://localhost:42000")
    @GetMapping
    public List<Piece> getChessBoard() {
        return board.getPieces();
    }

    @GetMapping("/availableSquares/{x}/{y}")
    public List<Square> getAvailableSquares(@PathVariable int x, @PathVariable int y) {
        return rulesService.getAvailableSquares(board.getPiece(x, y));
    }

    @PostMapping("/movePiece/{fromX}/{fromY}/{toX}/{toY}")
    public void movePiece(@PathVariable int fromX, @PathVariable int fromY, @PathVariable int toX,
            @PathVariable int toY) throws Exception {
        rulesService.movePiece(new Square(fromX, fromY), new Square(toX, toY));
    }
}
