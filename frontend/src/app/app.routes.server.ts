import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'discover',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'database',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'community',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'game/:steamAppId',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
