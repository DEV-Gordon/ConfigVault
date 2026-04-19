import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Game } from '../../../core/models/game';

@Component({
  selector: 'app-trending-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trending-grid.html',
  styleUrl: './trending-grid.css',
})
export class TrendingGrid {
  @Input() games: Game[] = [];
}
