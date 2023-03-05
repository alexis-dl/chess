package com.chess.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.chess.entities.ChessBoard;
import com.chess.service.RulesService;

@Configuration
public class TestConfig {
    @Bean
    public RulesService rulesService() {
        return new RulesService();
    }

    @Bean
    public ChessBoard chessBoard() {
        return new ChessBoard();
    }
}