import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrendingGrid } from '../trending-grid/trending-grid';
import { RecentList } from '../recent-list/recent-list';
import { GamesService, HomeFeedResponse } from '../../../core/services/games';
import { Game } from '../../../core/models/game';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TrendingGrid, RecentList],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private gamesService = inject(GamesService);
  private destroyRef = inject(DestroyRef);

  protected trendingGames = signal<Game[]>([]);
  protected recentGames = signal<Game[]>([]);
  protected loadError = signal<string | null>(null);
  
  // IDS of games to fetch for the trending section. In a real app, this would likely come from an API endpoint.
  private trendingIds = [1962663, 570, 440, 1091500, 381210]; // Ejemplo: Cyberpunk, Dota 2, TF2, etc.

  constructor() {
    this.gamesService
      .getHomeFeed(this.trendingIds, 6, 8)
      .pipe(
        catchError(() => {
          this.loadError.set('Failed to load home feed. Displaying fallback data.');
          return forkJoin({
            trending: this.gamesService.getGamesByIds(this.trendingIds),
            recent: this.gamesService.getGames('-created_at', 8),
          }).pipe(
            catchError(() => of({ trending: [] as Game[], recent: [] as Game[], recent_scope: 'games' }))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response: HomeFeedResponse) => {
        this.trendingGames.set(response.trending ?? []);
        this.recentGames.set(response.recent ?? []);
      });
  }
}
