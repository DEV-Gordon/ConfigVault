import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Game } from '../../../core/models/game';

@Component({
  selector: 'app-recent-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-list.html',
  styleUrl: './recent-list.css',
})
export class RecentList {
  private router = inject(Router);

  @Input() games: Game[] = [];

  getEngineDisplay(game: Game): string {
    if (!game.engine) {
      return 'Unknown Engine';
    }
    return `${game.engine.name} ${game.engine.version ?? ''}`.trim();
  }

  openGame(game: Game): void {
    this.router.navigate(['/game', game.steam_appid]);
  }
}
 