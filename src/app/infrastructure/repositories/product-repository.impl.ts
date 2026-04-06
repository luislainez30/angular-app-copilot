import { Injectable, inject } from '@angular/core';
import { Observable, map, combineLatest } from 'rxjs';
import { IProductRepository } from '../../core/domain/repositories/product.repository';
import { 
  Product, 
  CreateProduct, 
  UpdateProduct, 
  ProductSummary 
} from '../../core/domain/models/products/product.interface';
import { 
  ProductId, 
  ProductPageResult, 
  ProductSearchCriteria,
  ProductFilterOptions,
  ProductSortField
} from '../../core/domain/models/products/product-types';
import { CategoryId } from '../../core/domain/models/products/category-types';
import { ProductMockService } from '../persistence/product-mock.service';

/**
 * Implementation of product repository using mock service
 * This can be swapped for API implementation later
 */
@Injectable({
  providedIn: 'root'
})
export class ProductRepositoryImpl implements IProductRepository {
  private mockService = inject(ProductMockService);

  getAll(criteria: ProductSearchCriteria): Observable<ProductPageResult> {
    // Extract pagination from criteria, provide defaults if not specified
    const page = criteria.page || 1;
    const pageSize = criteria.pageSize || 20;
    return this.mockService.getProducts(page, pageSize, criteria);
  }

  getById(id: ProductId): Observable<Product | null> {
    return this.mockService.getProductById(id);
  }

  getBySku(sku: string): Observable<Product | null> {
    // Use search functionality to find by SKU
    const criteria: ProductSearchCriteria = {
      query: sku,
      page: 1,
      pageSize: 1
    };
    return this.mockService.getProducts(1, 1, criteria).pipe(
      map(result => {
        const exactMatch = result.products.find(p => p.sku.toLowerCase() === sku.toLowerCase());
        return exactMatch || null;
      })
    );
  }

  getByIds(ids: ProductId[]): Observable<Product[]> {
    // For mock implementation, get each product individually
    // In a real API, this would be optimized with a batch request
    const requests = ids.map(id => this.mockService.getProductById(id));
    return combineLatest(requests).pipe(
      map(products => products.filter((p): p is Product => p !== null))
    );
  }

  create(product: CreateProduct): Observable<Product> {
    return this.mockService.createProduct(product);
  }

  update(id: ProductId, updates: UpdateProduct): Observable<Product> {
    return this.mockService.updateProduct(id, updates).pipe(
      map(product => {
        if (!product) {
          throw new Error(`Product with id ${id} not found`);
        }
        return product;
      })
    );
  }

  delete(id: ProductId): Observable<boolean> {
    return this.mockService.deleteProduct(id);
  }

  exists(id: ProductId): Observable<boolean> {
    return this.mockService.getProductById(id).pipe(
      map(product => product !== null)
    );
  }

  isSkuAvailable(sku: string, excludeId?: ProductId): Observable<boolean> {
    return this.mockService.isSkuAvailable(sku, excludeId);
  }

  getFeatured(limit?: number): Observable<Product[]> {
    return this.mockService.getFeaturedProducts(limit);
  }

  getByCategory(categoryId: string, criteria?: Partial<ProductSearchCriteria>): Observable<ProductPageResult> {
    const searchCriteria: ProductSearchCriteria = {
      categoryId: categoryId as CategoryId,
      page: criteria?.page || 1,
      pageSize: criteria?.pageSize || 20,
      ...criteria
    };
    return this.mockService.getProducts(searchCriteria.page!, searchCriteria.pageSize!, searchCriteria);
  }

  getByBrand(brand: string, criteria?: Partial<ProductSearchCriteria>): Observable<ProductPageResult> {
    const searchCriteria: ProductSearchCriteria = {
      brand,
      page: criteria?.page || 1,
      pageSize: criteria?.pageSize || 20,
      ...criteria
    };
    return this.mockService.getProducts(searchCriteria.page!, searchCriteria.pageSize!, searchCriteria);
  }

  search(query: string, criteria?: Partial<ProductSearchCriteria>): Observable<ProductPageResult> {
    const searchCriteria: ProductSearchCriteria = {
      query,
      page: criteria?.page || 1,
      pageSize: criteria?.pageSize || 20,
      ...criteria
    };
    return this.mockService.getProducts(searchCriteria.page!, searchCriteria.pageSize!, searchCriteria);
  }

  getLowStock(): Observable<ProductSummary[]> {
    // For mock implementation, return products with low inventory tracking
    // In a real implementation, this would check actual inventory levels
    return this.mockService.getProductSummaries().pipe(
      map(summaries => summaries.slice(0, 10)) // Mock: return first 10 as "low stock"
    );
  }

  getFilterOptions(): Observable<ProductFilterOptions> {
    return this.mockService.getProducts(1, 1000).pipe( // Get all products for filtering
      map(result => {
        const products = result.products;
        
        // Extract unique categories with counts
        const categoryMap = new Map<string, { id: CategoryId; name: string; count: number }>();
        products.forEach(p => {
          if (!categoryMap.has(p.categoryId)) {
            categoryMap.set(p.categoryId, {
              id: p.categoryId,
              name: `Category ${p.categoryId}`, // In real app, would resolve category name
              count: 0
            });
          }
          categoryMap.get(p.categoryId)!.count++;
        });

        // Extract unique brands with counts
        const brandMap = new Map<string, number>();
        products.forEach(p => {
          if (p.brand) {
            brandMap.set(p.brand, (brandMap.get(p.brand) || 0) + 1);
          }
        });

        // Extract statuses with counts
        const statusMap = new Map<string, number>();
        products.forEach(p => {
          statusMap.set(p.status, (statusMap.get(p.status) || 0) + 1);
        });

        // Extract unique tags with counts
        const tagMap = new Map<string, number>();
        products.forEach(p => {
          p.tags.forEach(tag => {
            tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
          });
        });

        // Calculate price range
        const prices = products.map(p => p.price);
        const priceRange = {
          min: Math.min(...prices),
          max: Math.max(...prices)
        };

        return {
          categories: Array.from(categoryMap.values()),
          brands: Array.from(brandMap.entries()).map(([name, count]) => ({ name, count })),
          statuses: Array.from(statusMap.entries()).map(([status, count]) => ({ 
            status: status as any, 
            count 
          })),
          priceRange,
          tags: Array.from(tagMap.entries()).map(([name, count]) => ({ name, count }))
        };
      })
    );
  }

  bulkUpdate(updates: Array<{ id: ProductId; updates: Partial<UpdateProduct> }>): Observable<Product[]> {
    // For mock implementation, update each product individually
    // In a real API, this would be optimized with a batch request
    const requests = updates.map(({ id, updates: productUpdates }) => 
      this.mockService.updateProduct(id, productUpdates)
    );
    
    return combineLatest(requests).pipe(
      map(products => products.filter((p): p is Product => p !== null))
    );
  }
}