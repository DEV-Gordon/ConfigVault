import { Injectable, computed, signal } from '@angular/core';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root',
})

export class Search {
  private query = signal('');
  private games = signal<Game[]>([]);

  // Home uses this to decide when the search bar should replace the normal layout.
  readonly hasQuery = computed(() => this.query().length > 0);

  // Normalize search text once so all filters stay consistent.
  setQuery(q: string) {
    this.query.set((q ?? '').toLowerCase().trim());
  }

  setGames(games: Game[]) {
    this.games.set(games);
  }

  clearQuery() {
    // Reset only the text; Home will keep the current cached game list.
    this.query.set('');
  }

  // In-memory filter over loaded games for instant UI feedback.
  readonly results = computed((): Game[] => {
    const q = this.query();
    if (!q) {
      return [];
    }

    return this.games().filter((game) => {
      const title = (game.title ?? '').toLowerCase();
      const steamAppId = (game.steam_appid ?? '').toString();
      const engine = (game.engine?.name ?? '').toLowerCase();
      const developer = (game.developer ?? '').toLowerCase();

      return (
        title.includes(q) ||
        steamAppId.includes(q) ||
        engine.includes(q) ||
        developer.includes(q)
      );
    });
  });

  readonly hasResults = computed(() => this.results().length > 0);
}