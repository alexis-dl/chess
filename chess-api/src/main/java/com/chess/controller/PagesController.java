package com.chess.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.chess.entities.ChessBoard;

@Controller
public class PagesController {

    @Autowired
    private ChessBoard chessboard;

    @GetMapping("/chess")
    public String getChessBoard(Model model) {
        model.addAttribute("pieces", chessboard);
        return "chessboard";
    }

    @GetMapping("/image")
    public String getImage(Model model) {
        model.addAttribute("pieces", chessboard.getPieces());
        return "image";
    }
}
