import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Game } from '../models/game';
import { environment } from '../../../environments/environment';

export interface HomeFeedResponse {
  trending: Game[];
  recent: Game[];
  recent_scope?: string;
}

export interface HomeFeedFilters {
  // Matches backend query param names expected by /api/home-feed/.
  preset_section?: string;
  api_target?: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({
  providedIn: 'root',
})
export class GamesService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // Fetch a single game by Steam AppID.
  getGame(steamAppId: number): Observable<Game> {
    return this.http.get<Game>(`${this.baseUrl}/games/${steamAppId}/`);
  }

  // Keep result order aligned with the ids list the UI sends.
  getGamesByIds(ids: number[]): Observable<Game[]> {
    // Backend supports ids=1,2,3 and preserves order in response.
    const idsQuery = ids.join(',');
    return this.http
      .get<Game[] | PaginatedResponse<Game>>(`${this.baseUrl}/games/?ids=${idsQuery}`)
      .pipe(map((response) => (Array.isArray(response) ? response : response.results ?? [])));
  }

  // Generic list endpoint helper used for recent/fallback sections.
  getGames(ordering = '-created_at', limit = 8, page = 1, pageSize = 20): Observable<Game[]> {
    // URLSearchParams helps build safe query strings without manual concatenation.
    const params = new URLSearchParams();
    params.set('ordering', ordering);
    params.set('limit', String(limit));
    params.set('page', String(page));
    params.set('page_size', String(pageSize));

    return this.http
      .get<Game[] | PaginatedResponse<Game>>(`${this.baseUrl}/games/?${params.toString()}`)
      .pipe(map((response) => (Array.isArray(response) ? response : response.results ?? [])));
  }

  // Home feed endpoint returns both sections in one network roundtrip.
  getHomeFeed(
    trendingIds: number[] = [],
    trendingLimit = 6,
    recentLimit = 8,
    filters: HomeFeedFilters = {}
  ): Observable<HomeFeedResponse> {
    // This endpoint is optimized for Home: one request returns both sections.
    const params = new URLSearchParams();
    if (trendingIds.length) {
      params.set('trending_ids', trendingIds.join(','));
    }
    params.set('trending_limit', String(trendingLimit));
    params.set('recent_limit', String(recentLimit));
    params.set('recent_scope', 'games');

    if (filters.preset_section) {
      // Optional sidebar section filter (trending/recent/deck).
      params.set('preset_section', filters.preset_section);
    }
    if (filters.api_target) {
      // Optional API target filter (dx12, dx11, dx9, gl, vk, ...).
      params.set('api_target', filters.api_target);
    }

    return this.http.get<HomeFeedResponse>(`${this.baseUrl}/home-feed/?${params.toString()}`);
  }
}
