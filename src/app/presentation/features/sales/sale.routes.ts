import { Routes } from '@angular/router';

export const saleRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./sale-list/sale-list.component').then(m => m.SaleListComponent),
    data: { title: 'Sales List' }
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./sale-create/sale-create.component').then(m => m.SaleCreateComponent),
    data: { title: 'New Sale' }
  }
];
