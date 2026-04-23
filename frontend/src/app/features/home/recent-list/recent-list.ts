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
  // Hard limit used to keep long publisher/developer strings readable.
  private readonly maxDeveloperChars = 64;

  @Input() games: Game[] = [];
  // Null means "show all"; otherwise render only the first N rows.
  @Input() maxItems: number | null = 4;

  get visibleGames(): Game[] {
    // This getter keeps slicing logic out of the template.
    if (this.maxItems == null) {
      return this.games;
    }
    return this.games.slice(0, this.maxItems);
  }

  getEngineDisplay(game: Game): string {
    if (!game.engine) {
      return 'Unknown Engine';
    }
    return `${game.engine.name} ${game.engine.version ?? ''}`.trim();
  }

  getDeveloperDisplay(game: Game): string {
    // Normalize empty values and truncate long text with ellipsis.
    const developer = (game.developer ?? '').trim();
    if (!developer) {
      return 'Unknown Developer';
    }
    if (developer.length <= this.maxDeveloperChars) {
      return developer;
    }
    return `${developer.slice(0, this.maxDeveloperChars).trim()}...`;
  }

  openGame(game: Game): void {
    // Navigate to detail route for the clicked game row.
    this.router.navigate(['/game', game.steam_appid]);
  }
}
 