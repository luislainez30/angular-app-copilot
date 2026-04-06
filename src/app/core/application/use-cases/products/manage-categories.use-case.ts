import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Category, CategorySummary, CreateCategory, UpdateCategory } from '../../../domain/models/products/category.interface';
import { CATEGORY_REPOSITORY_TOKEN } from '../../ports/category-repository.token';
import { CategoryId, CategoryPageResult } from '../../../domain/models/products';

/**
 * Use case for managing product categories
 */
@Injectable({
  providedIn: 'root'
})
export class ManageCategoriesUseCase {
  private readonly categoryRepository = inject(CATEGORY_REPOSITORY_TOKEN);

  /**
   * Get all categories with optional parent filtering
   */
  getCategories(params?: {
    parentId?: string | null;
    isActive?: boolean;
    includeProductCount?: boolean;
  }): Observable<CategoryPageResult> {
    return this.categoryRepository.getAll(params);
  }

  /**
   * Get category by ID
   */
  getCategoryById(id: CategoryId): Observable<Category | null> {
    return this.categoryRepository.getById(id);
  }

  /**
   * Get category by slug
   */
  getCategoryBySlug(slug: string): Observable<Category | null> {
    return this.categoryRepository.getBySlug(slug);
  }

  /**
   * Get complete category tree
   */
  getCategoryTree(): Observable<Category[]> {
    return this.categoryRepository.getCategoryTree();
  }

  /**
   * Get category tree for navigation menu
   */
  getNavigationCategories(): Observable<CategorySummary[]> {
    return this.categoryRepository.getNavigationCategories();
  }

  /**
   * Get root categories (top-level)
   */
  getRootCategories(): Observable<CategoryPageResult> {
    return this.getCategories({ parentId: null });
  }

  /**
   * Get child categories of a specific parent
   */
  getChildCategories(parentId: string): Observable<CategoryPageResult> {
    return this.getCategories({ parentId });
  }

  /**
   * Create a new category
   */
  createCategory(categoryData: CreateCategory): Observable<Category> {
    return this.categoryRepository.create(categoryData);
  }

  /**
   * Update an existing category
   */
  updateCategory(id: CategoryId, updates: UpdateCategory): Observable<Category | null> {
    return this.categoryRepository.update(id, updates);
  }

  /**
   * Delete a category
   */
  deleteCategory(id: CategoryId): Observable<boolean> {
    return this.categoryRepository.delete(id);
  }

  /**
   * Validate slug availability
   */
  validateSlug(slug: string, excludeId?: CategoryId): Observable<boolean> {
    return this.categoryRepository.isSlugAvailable(slug, excludeId);
  }

  /**
   * Update category status
   */
  updateCategoryStatus(id: CategoryId, isActive: boolean): Observable<Category | null> {
    return this.updateCategory(id, {id, isActive });
  }
}