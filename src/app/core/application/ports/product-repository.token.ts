import { InjectionToken } from '@angular/core';
import { IProductRepository } from '../../domain/repositories/product.repository';

/**
 * Injection token for product repository
 * This allows dependency injection of the product repository implementation
 */
export const PRODUCT_REPOSITORY_TOKEN = new InjectionToken<IProductRepository>('ProductRepository');