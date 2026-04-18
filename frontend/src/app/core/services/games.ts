import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root',
})
export class GamesService {
  private http = inject(HttpClient);
  private baseurl = 'http://localhost:8000/api';

  getGame(steamAppId: number): Observable<Game> {
    return this.http.get<Game>(`${this.baseurl}/games/${steamAppId}/`);
  }
}
