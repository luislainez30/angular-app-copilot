import { Category } from './category.interface';

/**
 * Branded type for Category ID to prevent mixing with other IDs
 */
export type CategoryId = string & { readonly __brand: 'CategoryId' };

/**
 * Category with computed properties
 */
export interface CategoryWithComputed extends Category {
  readonly fullPath: string; // Full category path (e.g., "Electronics > Phones > Smartphones")
  readonly level: number; // Depth level in hierarchy (0 = root)
  readonly hasChildren: boolean; // Whether this category has subcategories
  readonly productCount: number; // Number of products in this category
}

/**
 * Category search criteria
 */
export interface CategorySearchCriteria {
  query?: string;
  parentCategoryId?: CategoryId;
  isActive?: boolean;
  level?: number;
  sortBy?: CategorySortField;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Category sort fields
 */
export enum CategorySortField {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  SORT_ORDER = 'sortOrder',
  PRODUCT_COUNT = 'productCount'
}

/**
 * Category page result for pagination
 */
export interface CategoryPageResult {
  categories: Category[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Category validation errors
 */
export interface CategoryValidationErrors {
  name?: string[];
  slug?: string[];
  parentCategoryId?: string[];
  sortOrder?: string[];
}