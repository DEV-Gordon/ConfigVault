import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrendingGrid } from '../trending-grid/trending-grid';
import { RecentList } from '../recent-list/recent-list';
import { GamesService, HomeFeedFilters, HomeFeedResponse } from '../../../core/services/games';
import { Game } from '../../../core/models/game';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TrendingGrid, RecentList],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  // Service that performs HTTP requests to backend API endpoints.
  private gamesService = inject(GamesService);
  // Used to auto-unsubscribe from observables when the component is destroyed.
  private destroyRef = inject(DestroyRef);
  // Access to route query params (preset_section / api_target).
  private route = inject(ActivatedRoute);

  protected trendingGames = signal<Game[]>([]);
  protected recentGames = signal<Game[]>([]);
  // Unified list used when one or more sidebar filters are active.
  protected filteredGames = signal<Game[]>([]);
  // Switches Home between default sections and filtered single-list mode.
  protected isFilteredView = signal(false);
  // Dynamic heading shown in filtered mode (for example, "Deck Verified · DirectX 12 Games").
  protected filterTitle = signal('Filtered Games');
  protected loadError = signal<string | null>(null);
  
  // Temporary curated IDs while product ranking logic is not implemented server-side.
  private trendingIds = [1962663, 570, 440, 1091500, 381210, 3321460];

  constructor() {
    // Every URL filter change triggers a fresh backend request.
    // This keeps Home fully driven by the URL state.
    this.route.root.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.loadFeedWithFilters(params);
      });
  }

  private loadFeedWithFilters(params: Record<string, string | null | undefined>): void {
    const filters: HomeFeedFilters = {};
    const presetSection = params['preset_section'];
    const apiTarget = params['api_target'];

    // Keep the default Home layout only when no filter is selected.
    const hasPresetFilter = Boolean(presetSection);
    const hasApiFilter = Boolean(apiTarget);

    // If at least one filter exists, switch to the single-list filtered layout.
    this.isFilteredView.set(hasPresetFilter || hasApiFilter);
    this.filterTitle.set(this.buildFilterTitle(presetSection, apiTarget));

    // Forward only active filters to the backend endpoint.
    if (presetSection) {
      filters.preset_section = presetSection;
    }
    if (apiTarget) {
      filters.api_target = apiTarget;
    }

    this.gamesService
      .getHomeFeed(this.trendingIds, 6, 8, filters)
      .pipe(
        catchError(() => {
          // User-friendly message + fallback strategy so the screen is not empty.
          this.loadError.set('Failed to load home feed. Displaying fallback data.');
          return forkJoin({
            trending: this.gamesService.getGamesByIds(this.trendingIds),
            recent: this.gamesService.getGames('-created_at', 8),
          }).pipe(
            // Last-resort fallback: return empty arrays if both API calls fail.
            catchError(() => of({ trending: [] as Game[], recent: [] as Game[], recent_scope: 'games' }))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response: HomeFeedResponse) => {
        // Normalize nullable payload fields to always work with arrays.
        const trending = response.trending ?? [];
        const recent = response.recent ?? [];

        this.trendingGames.set(trending);
        this.recentGames.set(recent);

        // Merge sections and deduplicate by Steam AppID for filtered mode.
        const merged = this.mergeUniqueGames(trending, recent);
        this.filteredGames.set(merged);
      });
  }

  private buildFilterTitle(
    presetSection: string | null | undefined,
    apiTarget: string | null | undefined
  ): string {
    // UI labels for preset filter values coming from query params.
    const presetLabels: Record<string, string> = {
      trending: 'Trending Now',
      recent: 'Recently Added',
      deck: 'Deck Verified',
    };

    // UI labels for API filter values coming from query params.
    const apiLabels: Record<string, string> = {
      dx12: 'DirectX 12',
      dx11: 'DirectX 11',
      dx9: 'DirectX 9',
      gl: 'OpenGL',
      vk: 'Vulkan',
    };

    const parts: string[] = [];
    if (presetSection && presetLabels[presetSection]) {
      parts.push(presetLabels[presetSection]);
    }
    if (apiTarget && apiLabels[apiTarget.toLowerCase()]) {
      parts.push(apiLabels[apiTarget.toLowerCase()]);
    }

    // Examples:
    // - "Deck Verified Games"
    // - "Deck Verified · DirectX 12 Games"
    // - "Filtered Games" (fallback)
    return parts.length ? `${parts.join(' · ')} Games` : 'Filtered Games';
  }

  private mergeUniqueGames(primary: Game[], secondary: Game[]): Game[] {
    // Preserve order from the primary array, then append only missing items.
    const map = new Map<number, Game>();
    for (const game of primary) {
      map.set(game.steam_appid, game);
    }
    for (const game of secondary) {
      if (!map.has(game.steam_appid)) {
        map.set(game.steam_appid, game);
      }
    }
    return Array.from(map.values());
  }
}
