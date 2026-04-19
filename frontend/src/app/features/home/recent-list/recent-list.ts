import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game } from '../../../core/models/game';

@Component({
  selector: 'app-recent-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-list.html',
  styleUrl: './recent-list.css',
})
export class RecentList {

  @Input() games: Game[] = [];

  getEngineDisplay(game: Game): string {
    if (!game.engine) {
      return 'Unknown Engine';
    }
    return `${game.engine.name} ${game.engine.version ?? ''}`.trim();
  }
}
 