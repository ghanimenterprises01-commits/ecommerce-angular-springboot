import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
    {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'products',
    renderMode: RenderMode.Server
  },
  {
    path: 'products/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'search',
    renderMode: RenderMode.Server
  },
  {
    path: 'cart',
    renderMode: RenderMode.Client
  },
  {
    path: 'auth/login',
    renderMode: RenderMode.Client
  },
  {
    path: 'auth/register',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin',
    renderMode: RenderMode.Client
  },
  {
    path: 'order-success/:id',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
