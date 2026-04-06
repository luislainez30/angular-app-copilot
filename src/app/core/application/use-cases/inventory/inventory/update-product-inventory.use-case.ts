import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  ProductInventory, 
  UpdateProductInventory,
  StockMovement
} from '../../../../domain/models/inventory/inventory.interface';
import { ProductId } from '../../../../domain/models/products/product-types';
import { INVENTORY_REPOSITORY_TOKEN } from '../../../ports/inventory-repository.token';

/**
 * Use case for updating product inventory levels
 */
@Injectable({
  providedIn: 'root'
})
export class UpdateProductInventoryUseCase {
  private readonly inventoryRepository = inject(INVENTORY_REPOSITORY_TOKEN);

  /**
   * Update inventory levels
   */
  updateProductInventory(
    productId: ProductId, 
    locationId: string, 
    updates: UpdateProductInventory
  ): Observable<ProductInventory> {
    return this.inventoryRepository.updateProductInventory(productId, locationId, updates);
  }

  /**
   * Adjust stock levels with movement tracking
   */
  adjustStock(
    productId: ProductId,
    locationId: string,
    quantity: number,
    movementType: 'adjustment' | 'purchase' | 'sale' | 'transfer' | 'return',
    reference?: string,
    notes?: string
  ): Observable<StockMovement> {
    return this.inventoryRepository.adjustStock(productId, locationId, quantity, movementType, reference, notes);
  }
}