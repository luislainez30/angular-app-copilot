import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../../../domain/models/products/product.interface';
import { ProductId } from '../../../domain/models/products/product-types';
import { IProductRepository } from '../../../domain/repositories/product.repository';
import { PRODUCT_REPOSITORY_TOKEN } from '../../ports/product-repository.token';

/**
 * Use case for retrieving a single product by ID or SKU
 */
@Injectable({
  providedIn: 'root'
})
export class GetProductUseCase {
  private readonly productRepository = inject(PRODUCT_REPOSITORY_TOKEN);

  /**
   * Get product by ID
   */
  executeById(id: ProductId): Observable<Product | null> {
    return this.productRepository.getById(id);
  }

  /**
   * Get product by SKU
   */
  executeBySku(sku: string): Observable<Product | null> {
    return this.productRepository.getBySku(sku);
  }
}