import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/inspector/inspector').then((m) => m.Inspector),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
