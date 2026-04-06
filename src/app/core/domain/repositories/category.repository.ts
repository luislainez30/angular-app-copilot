import { Observable } from 'rxjs';
import { 
  Category, 
  CreateCategory, 
  UpdateCategory, 
  CategorySummary 
} from '../models/products/category.interface';
import { 
  CategoryId,
  CategoryPageResult,
  CategorySearchCriteria
} from '../models/products/category-types';
import { CategoryTree } from '../models/products/category.utils';

/**
 * Category repository interface - defines data access contract for categories
 * Infrastructure layer will implement this interface
 */
export interface ICategoryRepository {
  /**
   * Get paginated categories with search and filtering
   */
  getAll(criteria?: CategorySearchCriteria): Observable<CategoryPageResult>;

  /**
   * Get category by ID
   */
  getById(id: CategoryId): Observable<Category | null>;

  /**
   * Get category by slug (URL-friendly identifier)
   */
  getBySlug(slug: string): Observable<Category | null>;

  /**
   * Get multiple categories by IDs
   */
  getByIds(ids: CategoryId[]): Observable<Category[]>;

  /**
   * Create new category
   */
  create(category: CreateCategory): Observable<Category>;

  /**
   * Update existing category
   */
  update(id: CategoryId, updates: UpdateCategory): Observable<Category>;

  /**
   * Delete category (and handle subcategories)
   */
  delete(id: CategoryId): Observable<boolean>;

  /**
   * Check if category exists
   */
  exists(id: CategoryId): Observable<boolean>;

  /**
   * Check if slug is available (for validation)
   */
  isSlugAvailable(slug: string, excludeId?: CategoryId): Observable<boolean>;

  /**
   * Get root categories (no parent)
   */
  getRootCategories(): Observable<Category[]>;

  /**
   * Get children of a specific category
   */
  getChildren(parentId: CategoryId): Observable<Category[]>;

  /**
   * Get all descendants of a category (recursive)
   */
  getDescendants(parentId: CategoryId): Observable<Category[]>;

  /**
   * Get category hierarchy as tree structure
   */
  getCategoryTree(): Observable<CategoryTree[]>;

  /**
   * Get active categories only
   */
  getActiveCategories(): Observable<Category[]>;

  /**
   * Get categories suitable for navigation/menu
   */
  getNavigationCategories(): Observable<CategorySummary[]>;

  /**
   * Move category to new parent (change hierarchy)
   */
  moveCategory(categoryId: CategoryId, newParentId?: CategoryId): Observable<boolean>;

  /**
   * Reorder categories (update sort order)
   */
  reorderCategories(categoryOrders: Array<{ id: CategoryId; sortOrder: number }>): Observable<boolean>;

  /**
   * Search categories by name or description
   */
  search(query: string): Observable<Category[]>;

  /**
   * Get categories with product count
   */
  getCategoriesWithProductCount(): Observable<Array<Category & { productCount: number }>>;
}