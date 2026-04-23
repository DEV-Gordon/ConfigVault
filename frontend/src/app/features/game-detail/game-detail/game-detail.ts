import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';

import { Game } from '../../../core/models/game';
import { GamesService } from '../../../core/services/games';
import { PresetCard } from '../preset-card/preset-card';
import { RequirementsPanel } from '../requirements-panel/requirements-panel';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PresetCard, RequirementsPanel],
  templateUrl: './game-detail.html',
  styleUrl: './game-detail.css',
})
export class GameDetail {
  private gamesService = inject(GamesService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  protected game = signal<Game | null>(null);
  protected isLoading = signal(true);
  protected loadError = signal<string | null>(null);
  protected expandedPresetIndex = signal<number | null>(null);

  constructor() {
    // Listen to /game/:steamAppId and fetch game details on route changes.
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.isLoading.set(true);
          this.loadError.set(null);

          const idRaw = params.get('steamAppId');
          const steamAppId = Number(idRaw);
          if (!idRaw || Number.isNaN(steamAppId)) {
            this.isLoading.set(false);
            this.loadError.set('Invalid game id in URL.');
            return of(null);
          }

          return this.gamesService.getGame(steamAppId).pipe(
            catchError(() => {
              this.loadError.set('Failed to load game detail.');
              return of(null);
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        this.game.set(response);
        this.expandedPresetIndex.set(null);
        this.isLoading.set(false);
      });
  }

  protected isPresetExpanded(index: number): boolean {
    return this.expandedPresetIndex() === index;
  }

  protected togglePreset(index: number): void {
    this.expandedPresetIndex.set(this.expandedPresetIndex() === index ? null : index);
  }
}
