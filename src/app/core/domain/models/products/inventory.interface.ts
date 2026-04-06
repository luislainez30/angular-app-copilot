import { ProductId } from "./product-types";


/**
 * Inventory tracking methods
 */
export enum InventoryTrackingMethod {
  NONE = 'none', // No inventory tracking
  SIMPLE = 'simple', // Track quantity only
  DETAILED = 'detailed' // Track with locations, batches, etc.
}

/**
 * Stock status based on inventory levels
 */
export enum StockStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  ON_BACKORDER = 'on_backorder',
  DISCONTINUED = 'discontinued'
}

/**
 * Inventory Location (warehouse, store, etc.)
 */
export interface InventoryLocation {
  id: string;
  name: string;
  code: string;
  type: 'warehouse' | 'store' | 'supplier';
  address?: string;
  isActive: boolean;
}

/**
 * Product Inventory Interface
 */
export interface ProductInventory {
  readonly productId: ProductId;
  readonly locationId: string; // Reference to InventoryLocation
  quantityAvailable: number;
  quantityReserved: number; // Allocated but not yet shipped
  quantityOnOrder: number; // Incoming from suppliers
  reorderLevel: number; // Minimum stock level before reordering
  maxStockLevel?: number; // Maximum stock to maintain
  costPerUnit: number; // Inventory cost
  lastUpdated: Date;
  lastStockMovement?: Date;
}

/**
 * Create Product Inventory DTO
 */
export interface CreateProductInventory {
  productId: ProductId;
  locationId: string;
  quantityAvailable: number;
  quantityReserved?: number;
  quantityOnOrder?: number;
  reorderLevel: number;
  maxStockLevel?: number;
  costPerUnit: number;
}

/**
 * Update Product Inventory DTO
 */
export interface UpdateProductInventory {
  quantityAvailable?: number;
  quantityReserved?: number;
  quantityOnOrder?: number;
  reorderLevel?: number;
  maxStockLevel?: number;
  costPerUnit?: number;
}

/**
 * Stock Movement Record (for audit trail)
 */
export interface StockMovement {
  id: string;
  productId: ProductId;
  locationId: string;
  movementType: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return' | 'damaged' | 'expired';
  quantity: number; // Positive for incoming, negative for outgoing
  unitCost?: number;
  reference?: string; // Order number, invoice number, etc.
  notes?: string;
  createdAt: Date;
  createdBy?: string; // User who made the movement
  adjustmentId?: string; // Reference to StockAdjustment if this movement was created by an adjustment
  runningBalance?: number; // Stock balance after this movement (for display purposes)
}

/**
 * Inventory Summary - aggregated across all locations
 */
export interface InventoryAggregate {
  productId: ProductId;
  totalQuantityAvailable: number;
  totalQuantityReserved: number;
  totalQuantityOnOrder: number;
  stockStatus: StockStatus;
  needsReorder: boolean;
  lastMovementDate?: Date;
}

/**
 * Create inventory location DTO
 */
export interface CreateInventoryLocation {
  name: string;
  code: string;
  type: 'warehouse' | 'store' | 'supplier';
  address?: string;
  isActive?: boolean;
}

/**
 * Update inventory location DTO
 */
export interface UpdateInventoryLocation {
  name?: string;
  code?: string;
  type?: 'warehouse' | 'store' | 'supplier';
  address?: string;
  isActive?: boolean;
}

/**
 * Stock adjustment reasons
 */
export enum StockAdjustmentReason {
  PHYSICAL_COUNT = 'physical_count', // Based on physical inventory count
  DAMAGED_GOODS = 'damaged_goods', // Products damaged beyond use
  EXPIRED_GOODS = 'expired_goods', // Products past expiration date
  THEFT_LOSS = 'theft_loss', // Lost due to theft
  SYSTEM_CORRECTION = 'system_correction', // Correcting system errors
  RETURNED_DEFECTIVE = 'returned_defective', // Defective returns
  WRITE_OFF = 'write_off', // General write-off
  PROMOTION_SAMPLE = 'promotion_sample', // Used for samples/promotions
  BREAKAGE = 'breakage', // Broken during handling
  OTHER = 'other' // Other reasons with notes
}

/**
 * Stock Adjustment Interface
 */
export interface StockAdjustment {
  id: string;
  productId: ProductId;
  locationId: string;
  reason: StockAdjustmentReason;
  quantityBefore: number; // Stock quantity before adjustment
  quantityAfter: number; // Stock quantity after adjustment
  quantityAdjusted: number; // The actual adjustment amount (can be positive or negative)
  unitCost?: number; // Cost per unit for valuation impact
  reference?: string; // Reference document (e.g., count sheet, incident report)
  notes?: string; // Additional notes explaining the adjustment
  approvedBy?: string; // User who approved the adjustment
  createdAt: Date;
  createdBy: string; // User who created the adjustment
  approvedAt?: Date; // When the adjustment was approved
  status: 'pending' | 'approved' | 'rejected'; // Approval workflow status
}

/**
 * Create Stock Adjustment DTO
 */
export interface CreateStockAdjustment {
  productId: ProductId;
  locationId: string;
  reason: StockAdjustmentReason;
  quantityAdjusted: number; // The adjustment amount (positive for increase, negative for decrease)
  unitCost?: number;
  reference?: string;
  notes?: string;
  requiresApproval?: boolean; // Whether this adjustment requires approval
}

/**
 * Stock Adjustment Summary for reporting
 */
export interface StockAdjustmentSummary {
  productId: ProductId;
  locationId?: string; // Optional for aggregate across locations
  totalAdjustments: number; // Total number of adjustments
  totalQuantityAdjusted: number; // Net quantity adjusted (sum of all adjustments)
  totalValueImpact: number; // Total financial impact of adjustments
  adjustmentsByReason: Record<StockAdjustmentReason, {
    count: number;
    quantityAdjusted: number;
    valueImpact: number;
  }>;
  dateRange: {
    from: Date;
    to: Date;
  };
}