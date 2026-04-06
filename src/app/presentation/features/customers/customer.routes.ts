import { Routes } from '@angular/router';

export const customerRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./customer-list/customer-list.component').then(c => c.CustomerListComponent),
    data: { title: 'Customer List' }
  },
  // Placeholder routes for future components
  {
    path: 'add',
    loadComponent: () => import('./customer-form/customer-form.component').then(c => c.CustomerFormComponent),
    data: { title: 'Add Customer' }
  },
  {
    path: ':id',
    loadComponent: () => import('./customer-detail/customer-detail.component').then(c => c.CustomerDetailComponent),
    data: { title: 'Customer Details' }
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./customer-form/customer-form.component').then(c => c.CustomerFormComponent),
    data: { title: 'Edit Customer' }
  }
];