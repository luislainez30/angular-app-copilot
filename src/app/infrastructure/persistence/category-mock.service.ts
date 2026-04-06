import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { 
  Category, 
  CreateCategory,
  CategorySummary
} from '../../core/domain/models/products/category.interface';
import { 
  CategoryId,
  CategoryWithComputed,
  CategoryPageResult,
  CategorySearchCriteria,
  CategorySortField
} from '../../core/domain/models/products/category-types';

@Injectable({
  providedIn: 'root'
})
export class CategoryMockService {
  private categories: Category[] = [
    // Root Categories
    {
      id: 'cat-1' as CategoryId,
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and accessories',
      isActive: true,
      sortOrder: 1,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-03-10')
    },
    {
      id: 'cat-2' as CategoryId,
      name: 'Clothing',
      slug: 'clothing',
      description: 'Apparel and fashion items',
      isActive: true,
      sortOrder: 2,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-03-05')
    },
    {
      id: 'cat-3' as CategoryId,
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Home improvement and garden supplies',
      isActive: true,
      sortOrder: 3,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-03-08')
    },

    // Electronics Subcategories - Note: Based on actual Category interface, parent-child relationships
    // would be managed differently. For now, creating simple flat structure.
    {
      id: 'cat-4' as CategoryId,
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Mobile phones and accessories',
      isActive: true,
      sortOrder: 1,
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-03-10')
    },
    {
      id: 'cat-5' as CategoryId,
      name: 'Laptops',
      slug: 'laptops',
      description: 'Portable computers and accessories',
      isActive: true,
      sortOrder: 2,
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-03-09')
    },
    {
      id: 'cat-6' as CategoryId,
      name: 'Audio Equipment',
      slug: 'audio-equipment',
      description: 'Headphones, speakers, and audio gear',
      isActive: true,
      sortOrder: 3,
      createdAt: new Date('2024-01-22'),
      updatedAt: new Date('2024-03-07')
    }
  ];

  private getNextId(): CategoryId {
    const maxId = Math.max(...this.categories.map(c => parseInt(c.id.replace('cat-', ''))));
    return `cat-${maxId + 1}` as CategoryId;
  }

  private generateUniqueSlug(name: string): string {
    let baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim();

    let slug = baseSlug;
    let counter = 1;

    // Check for slug uniqueness
    while (this.categories.some(c => c.slug === slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  createCategory(categoryData: CreateCategory): Observable<Category> {
    return of(null).pipe(
      delay(300),
      switchMap(() => {
        // Generate unique slug
        const slug = this.generateUniqueSlug(categoryData.name);

        // Calculate sort order
        const maxSortOrder = Math.max(...this.categories.map(c => c.sortOrder), 0);

        const newCategory: Category = {
          id: this.getNextId(),
          name: categoryData.name.trim(),
          slug,
          description: categoryData.description?.trim() || '',
          isActive: categoryData.isActive ?? true,
          sortOrder: categoryData.sortOrder ?? (maxSortOrder + 1),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        this.categories.push(newCategory);
        return of(newCategory);
      })
    );
  }

  deleteCategory(categoryId: CategoryId): Observable<boolean> {
    return of(null).pipe(
      delay(200),
      switchMap(() => {
        // Check if category exists
        const categoryIndex = this.categories.findIndex(c => c.id === categoryId);
        if (categoryIndex === -1) {
          throw new Error(`Category with ID ${categoryId} not found`);
        }

        const category = this.categories[categoryIndex];

        // In a real implementation, you would check for:
        // - Child categories (requires hierarchical structure)
        // - Associated products 
        // For now, we just delete the category

        // Delete the category
        this.categories.splice(categoryIndex, 1);

        return of(true);
      })
    );
  }

  // Helper methods for other operations (read-only)
  getCategories(): Observable<Category[]> {
    return of([...this.categories]).pipe(delay(150));
  }

  getCategoryById(id: CategoryId): Observable<Category | null> {
    const category = this.categories.find(c => c.id === id);
    return of(category || null).pipe(delay(100));
  }

  // Note: Hierarchical methods would require a different Category interface
  // that includes parent-child relationships
  getRootCategories(): Observable<Category[]> {
    // For now, just return all categories since we don't have hierarchy
    return this.getCategories();
  }

  getCategoryChildren(parentId: CategoryId): Observable<Category[]> {
    // Return empty array since current implementation doesn't support hierarchy
    return of([]).pipe(delay(120));
  }

  getCategoryTree(): Observable<CategoryWithComputed[]> {
    // Would need to implement this based on actual hierarchical structure
    return of([]).pipe(delay(200));
  }
}