import { Component } from '@angular/core';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent {
  getSquareColor(row: number, col: number) {
    return (row + col) % 2 == 0 ? 'square light' : 'square dark';
  }
}
