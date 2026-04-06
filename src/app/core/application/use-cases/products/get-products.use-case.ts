import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Product } from '../../../domain/models/products/product.interface';
import { ProductPageResult, ProductSearchCriteria, ProductSortField } from '../../../domain/models/products/product-types';
import { CategoryId } from '../../../domain/models/products/category-types';
import { ProductStatus } from '../../../domain/models/products/product-status.enum';
import { PRODUCT_REPOSITORY_TOKEN } from '../../ports/product-repository.token';

/**
 * Use case for retrieving all products with optional filtering and pagination
 */
@Injectable({
  providedIn: 'root'
})
export class GetProductsUseCase {
  private readonly productRepository = inject(PRODUCT_REPOSITORY_TOKEN);

  execute(params?: {
    categoryId?: CategoryId;
    status?: ProductStatus;
    isVisible?: boolean;
    isFeatured?: boolean;
    priceMin?: number;
    priceMax?: number;
    query?: string;
    brand?: string;
    tags?: string[];
    page?: number;
    pageSize?: number;
    sortBy?: ProductSortField;
    sortOrder?: 'asc' | 'desc';
  }): Observable<ProductPageResult> {
    const criteria: ProductSearchCriteria = {
      categoryId: params?.categoryId,
      status: params?.status,
      isVisible: params?.isVisible,
      isFeatured: params?.isFeatured,
      priceMin: params?.priceMin,
      priceMax: params?.priceMax,
      query: params?.query,
      brand: params?.brand,
      tags: params?.tags,
      page: params?.page || 1,
      pageSize: params?.pageSize || 20,
      sortBy: params?.sortBy || ProductSortField.UPDATED_AT,
      sortOrder: params?.sortOrder || 'desc'
    };
    
    return this.productRepository.getAll(criteria);
  }

  /**
   * Get active products only (convenience method)
   */
  getActiveProducts(params?: {
    categoryId?: CategoryId;
    page?: number;
    pageSize?: number;
  }): Observable<Product[]> {
    return this.execute({
      ...params,
      status: ProductStatus.ACTIVE,
      isVisible: true
    }).pipe(
      map(result => result.products)
    );
  }

  /**
   * Get featured products (convenience method)
   */
  getFeaturedProducts(limit?: number): Observable<Product[]> {
    return this.productRepository.getFeatured(limit);
  }
}