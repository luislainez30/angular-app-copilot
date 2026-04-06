import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductId } from '../../../../domain/models/products/product-types';
import { INVENTORY_REPOSITORY_TOKEN } from '../../../ports/inventory-repository.token';

/**
 * Use case for managing stock reservations
 */
@Injectable({
  providedIn: 'root'
})
export class ReserveStockUseCase {
  private readonly inventoryRepository = inject(INVENTORY_REPOSITORY_TOKEN);

  /**
   * Reserve stock for an order
   */
  reserveStock(productId: ProductId, locationId: string, quantity: number): Observable<boolean> {
    return this.inventoryRepository.reserveStock(productId, locationId, quantity);
  }

  /**
   * Release reserved stock
   */
  releaseReservedStock(productId: ProductId, locationId: string, quantity: number): Observable<boolean> {
    return this.inventoryRepository.releaseReservedStock(productId, locationId, quantity);
  }
}