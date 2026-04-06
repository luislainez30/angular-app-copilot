import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { StockMovement } from '../../../../domain/models/inventory/inventory.interface';
import { ProductId } from '../../../../domain/models/products/product-types';
import { INVENTORY_REPOSITORY_TOKEN } from '../../../ports/inventory-repository.token';

/**
 * Use case for retrieving stock movements history
 */
@Injectable({
  providedIn: 'root'
})
export class GetStockMovementsUseCase {
  private readonly inventoryRepository = inject(INVENTORY_REPOSITORY_TOKEN);

  /**
   * Get stock movements history
   */
  getStockMovements(
    productId: ProductId,
    locationId?: string,
    fromDate?: Date,
    toDate?: Date
  ): Observable<StockMovement[]> {
    return this.inventoryRepository.getStockMovements(productId, locationId, fromDate, toDate);
  }
}