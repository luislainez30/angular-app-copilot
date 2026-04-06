import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./presentation/features/home/home.component').then(c => c.HomeComponent),
    data: { title: 'Dashboard' }
  },
  {
    path: 'customers',
    loadChildren: () => import('./presentation/features/customers/customer.routes').then(r => r.customerRoutes),
    data: { title: 'Customers' }
  },
  {
    path: 'products',
    loadChildren: () => import('./presentation/features/products/product.routes').then(r => r.productRoutes),
    data: { title: 'Products' }
  },
//   {
//     path: 'inventory',
//     loadComponent: () => import('./presentation/features/inventory/inventory-list/inventory-list.component').then(c => c.InventoryListComponent),
//     data: { title: 'Inventory' }
//   },
//   {
//     path: 'sales',
//     loadComponent: () => import('./presentation/features/sales/sales-list/sales-list.component').then(c => c.SalesListComponent),
//     data: { title: 'Sales' }
//   },
//   {
//     path: 'purchases',
//     loadComponent: () => import('./presentation/features/purchases/purchase-list/purchase-list.component').then(c => c.PurchaseListComponent),
//     data: { title: 'Purchases' }
//   },
//   {
//     path: 'reports',
//     loadComponent: () => import('./presentation/features/reports/reports-dashboard/reports-dashboard.component').then(c => c.ReportsDashboardComponent),
//     data: { title: 'Reports' }
//   },
//   {
//     path: 'analytics',
//     loadComponent: () => import('./presentation/features/analytics/analytics-dashboard/analytics-dashboard.component').then(c => c.AnalyticsDashboardComponent),
//     data: { title: 'Analytics' }
//   },
  {
    path: '**',
    redirectTo: '/home'
  }
];
   
