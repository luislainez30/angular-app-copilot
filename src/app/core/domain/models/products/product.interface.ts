import { ProductId, ProductDimensions } from './product-types';
import { CategoryId } from './category-types';
import { ProductStatus } from './product-status.enum';
import { InventoryTrackingMethod } from './inventory.interface';

/**
 * Core Product Interface
 */
export interface Product {
  readonly id: ProductId;
  name: string;
  description: string;
  shortDescription?: string;
  sku: string; // Stock Keeping Unit - unique identifier
  barcode?: string; // UPC/EAN barcode
  categoryId: CategoryId;
  brand?: string;
  manufacturer?: string;
  
  // Pricing
  price: number; // Selling price
  costPrice?: number; // Cost from supplier
  compareAtPrice?: number; // Original price for discount display
  
  // Physical properties
  weight?: number; // in grams
  dimensions?: ProductDimensions;
  
  // Inventory settings
  trackInventory: InventoryTrackingMethod;
  allowBackorder: boolean;
  requiresShipping: boolean;
  
  // Media
  images: string[]; // Array of image URLs
  thumbnailUrl?: string;
  
  // SEO & Marketing
  metaTitle?: string;
  metaDescription?: string;
  tags: string[]; // Search tags
  
  // Status & Dates
  status: ProductStatus;
  isVisible: boolean; // Show in catalog
  isFeatured: boolean; // Featured product
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // Additional properties
  notes?: string; // Internal notes
  externalId?: string; // External system reference
}

/**
 * Create Product DTO - excludes generated/computed fields
 */
export interface CreateProduct {
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  barcode?: string;
  categoryId: CategoryId;
  brand?: string;
  manufacturer?: string;
  price: number;
  costPrice?: number;
  compareAtPrice?: number;
  weight?: number;
  dimensions?: ProductDimensions;
  trackInventory?: InventoryTrackingMethod;
  allowBackorder?: boolean;
  requiresShipping?: boolean;
  images?: string[];
  thumbnailUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
  status?: ProductStatus;
  isVisible?: boolean;
  isFeatured?: boolean;
  notes?: string;
  externalId?: string;
}

/**
 * Update Product DTO - all fields optional except id
 */
export interface UpdateProduct {
  id: ProductId;
  name?: string;
  description?: string;
  shortDescription?: string;
  sku?: string;
  barcode?: string;
  categoryId?: CategoryId;
  brand?: string;
  manufacturer?: string;
  price?: number;
  costPrice?: number;
  compareAtPrice?: number;
  weight?: number;
  dimensions?: ProductDimensions;
  trackInventory?: InventoryTrackingMethod;
  allowBackorder?: boolean;
  requiresShipping?: boolean;
  images?: string[];
  thumbnailUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
  status?: ProductStatus;
  isVisible?: boolean;
  isFeatured?: boolean;
  isActive?: boolean; // For soft deletion
  notes?: string;
  externalId?: string;
}

/**
 * Product Summary - minimal info for lists/catalogs
 */
export interface ProductSummary {
  id: ProductId;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  thumbnailUrl?: string;
  status: ProductStatus;
  isVisible: boolean;
  categoryId: CategoryId;
}