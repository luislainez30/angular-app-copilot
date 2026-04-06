import { Product } from './product.interface';
import { CategoryId } from './category-types';
import { ProductStatus } from './product-status.enum';
import { InventoryTrackingMethod } from './inventory.interface';

/**
 * Branded type for Product ID to prevent mixing with other IDs
 */
export type ProductId = string & { readonly __brand: 'ProductId' };

/**
 * Product dimensions interface
 */
export interface ProductDimensions {
  length: number; // cm
  width: number;  // cm
  height: number; // cm
  unit: 'cm' | 'in';
}

/**
 * Product with computed/enriched properties
 */
export interface ProductWithComputed extends Product {
  readonly isOnSale: boolean; // Has compare at price > current price
  readonly discountAmount: number; // Difference between compare and current price
  readonly discountPercentage: number; // Discount as percentage
  readonly isDiscontinued: boolean; // Status is discontinued
  readonly hasInventoryTracking: boolean; // Tracks inventory
  readonly categoryName: string; // Resolved category name
  readonly formattedPrice: string; // Formatted price string
  readonly formattedWeight: string; // Formatted weight string
  readonly slug: string; // URL-friendly version of name
}

/**
 * Product search criteria
 */
export interface ProductSearchCriteria {
  query?: string; // Search in name, description, sku
  categoryId?: CategoryId;
  categoryIds?: CategoryId[]; // Multiple categories
  status?: ProductStatus;
  statuses?: ProductStatus[]; // Multiple statuses
  isVisible?: boolean;
  isFeatured?: boolean;
  brand?: string;
  brands?: string[]; // Multiple brands
  priceMin?: number;
  priceMax?: number;
  trackInventory?: InventoryTrackingMethod;
  tags?: string[]; // Products with any of these tags
  inStock?: boolean; // Has available inventory
  sortBy?: ProductSortField;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/**
 * Product sort fields
 */
export enum ProductSortField {
  NAME = 'name',
  PRICE = 'price',
  SKU = 'sku',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  PUBLISHED_AT = 'publishedAt',
  CATEGORY = 'categoryId',
  BRAND = 'brand',
  STATUS = 'status'
}

/**
 * Product page result for pagination
 */
export interface ProductPageResult {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters?: {
    categories: CategoryId[];
    brands: string[];
    priceRange: { min: number; max: number };
    statuses: ProductStatus[];
  };
}

/**
 * Product validation errors
 */
export interface ProductValidationErrors {
  name?: string[];
  description?: string[];
  sku?: string[];
  barcode?: string[];
  categoryId?: string[];
  price?: string[];
  costPrice?: string[];
  weight?: string[];
  dimensions?: string[];
  images?: string[];
  tags?: string[];
}

/**
 * Product activity/history record
 */
export interface ProductActivity {
  id: string;
  productId: ProductId;
  type: 'created' | 'updated' | 'status_changed' | 'price_changed' | 'inventory_adjusted';
  description: string;
  oldValue?: any; // Previous value for comparison
  newValue?: any; // New value
  userId?: string; // Who made the change
  timestamp: Date;
}

/**
 * Product filter options for UI
 */
export interface ProductFilterOptions {
  categories: { id: CategoryId; name: string; count: number }[];
  brands: { name: string; count: number }[];
  statuses: { status: ProductStatus; count: number }[];
  priceRange: { min: number; max: number };
  tags: { name: string; count: number }[];
}