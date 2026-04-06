import { CategoryId } from "./category-types";


/**
 * Product Category Interface
 * Represents a product category with hierarchical support
 */
export interface Category {
  readonly id: CategoryId;
  name: string;
  description?: string;
  slug: string; // URL-friendly identifier
  parentCategoryId?: CategoryId; // For hierarchical categories
  isActive: boolean;
  sortOrder: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create Category DTO - excludes generated/computed fields
 */
export interface CreateCategory {
  name: string;
  description?: string;
  slug: string;
  parentCategoryId?: CategoryId;
  isActive?: boolean;
  sortOrder?: number;
  imageUrl?: string;
}

/**
 * Update Category DTO - all fields optional except id
 */
export interface UpdateCategory {
  id: CategoryId;
  name?: string;
  description?: string;
  slug?: string;
  parentCategoryId?: CategoryId;
  isActive?: boolean;
  sortOrder?: number;
  imageUrl?: string;
}

/**
 * Category Summary - minimal info for dropdowns/selections
 */
export interface CategorySummary {
  id: CategoryId;
  name: string;
  slug: string;
  parentCategoryId?: CategoryId;
  isActive: boolean;
}