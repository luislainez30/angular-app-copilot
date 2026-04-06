import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../../../domain/models/products/product.interface';
import { ProductPageResult, ProductSearchCriteria } from '../../../domain/models/products/product-types';
import { CategoryId } from '../../../domain/models/products/category-types';
import { PRODUCT_REPOSITORY_TOKEN } from '../../ports/product-repository.token';

/**
 * Use case for searching products
 */
@Injectable({
  providedIn: 'root'
})
export class SearchProductsUseCase {
  private readonly productRepository = inject(PRODUCT_REPOSITORY_TOKEN);

  /**
   * Search products by text query
   * @param query - Search query (searches name, description, SKU, tags)
   * @param filters - Optional filters to apply
   * @returns Observable of matching products
   */
  execute(query: string, filters?: {
    categoryId?: CategoryId;
    priceMin?: number;
    priceMax?: number;
    isVisible?: boolean;
    isFeatured?: boolean;
    tags?: string[];
    page?: number;
    pageSize?: number;
  }): Observable<ProductPageResult> {
    const searchCriteria: ProductSearchCriteria = {
      query,
      categoryId: filters?.categoryId,
      priceMin: filters?.priceMin,
      priceMax: filters?.priceMax,
      isVisible: filters?.isVisible,
      isFeatured: filters?.isFeatured,
      tags: filters?.tags,
      page: filters?.page || 1,
      pageSize: filters?.pageSize || 20
    };
    
    return this.productRepository.search(query, searchCriteria);
  }

  /**
   * Search products by category
   */
  searchByCategory(categoryId: CategoryId, query?: string): Observable<ProductPageResult> {
    return this.execute(query || '', { categoryId });
  }

  /**
   * Search products by price range
   */
  searchByPriceRange(priceMin: number, priceMax: number, query?: string): Observable<ProductPageResult> {
    return this.execute(query || '', { priceMin, priceMax });
  }

  /**
   * Search products by tags
   */
  searchByTags(tags: string[], query?: string): Observable<ProductPageResult> {
    return this.execute(query || '', { tags });
  }

  /**
   * Get products in a specific price range
   */
  getProductsInPriceRange(priceMin: number, priceMax: number): Observable<ProductPageResult> {
    return this.execute('', { priceMin, priceMax });
  }

  /**
   * Get products by visibility status
   */
  getProductsByVisibility(isVisible: boolean = true): Observable<ProductPageResult> {
    return this.execute('', { isVisible });
  }
  
}