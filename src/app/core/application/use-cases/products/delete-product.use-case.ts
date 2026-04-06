import { Injectable, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { ProductId } from '../../../domain/models/products/product-types';
import { IProductRepository } from '../../../domain/repositories/product.repository';
import { PRODUCT_REPOSITORY_TOKEN } from '../../ports/product-repository.token';

/**
 * Use case for deleting products
 */
@Injectable({
  providedIn: 'root'
})
export class DeleteProductUseCase {
  private readonly productRepository = inject(PRODUCT_REPOSITORY_TOKEN);

  /**
   * Delete a single product
   * @param id - The product ID to delete
   * @returns Observable of boolean indicating success
   */
  execute(id: ProductId): Observable<boolean> {
    // Business validation could go here
    // For example: check if product has orders, inventory, etc.
    
    return this.productRepository.delete(id);
  }

  /**
   * Delete multiple products
   * @param ids - Array of product IDs to delete
   * @returns Observable of boolean indicating success
   */
  executeMultiple(ids: ProductId[]): Observable<boolean> {
    // return this.productRepository.deleteProducts(ids);

    return of(false);
  }

  /**
   * Soft delete (deactivate) instead of hard delete
   * This is often preferred in business applications to maintain data integrity
   */
  deactivate(id: ProductId): Observable<boolean> {
    // This would use the update repository method to set isActive: false
    // We could inject UpdateProductUseCase here, but keeping it simple for now
    return this.productRepository.update(id, { id, isActive: false }).pipe(
      map(result => result !== null)
    );
  }
}