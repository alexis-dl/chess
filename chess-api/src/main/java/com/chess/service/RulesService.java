package com.chess.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.chess.entities.ChessBoard;
import com.chess.entities.Piece;
import com.chess.entities.Square;
import com.chess.enums.PieceColor;

@Service
public class RulesService {

    @Autowired
    ChessBoard board;

    public List<Square> getAvailableSquares(Piece piece) {
        List<Square> pieceRange = getPieceRange(piece);
        // TODO check our king is not in check after moving the piece
        // simuler le mouvement de la pièce et appeller la methode isKingInCheck()
        return pieceRange;
    }

    /**
     * Get the piece range without considering that our king can be checked
     * 
     * @param piece
     * @return squares in the range of the piece
     */
    private List<Square> getPieceRange(Piece piece) {
        List<Square> range = new ArrayList<>();
        switch (piece.getType()) {
            case PAWN:
                if (PieceColor.WHITE.equals(piece.getColor())
                        && !isPieceOnSquare(new Square(piece.getX(), piece.getY() + 1))) {
                    range.add(new Square(piece.getX(), piece.getY() + 1));
                    if (piece.getY() == 2 && !isPieceOnSquare(new Square(piece.getX(), piece.getY() + 2))) {
                        range.add(new Square(piece.getX(), piece.getY() + 2));
                    }
                } else if (PieceColor.BLACK.equals(piece.getColor())
                        && !isPieceOnSquare(new Square(piece.getX(), piece.getY() - 1))) {
                    range.add(new Square(piece.getX(), piece.getY() - 1));
                    if (piece.getY() == 7 && !isPieceOnSquare(new Square(piece.getX(), piece.getY() - 2))) {
                        range.add(new Square(piece.getX(), piece.getY() - 2));
                    }
                }
                // TODO : Add En Passant

                break;

            case KNIGHT:
                range.add(new Square(piece.getX() - 2, piece.getY() - 1));
                range.add(new Square(piece.getX() - 2, piece.getY() + 1));
                range.add(new Square(piece.getX() - 1, piece.getY() - 2));
                range.add(new Square(piece.getX() - 1, piece.getY() + 2));
                range.add(new Square(piece.getX() + 1, piece.getY() - 2));
                range.add(new Square(piece.getX() + 1, piece.getY() + 2));
                range.add(new Square(piece.getX() + 2, piece.getY() - 1));
                range.add(new Square(piece.getX() + 2, piece.getY() + 1));
                break;

            case KING:
                range.add(new Square(piece.getX() + 1, piece.getY() - 1));
                range.add(new Square(piece.getX() + 1, piece.getY()));
                range.add(new Square(piece.getX() + 1, piece.getY() + 1));
                range.add(new Square(piece.getX() - 1, piece.getY() - 1));
                range.add(new Square(piece.getX() - 1, piece.getY()));
                range.add(new Square(piece.getX() - 1, piece.getY() + 1));
                range.add(new Square(piece.getX(), piece.getY() - 1));
                range.add(new Square(piece.getX(), piece.getY() + 1));
                break;

            case BISHOP:
                // go in every direction until an obstacle is encountered
                for (int i = 1; i <= 7; i++) {
                    range.add(new Square(piece.getX() + i, piece.getY() + i));
                    if (isPieceOnSquare(new Square(piece.getX() + i, piece.getY() + i))) {
                        break;
                    }
                }
                for (int i = 1; i <= 7; i++) {
                    range.add(new Square(piece.getX() + i, piece.getY() - i));
                    if (isPieceOnSquare(new Square(piece.getX() + i, piece.getY() - i))) {
                        break;
                    }
                }
                for (int i = 1; i <= 7; i++) {
                    range.add(new Square(piece.getX() - i, piece.getY() + i));
                    if (isPieceOnSquare(new Square(piece.getX() - i, piece.getY() + i))) {
                        break;
                    }
                }
                for (int i = 1; i <= 7; i++) {
                    range.add(new Square(piece.getX() - i, piece.getY() - i));
                    if (isPieceOnSquare(new Square(piece.getX() - i, piece.getY() - i))) {
                        break;
                    }
                }
                break;

            case ROOK:
                // go in every direction until an obstacle is encountered
                for (int i = 1; i <= 7; i++) {
                    range.add(new Square(piece.getX() + i, piece.getY()));
                    if (isPieceOnSquare(new Square(piece.getX() + i, piece.getY()))) {
                        break;
                    }
                }
                for (int i = 1; i <= 7; i++) {
                    range.add(new Square(piece.getX() - i, piece.getY()));
                    if (isPieceOnSquare(new Square(piece.getX() - i, piece.getY()))) {
                        break;
                    }
                }
                for (int i = 1; i <= 7; i++) {
                    range.add(new Square(piece.getX(), piece.getY() + i));
                    if (isPieceOnSquare(new Square(piece.getX(), piece.getY() + i))) {
                        break;
                    }
                }
                for (int i = 1; i <= 7; i++) {
                    range.add(new Square(piece.getX(), piece.getY() - i));
                    if (isPieceOnSquare(new Square(piece.getX(), piece.getY() - i))) {
                        break;
                    }
                }
                break;

            case QUEEN:
                // combination of BISHOP & ROOK range
                for (int i = 1; i <= 7; i++) {
                    range.add(new Square(piece.getX() + i, piece.getY() + i));
                    if (isPieceOnSquare(new Square(piece.getX() + i, piece.getY() + i))) {
                        break;
                    }
                }
                for (int i = 1; i <= 7; i++) {
                    range.add(new Square(piece.getX() + i, piece.getY() - i));
                    if (isPieceOnSquare(new Square(piece.getX() + i, piece.getY() - i))) {
                        break;
                    }
                }
                for (int i = 1; i <= 7; i++) {
                    range.add(new Square(piece.getX() - i, piece.getY() + i));
                    if (isPieceOnSquare(new Square(piece.getX() - i, piece.getY() + i))) {
                        break;
                    }
                }
                for (int i = 1; i <= 7; i++) {
                    range.add(new Square(piece.getX() - i, piece.getY() - i));
                    if (isPieceOnSquare(new Square(piece.getX() - i, piece.getY() - i))) {
                        break;
                    }
                }
                for (int i = 1; i <= 7; i++) {
                    range.add(new Square(piece.getX() + i, piece.getY()));
                    if (isPieceOnSquare(new Square(piece.getX() + i, piece.getY()))) {
                        break;
                    }
                }
                for (int i = 1; i <= 7; i++) {
                    range.add(new Square(piece.getX() - i, piece.getY()));
                    if (isPieceOnSquare(new Square(piece.getX() - i, piece.getY()))) {
                        break;
                    }
                }
                for (int i = 1; i <= 7; i++) {
                    range.add(new Square(piece.getX(), piece.getY() + i));
                    if (isPieceOnSquare(new Square(piece.getX(), piece.getY() + i))) {
                        break;
                    }
                }
                for (int i = 1; i <= 7; i++) {
                    range.add(new Square(piece.getX(), piece.getY() - i));
                    if (isPieceOnSquare(new Square(piece.getX(), piece.getY() - i))) {
                        break;
                    }
                }
                break;

            default:
                break;
        }
        removeOutOfTheBoardSquares(range); // we can't go out of the board
        removeSquaresWithSamePieceColor(range, piece.getColor()); // we can't take our own piece

        return range;
    }

    private void removeOutOfTheBoardSquares(List<Square> range) {
        List<Square> squaresToRemove = new ArrayList<>();
        for (Square square : range) {
            if (square.getX() > 8 || square.getY() > 8 || square.getX() < 1 || square.getY() < 1) {
                squaresToRemove.add(square);
            }
        }
        range.removeAll(squaresToRemove);
    }

    private void removeSquaresWithSamePieceColor(List<Square> range, PieceColor color) {
        List<Square> squaresToRemove = new ArrayList<>();
        for (Square square : range) {
            Piece target = board.getPiece(square);
            if (target != null && color.equals(target.getColor())) {
                squaresToRemove.add(square);
            }
        }
        range.removeAll(squaresToRemove);
    }

    private boolean isPieceOnSquare(Square square) {
        return board.getPiece(square) != null;
    }
}
