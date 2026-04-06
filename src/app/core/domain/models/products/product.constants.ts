import { ProductStatus } from './product-status.enum';
import { InventoryTrackingMethod } from './inventory.interface';
import { CreateProduct } from './product.interface';
import { ProductSortField } from './product-types';
import { CategorySortField } from './category-types';

/**
 * Default product values for new product creation
 */
export const DEFAULT_PRODUCT_VALUES: Partial<CreateProduct> = {
  status: ProductStatus.DRAFT,
  trackInventory: InventoryTrackingMethod.SIMPLE,
  allowBackorder: false,
  requiresShipping: true,
  isVisible: false,
  isFeatured: false,
  images: [],
  tags: []
} as const;

/**
 * Default inventory tracking settings
 */
export const DEFAULT_INVENTORY_SETTINGS = {
  trackInventory: InventoryTrackingMethod.SIMPLE,
  reorderLevel: 10,
  maxStockLevel: 1000,
  allowBackorder: false
} as const;

/**
 * Product search defaults
 */
export const DEFAULT_PRODUCT_SEARCH = {
  sortBy: ProductSortField.UPDATED_AT,
  sortOrder: 'desc',
  page: 1,
  pageSize: 20
} as const;

/**
 * Category search defaults
 */
export const DEFAULT_CATEGORY_SEARCH = {
  sortBy: CategorySortField.SORT_ORDER,
  sortOrder: 'asc'
} as const;

/**
 * Common product dimensions for different product types
 */
export const COMMON_PRODUCT_DIMENSIONS = {
  SMALL_ITEM: { length: 10, width: 10, height: 5, unit: 'cm' as const },
  MEDIUM_ITEM: { length: 20, width: 15, height: 10, unit: 'cm' as const },
  LARGE_ITEM: { length: 50, width: 30, height: 20, unit: 'cm' as const },
  BOOK: { length: 23, width: 15, height: 2, unit: 'cm' as const },
  CLOTHING: { length: 30, width: 25, height: 5, unit: 'cm' as const }
} as const;

/**
 * Inventory location types
 */
export const INVENTORY_LOCATION_TYPES = [
  'warehouse',
  'store', 
  'supplier'
] as const;

/**
 * Stock movement types
 */
export const STOCK_MOVEMENT_TYPES = [
  'purchase',
  'sale',
  'adjustment',
  'transfer',
  'return'
] as const;

/**
 * Common product tags for categorization
 */
export const COMMON_PRODUCT_TAGS = [
  'new-arrival',
  'bestseller',
  'sale',
  'clearance',
  'seasonal',
  'limited-edition',
  'eco-friendly',
  'handmade',
  'imported',
  'luxury'
] as const;

/**
 * Product validation limits
 */
export const PRODUCT_VALIDATION_LIMITS = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 255,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 5000,
  SKU_MAX_LENGTH: 50,
  BARCODE_MAX_LENGTH: 50,
  BRAND_MAX_LENGTH: 100,
  MANUFACTURER_MAX_LENGTH: 100,
  MAX_IMAGES: 10,
  MAX_TAGS: 20,
  MIN_PRICE: 0,
  MAX_PRICE: 999999.99,
  MAX_WEIGHT: 100000, // grams
  MAX_DIMENSION: 1000  // cm
} as const;

/**
 * Category validation limits
 */
export const CATEGORY_VALIDATION_LIMITS = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 1000,
  SLUG_MAX_LENGTH: 100,
  MAX_HIERARCHY_DEPTH: 5
} as const;