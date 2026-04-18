import { Injectable, computed, inject, signal } from '@angular/core';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root',
})

export class Search {
  private query = signal('');
  private games = signal<Game[]>([]);

  setQuery(q: string) {
    this.query.set(q.toLowerCase().trim());
  }

  setGames(games: Game[]) {
    this.games.set(games);
  }

  clearQuery() {
    this.query.set('');
  }

  readonly results = computed((): Game[] => {
    const q = this.query();
    if (!q) {
      return [];
    }

    return this.games().filter(game => {
      const title = (game.title ?? '').toLowerCase();
      const steam_appid = (game.steam_appid ?? '').toString();
      const engine = (game.engine?.name ?? '').toLowerCase();
      const developer = (game.developer ?? '').toLowerCase();
    
    return (
      title.includes(q) ||
      steam_appid.includes(q) ||
      engine.includes(q) ||
      developer.includes(q)
    );
  });
  });

  readonly hasResults = computed(() => this.results().length > 0);

  }