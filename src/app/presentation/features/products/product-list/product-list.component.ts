import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Domain models and types
import { Product } from '../../../../core/domain/models/products/product.interface';
import { 
  ProductId, 
  ProductPageResult, 
  ProductSearchCriteria, 
  ProductSortField 
} from '../../../../core/domain/models/products/product-types';
import { CategoryId } from '../../../../core/domain/models/products/category-types';
import { ProductStatus } from '../../../../core/domain/models/products/product-status.enum';

// Use cases
import { GetProductsUseCase } from '../../../../core/application/use-cases/products/get-products.use-case';
import { DeleteProductUseCase } from '../../../../core/application/use-cases/products/delete-product.use-case';

// Utilities
import { getProductStatusLabel } from '../../../../core/domain/models/products/product-status.enum';

// Shared components
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';

interface ProductWithComputed extends Product {
  readonly formattedPrice: string;
  readonly isOnSale: boolean;
  readonly discountPercentage: number;
}

function enrichProduct(product: Product): ProductWithComputed {
  const isOnSale = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = isOnSale 
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  return {
    ...product,
    formattedPrice: `$${product.price.toFixed(2)}`,
    isOnSale,
    discountPercentage
  };
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageTitleComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  // Dependencies
  private getProductsUseCase = inject(GetProductsUseCase);
  private deleteProductUseCase = inject(DeleteProductUseCase);
  private router = inject(Router);

  // Component state
  products: ProductWithComputed[] = [];
  loading = false;
  error: string | null = null;

  // Search and filter state
  searchQuery = '';
  selectedStatus: ProductStatus | '' = '';
  selectedCategory: CategoryId | '' = '';
  selectedBrand: string = '';

  // Sorting state
  sortField: ProductSortField = ProductSortField.UPDATED_AT;
  sortOrder: 'asc' | 'desc' = 'desc';

  // Pagination state
  currentPage = 1;
  pageSize = 10;
  totalProducts = 0;
  totalPages = 0;

  // Enum references for template
  ProductSortField = ProductSortField;
  ProductStatus = ProductStatus;

  // Available filter options
  statusOptions = Object.values(ProductStatus);
  brandOptions: string[] = [];

  // Actions menu state
  openActionsMenuId: ProductId | null = null;

  ngOnInit(): void {
    this.loadProducts();
  }

  /**
   * Load products with current filters and pagination
   */
  loadProducts(): void {
    this.loading = true;
    this.error = null;

    const criteria: ProductSearchCriteria = {
      query: this.searchQuery || undefined,
      status: this.selectedStatus || undefined,
      categoryId: this.selectedCategory || undefined,
      brand: this.selectedBrand || undefined,
      sortBy: this.sortField,
      sortOrder: this.sortOrder,
      page: this.currentPage,
      pageSize: this.pageSize,
      isVisible: true // Only show visible products by default
    };

    this.getProductsUseCase.execute(criteria).subscribe({
      next: (result: ProductPageResult) => {
        this.products = result.products.map(enrichProduct);
        this.totalProducts = result.total;
        this.totalPages = result.totalPages;
        this.loading = false;
        
        // Update brand options from results
        if (result.filters?.brands) {
          this.brandOptions = result.filters.brands;
        }
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        this.error = 'Failed to load products. Please try again.';
        this.loading = false;
      }
    });
  }

  /**
   * Handle search input
   */
  onSearch(): void {
    this.currentPage = 1; // Reset to first page
    this.loadProducts();
  }

  /**
   * Handle status filter change
   */
  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  /**
   * Handle category filter change
   */
  onCategoryFilterChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  /**
   * Handle brand filter change
   */
  onBrandFilterChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.currentPage = 1;
    this.loadProducts();
  }

  /**
   * Handle column sorting
   */
  onSort(field: ProductSortField): void {
    if (this.sortField === field) {
      // Toggle order if same field
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new field with default order
      this.sortField = field;
      this.sortOrder = 'desc';
    }
    this.currentPage = 1;
    this.loadProducts();
  }

  /**
   * Get sort icon for column header
   */
  getSortIcon(field: ProductSortField): string {
    if (this.sortField !== field) return 'sort';
    return this.sortOrder === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  }

  /**
   * Check if column is currently sorted
   */
  isSorted(field: ProductSortField): boolean {
    return this.sortField === field;
  }

  /**
   * Navigation methods
   */
  navigateToAdd(): void {
    this.router.navigate(['/products/add']);
  }

  viewProduct(productId: ProductId): void {
    this.router.navigate(['/products', productId]);
  }

  editProduct(productId: ProductId): void {
    this.router.navigate(['/products', productId, 'edit']);
  }

  /**
   * Delete product with confirmation
   */
  deleteProduct(product: ProductWithComputed): void {
    const confirmed = confirm(
      `Are you sure you want to delete "${product.name}"?\n` +
      `SKU: ${product.sku}\n\n` +
      'This action cannot be undone.'
    );

    if (confirmed) {
      this.deleteProductUseCase.execute(product.id).subscribe({
        next: (success) => {
          if (success) {
            this.loadProducts(); // Reload to update the list
          } else {
            alert('Failed to delete product. Please try again.');
          }
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          alert('An error occurred while deleting the product.');
        }
      });
    }
  }

  /**
   * Pagination methods
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const half = Math.floor(maxVisiblePages / 2);

    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (end - start < maxVisiblePages - 1) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Utility methods for template
   */
  getProductStatusLabel(status: ProductStatus): string {
    return getProductStatusLabel(status);
  }

  getStatusBadgeClasses(status: ProductStatus): string {
    switch (status) {
      case ProductStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case ProductStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800';
      case ProductStatus.DISCONTINUED:
        return 'bg-red-100 text-red-800';
      case ProductStatus.DRAFT:
        return 'bg-yellow-100 text-yellow-800';
      case ProductStatus.OUT_OF_STOCK:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Format price with discount display
   */
  formatPriceDisplay(product: ProductWithComputed): string {
    if (product.isOnSale) {
      return `${product.formattedPrice} (${product.discountPercentage}% off)`;
    }
    return product.formattedPrice;
  }

  /**
   * Actions menu management
   */
  toggleActionsMenu(productId: ProductId): void {
    this.openActionsMenuId = this.openActionsMenuId === productId ? null : productId;
  }

  isActionsMenuOpen(productId: ProductId): boolean {
    return this.openActionsMenuId === productId;
  }

  closeActionsMenu(): void {
    this.openActionsMenuId = null;
  }

  /**
   * Navigate to inventory management for a product
   */
  manageInventory(productId: ProductId): void {
    this.router.navigate(['/products', productId, 'inventory']);
  }

  /**
   * TrackBy function for ngFor performance optimization
   */
  trackByProductId(index: number, product: ProductWithComputed): ProductId {
    return product.id;
  }
}