import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'discover' },
    {
    path: 'discover',
    loadComponent: () =>
        import('./features/home/home').then(m => m.HomeComponent),
    },
    {
    path: 'game/:steamAppId',
    loadComponent: () =>
        import('./features/game-detail/game-detail').then(m => m.GameDetailComponent),
    },
    { path: '**', redirectTo: 'discover' },
];