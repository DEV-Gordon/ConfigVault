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
  private baseurl = environment.apiUrl;

  getGame(steamAppId: number): Observable<Game> {
    return this.http.get<Game>(`${this.baseurl}/games/${steamAppId}/`);
  }

  getGamesByIds(ids: number[]): Observable<Game[]> {
    const idsQuery = ids.join(',');
    return this.http
      .get<Game[] | PaginatedResponse<Game>>(`${this.baseurl}/games/?ids=${idsQuery}`)
      .pipe(map((response) => (Array.isArray(response) ? response : response.results ?? [])));
  }

  getGames(ordering = '-created_at', limit = 8, page = 1, pageSize = 20): Observable<Game[]> {
    const params = new URLSearchParams();
    params.set('ordering', ordering);
    params.set('limit', String(limit));
    params.set('page', String(page));
    params.set('page_size', String(pageSize));

    return this.http
      .get<Game[] | PaginatedResponse<Game>>(`${this.baseurl}/games/?${params.toString()}`)
      .pipe(map((response) => (Array.isArray(response) ? response : response.results ?? [])));
  }

  getHomeFeed(trendingIds: number[] = [], trendingLimit = 6, recentLimit = 8): Observable<HomeFeedResponse> {
    const params = new URLSearchParams();
    if (trendingIds.length) {
      params.set('trending_ids', trendingIds.join(','));
    }
    params.set('trending_limit', String(trendingLimit));
    params.set('recent_limit', String(recentLimit));
    params.set('recent_scope', 'games');
    return this.http.get<HomeFeedResponse>(`${this.baseurl}/home-feed/?${params.toString()}`);
  }
}
