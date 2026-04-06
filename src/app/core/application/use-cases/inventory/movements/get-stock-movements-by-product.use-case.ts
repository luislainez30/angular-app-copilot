import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { StockMovement } from '../../../../domain/models/inventory/inventory.interface';
import { ProductId } from '../../../../domain/models/products/product-types';
import { IInventoryRepository } from '../../../../domain/repositories/inventory.repository';
import { INVENTORY_REPOSITORY_TOKEN } from '../../../ports/inventory-repository.token';

/**
 * Use case for retrieving stock movements by product ID
 * Provides focused functionality for stock movement history retrieval
 */
@Injectable({
  providedIn: 'root'
})
export class GetStockMovementsByProductUseCase {
  private readonly inventoryRepository = inject(INVENTORY_REPOSITORY_TOKEN);

  /**
   * Get all stock movements for a specific product
   * @param productId - The product identifier
   * @returns Observable array of stock movements
   */
  execute(productId: ProductId): Observable<StockMovement[]> {
    return this.inventoryRepository.getStockMovements(productId);
  }

  /**
   * Get stock movements for a specific product at a specific location
   * @param productId - The product identifier
   * @param locationId - The inventory location identifier
   * @returns Observable array of stock movements
   */
  executeByLocation(productId: ProductId, locationId: string): Observable<StockMovement[]> {
    return this.inventoryRepository.getStockMovements(productId, locationId);
  }

  /**
   * Get stock movements for a specific product within a date range
   * @param productId - The product identifier
   * @param fromDate - Start date for filtering movements
   * @param toDate - End date for filtering movements
   * @returns Observable array of stock movements
   */
  executeByDateRange(
    productId: ProductId, 
    fromDate: Date, 
    toDate: Date
  ): Observable<StockMovement[]> {
    return this.inventoryRepository.getStockMovements(productId, undefined, fromDate, toDate);
  }

  /**
   * Get stock movements for a specific product at a location within a date range
   * @param productId - The product identifier
   * @param locationId - The inventory location identifier
   * @param fromDate - Start date for filtering movements
   * @param toDate - End date for filtering movements
   * @returns Observable array of stock movements
   */
  executeByLocationAndDateRange(
    productId: ProductId,
    locationId: string,
    fromDate: Date,
    toDate: Date
  ): Observable<StockMovement[]> {
    return this.inventoryRepository.getStockMovements(productId, locationId, fromDate, toDate);
  }

  /**
   * Get recent stock movements for a specific product (last 30 days)
   * @param productId - The product identifier
   * @param locationId - Optional location identifier
   * @returns Observable array of recent stock movements
   */
  executeRecent(productId: ProductId, locationId?: string): Observable<StockMovement[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return this.inventoryRepository.getStockMovements(productId, locationId, thirtyDaysAgo);
  }
}