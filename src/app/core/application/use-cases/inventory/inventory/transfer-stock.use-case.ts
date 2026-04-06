import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { StockMovement } from '../../../../domain/models/inventory/inventory.interface';
import { ProductId } from '../../../../domain/models/products/product-types';
import { INVENTORY_REPOSITORY_TOKEN } from '../../../ports/inventory-repository.token';

/**
 * Use case for transferring stock between locations
 */
@Injectable({
  providedIn: 'root'
})
export class TransferStockUseCase {
  private readonly inventoryRepository = inject(INVENTORY_REPOSITORY_TOKEN);

  /**
   * Transfer stock between locations
   */
  transferStock(
    productId: ProductId,
    fromLocationId: string,
    toLocationId: string,
    quantity: number,
    reference?: string,
    notes?: string
  ): Observable<StockMovement[]> {
    return this.inventoryRepository.transferStock(productId, fromLocationId, toLocationId, quantity, reference, notes);
  }
}