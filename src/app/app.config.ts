import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { CUSTOMER_REPOSITORY_TOKEN } from './core/application/ports/customer-repository.port';
import { PRODUCT_REPOSITORY_TOKEN } from './core/application/ports/product-repository.token';
import { CATEGORY_REPOSITORY_TOKEN } from './core/application/ports/category-repository.token';
import { INVENTORY_REPOSITORY_TOKEN } from './core/application/ports/inventory-repository.token';
import { INVENTORY_LOCATION_REPOSITORY_TOKEN } from './core/application/ports/inventory-location-repository.token';
import { SALE_REPOSITORY_TOKEN } from './core/application/ports/sale-repository.token';
import { CustomerRepositoryImpl } from './infrastructure/repositories/customer-repository.impl';
import { ProductRepositoryImpl } from './infrastructure/repositories/product-repository.impl';
import { SaleRepositoryImpl } from './infrastructure/repositories/sale-repository.impl';
import { CategoryMockService } from './infrastructure/persistence/category-mock.service';
import { InventoryMockService } from './infrastructure/persistence/inventory-mock.service';
import { InventoryLocationMockService } from './infrastructure/persistence/inventory-location-mock.service';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Repository pattern providers
    { provide: CUSTOMER_REPOSITORY_TOKEN, useClass: CustomerRepositoryImpl },
    { provide: PRODUCT_REPOSITORY_TOKEN, useClass: ProductRepositoryImpl },
    // Mock services for categories and inventory (create/delete operations only)
    { provide: CATEGORY_REPOSITORY_TOKEN, useClass: CategoryMockService },
    { provide: INVENTORY_REPOSITORY_TOKEN, useClass: InventoryMockService },
    { provide: INVENTORY_LOCATION_REPOSITORY_TOKEN, useClass: InventoryLocationMockService },
    { provide: SALE_REPOSITORY_TOKEN, useClass: SaleRepositoryImpl }
  ]
};
