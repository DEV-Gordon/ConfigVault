import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Game } from '../../../core/models/game';

@Component({
  selector: 'app-trending-grid',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './trending-grid.html',
  styleUrl: './trending-grid.css',
})
export class TrendingGrid {
  @Input() games: Game[] = [];
}
