import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { StockAdjustment } from '../../../../domain/models/inventory/inventory.interface';
import { ProductId } from '../../../../domain/models/products/product-types';
import { INVENTORY_REPOSITORY_TOKEN } from '../../../ports/inventory-repository.token';

/**
 * Use case for retrieving stock adjustments
 */
@Injectable({
  providedIn: 'root'
})
export class GetStockAdjustmentsUseCase {
  private readonly inventoryRepository = inject(INVENTORY_REPOSITORY_TOKEN);

  /**
   * Get stock adjustments for a specific product
   * @param productId - The product identifier
   * @param locationId - Optional location filter
   * @param fromDate - Optional start date filter
   * @param toDate - Optional end date filter
   * @returns Observable array of stock adjustments
   */
  getStockAdjustmentsByProduct(
    productId: ProductId,
    locationId?: string,
    fromDate?: Date,
    toDate?: Date
  ): Observable<StockAdjustment[]> {
    if (!productId) {
      throw new Error('Product ID is required');
    }

    return this.inventoryRepository.getStockAdjustmentsByProduct(
      productId, 
      locationId, 
      fromDate, 
      toDate
    );
  }

  /**
   * Get a specific stock adjustment by ID
   * @param adjustmentId - The adjustment identifier
   * @returns Observable of the adjustment or null if not found
   */
  getStockAdjustmentById(adjustmentId: string): Observable<StockAdjustment | null> {
    if (!adjustmentId?.trim()) {
      throw new Error('Adjustment ID is required');
    }

    return this.inventoryRepository.getStockAdjustmentById(adjustmentId.trim());
  }

  /**
   * Get pending stock adjustments requiring approval
   * @param locationId - Optional location filter
   * @returns Observable array of pending adjustments
   */
  getPendingStockAdjustments(locationId?: string): Observable<StockAdjustment[]> {
    return this.inventoryRepository.getPendingStockAdjustments(locationId);
  }
}