import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  ProductInventory, 
  InventoryAggregate,
  InventoryLocation,
  StockStatus
} from '../../../../domain/models/inventory/inventory.interface';
import { ProductId } from '../../../../domain/models/products/product-types';
import { INVENTORY_REPOSITORY_TOKEN } from '../../../ports/inventory-repository.token';

/**
 * Use case for retrieving product inventory information
 */
@Injectable({
  providedIn: 'root'
})
export class GetProductInventoryUseCase {
  private readonly inventoryRepository = inject(INVENTORY_REPOSITORY_TOKEN);

  /**
   * Get inventory for a specific product at a location
   */
  getProductInventory(productId: ProductId, locationId: string): Observable<ProductInventory | null> {
    return this.inventoryRepository.getProductInventory(productId, locationId);
  }

  /**
   * Get aggregated inventory for a product across all locations
   */
  getProductInventoryAggregate(productId: ProductId): Observable<InventoryAggregate> {
    return this.inventoryRepository.getProductInventoryAggregate(productId);
  }

  /**
   * Get inventory for multiple products
   */
  getProductsInventoryAggregate(productIds: ProductId[]): Observable<InventoryAggregate[]> {
    return this.inventoryRepository.getProductsInventoryAggregate(productIds);
  }

  /**
   * Check if product is in stock
   */
  isInStock(productId: ProductId, quantity: number = 1, locationId?: string): Observable<boolean> {
    return this.inventoryRepository.isInStock(productId, quantity, locationId);
  }

  /**
   * Get available quantity for a product
   */
  getAvailableQuantity(productId: ProductId, locationId?: string): Observable<number> {
    return this.inventoryRepository.getAvailableQuantity(productId, locationId);
  }

  /**
   * Get stock status for a product
   */
  getStockStatus(productId: ProductId, locationId?: string): Observable<StockStatus> {
    return this.inventoryRepository.getStockStatus(productId, locationId);
  }

  /**
   * Get all inventory locations
   */
  getInventoryLocations(): Observable<InventoryLocation[]> {
    return this.inventoryRepository.getInventoryLocations();
  }
}