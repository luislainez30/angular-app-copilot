import { Observable } from 'rxjs';
import { 
  Product, 
  CreateProduct, 
  UpdateProduct, 
  ProductSummary 
} from '../models/products/product.interface';
import { 
  ProductId, 
  ProductPageResult, 
  ProductSearchCriteria,
  ProductFilterOptions 
} from '../models/products/product-types';

/**
 * Product repository interface - defines data access contract for products
 * Infrastructure layer will implement this interface
 */
export interface IProductRepository {
  /**
   * Get paginated products with search and filtering
   */
  getAll(criteria: ProductSearchCriteria): Observable<ProductPageResult>;

  /**
   * Get product by ID
   */
  getById(id: ProductId): Observable<Product | null>;

  /**
   * Get product by SKU (alternative unique identifier)
   */
  getBySku(sku: string): Observable<Product | null>;

  /**
   * Get multiple products by IDs
   */
  getByIds(ids: ProductId[]): Observable<Product[]>;

  /**
   * Create new product
   */
  create(product: CreateProduct): Observable<Product>;

  /**
   * Update existing product
   */
  update(id: ProductId, updates: UpdateProduct): Observable<Product>;

  /**
   * Delete product
   */
  delete(id: ProductId): Observable<boolean>;

  /**
   * Check if product exists
   */
  exists(id: ProductId): Observable<boolean>;

  /**
   * Check if SKU is available (for validation)
   */
  isSkuAvailable(sku: string, excludeId?: ProductId): Observable<boolean>;

  /**
   * Get featured products
   */
  getFeatured(limit?: number): Observable<Product[]>;

  /**
   * Get products by category
   */
  getByCategory(categoryId: string, criteria?: Partial<ProductSearchCriteria>): Observable<ProductPageResult>;

  /**
   * Get products by brand
   */
  getByBrand(brand: string, criteria?: Partial<ProductSearchCriteria>): Observable<ProductPageResult>;

  /**
   * Search products (full-text search)
   */
  search(query: string, criteria?: Partial<ProductSearchCriteria>): Observable<ProductPageResult>;

  /**
   * Get low stock products (based on inventory levels)
   */
  getLowStock(): Observable<ProductSummary[]>;

  /**
   * Get filter options for product search UI
   */
  getFilterOptions(): Observable<ProductFilterOptions>;

  /**
   * Bulk update products (for batch operations)
   */
  bulkUpdate(updates: Array<{ id: ProductId; updates: Partial<UpdateProduct> }>): Observable<Product[]>;
}