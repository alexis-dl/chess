package com.chess.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chess.entities.ChessBoard;
import com.chess.entities.Piece;

@RestController
@RequestMapping("/chessboard")
public class BoardController {

    @Autowired
    private ChessBoard board;

    @GetMapping
    public List<Piece> GetChessBoard() {
        return board.getPieces();
    }
}
