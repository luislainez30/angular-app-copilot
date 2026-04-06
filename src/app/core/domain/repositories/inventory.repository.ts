import { Observable } from 'rxjs';
import { 
  ProductInventory,
  CreateProductInventory,
  UpdateProductInventory,
  StockMovement,
  InventoryAggregate,
  InventoryLocation,
  StockStatus,
  StockAdjustment,
  CreateStockAdjustment
} from '../models/inventory/inventory.interface';
import { ProductId } from '../models/products/product-types';

/**
 * Inventory repository interface - defines data access contract for inventory management
 * Infrastructure layer will implement this interface
 */
export interface IInventoryRepository {
  /**
   * Get inventory for a specific product at a specific location
   */
  getProductInventory(productId: ProductId, locationId: string): Observable<ProductInventory | null>;

  /**
   * Get all inventory records for a product across all locations
   */
  getProductInventoryByLocation(productId: ProductId): Observable<ProductInventory[]>;

  /**
   * Get aggregated inventory summary for a product
   */
  getProductInventoryAggregate(productId: ProductId): Observable<InventoryAggregate>;

  /**
   * Get inventory for multiple products
   */
  getProductsInventoryAggregate(productIds: ProductId[]): Observable<InventoryAggregate[]>;

  /**
   * Create inventory record for a product at a location
   */
  createProductInventory(inventory: CreateProductInventory): Observable<ProductInventory>;

  /**
   * Update inventory levels
   */
  updateProductInventory(
    productId: ProductId, 
    locationId: string, 
    updates: UpdateProductInventory
  ): Observable<ProductInventory>;

  /**
   * Delete inventory record
   */
  deleteProductInventory(productId: ProductId, locationId: string): Observable<boolean>;

  /**
   * Adjust stock levels (with movement record)
   */
  adjustStock(
    productId: ProductId, 
    locationId: string, 
    quantity: number, 
    movementType: 'adjustment' | 'purchase' | 'sale' | 'transfer' | 'return',
    reference?: string,
    notes?: string
  ): Observable<StockMovement>;

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
  ): Observable<StockMovement[]>; // Returns both outgoing and incoming movements

  /**
   * Reserve stock for an order
   */
  reserveStock(productId: ProductId, locationId: string, quantity: number): Observable<boolean>;

  /**
   * Release reserved stock
   */
  releaseReservedStock(productId: ProductId, locationId: string, quantity: number): Observable<boolean>;

  /**
   * Get stock movements for a product
   */
  getStockMovements(
    productId: ProductId, 
    locationId?: string,
    fromDate?: Date,
    toDate?: Date
  ): Observable<StockMovement[]>;

  /**
   * Get products that need reordering
   */
  getProductsNeedingReorder(locationId?: string): Observable<ProductInventory[]>;

  /**
   * Get products that are out of stock
   */
  getOutOfStockProducts(locationId?: string): Observable<ProductInventory[]>;

  /**
   * Get products with low stock
   */
  getLowStockProducts(locationId?: string): Observable<ProductInventory[]>;

  /**
   * Get stock level for quick checks
   */
  getAvailableQuantity(productId: ProductId, locationId?: string): Observable<number>;

  /**
   * Check if product is in stock
   */
  isInStock(productId: ProductId, quantity: number, locationId?: string): Observable<boolean>;

  /**
   * Get stock status for a product
   */
  getStockStatus(productId: ProductId, locationId?: string): Observable<StockStatus>;

  /**
   * Get all inventory locations
   */
  getInventoryLocations(): Observable<InventoryLocation[]>;

  /**
   * Get active inventory locations
   */
  getActiveInventoryLocations(): Observable<InventoryLocation[]>;

  /**
   * Get inventory valuation (total value of stock)
   */
  getInventoryValuation(locationId?: string): Observable<{
    totalValue: number;
    totalQuantity: number;
    productCount: number;
  }>;

  /**
   * Bulk stock adjustment (for inventory imports/corrections)
   */
  bulkAdjustStock(adjustments: Array<{
    productId: ProductId;
    locationId: string;
    quantity: number;
    costPerUnit?: number;
    reference?: string;
  }>): Observable<StockMovement[]>;

  // Stock Adjustment Methods

  /**
   * Create a stock adjustment
   */
  createStockAdjustment(adjustment: CreateStockAdjustment): Observable<StockAdjustment>;

  /**
   * Get stock adjustments for a product
   */
  getStockAdjustmentsByProduct(
    productId: ProductId, 
    locationId?: string,
    fromDate?: Date,
    toDate?: Date
  ): Observable<StockAdjustment[]>;

  /**
   * Get a specific stock adjustment by ID
   */
  getStockAdjustmentById(adjustmentId: string): Observable<StockAdjustment | null>;

  /**
   * Cancel/reject a pending stock adjustment
   */
  cancelStockAdjustment(adjustmentId: string, reason?: string): Observable<StockAdjustment>;

  /**
   * Approve a pending stock adjustment
   */
  approveStockAdjustment(adjustmentId: string, approvedBy: string): Observable<StockAdjustment>;

  /**
   * Get pending stock adjustments requiring approval
   */
  getPendingStockAdjustments(locationId?: string): Observable<StockAdjustment[]>;
}