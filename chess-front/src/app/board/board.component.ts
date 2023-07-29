import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent {
  isSelected(row: number, col: number) {
    return (row == 4 && col == 2);
  }

  getSquareColor(row: number, col: number) {
    return (row + col) % 2 == 0 ? 'square light' : 'square dark';
  }


  apiData: any;

  private boardUrl = "http://127.0.0.1:8080";  // URL to board api
  // ça serait bien d'avoir une api qui envoie la pièce d'une case donnée :)

  constructor(
    private http: HttpClient) {
    this.getData();

  }

  getPiece(row: number, col: number): string {
    const piece = this.apiData.find((p: { square: { x: number; y: number; }; }) => p.square.x === col && p.square.y === row);
    if (piece) {
      return `${piece.color.toLowerCase()}-${piece.type.toLowerCase()}`;
    } else {
      return "";
    }
  }

  getData() {
    const url = `${this.boardUrl}/chessboard`;
    this.http.get<any>(url).subscribe(data => {
      this.apiData = data;
    });
  }
}
