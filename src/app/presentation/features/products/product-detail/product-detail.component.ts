import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { PageTitleComponent } from '../../../shared/components';
import { Product, ProductId } from '../../../../core/domain/models/products';
import { ProductStatus, getProductStatusLabel } from '../../../../core/domain/models/products/product-status.enum';
import { InventoryTrackingMethod } from '../../../../core/domain/models/inventory/inventory.interface';
import { 
  GetProductUseCase,
  DeleteProductUseCase
} from '../../../../core/application/use-cases/products';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PageTitleComponent
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  loading = true;
  error: string | null = null;
  productId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private getProductUseCase: GetProductUseCase,
    private deleteProductUseCase: DeleteProductUseCase
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.productId = params['id'];
        if (this.productId) {
          this.loadProduct();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProduct(): void {
    if (!this.productId) return;

    this.loading = true;
    this.error = null;

    this.getProductUseCase.executeById(this.productId as ProductId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          if (product) {
            this.product = product;
          } else {
            this.error = 'Product not found. It may have been deleted or moved.';
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading product:', err);
          this.error = 'Failed to load product details. Please try again.';
          this.loading = false;
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  editProduct(): void {
    if (this.productId) {
      this.router.navigate(['/products', this.productId, 'edit']);
    }
  }

  deleteProduct(): void {
    if (!this.product) return;

    const confirmed = confirm(
      `Are you sure you want to delete "${this.product.name}"?\n\n` +
      `SKU: ${this.product.sku}\n` +
      `This action cannot be undone and will permanently remove the product.`
    );

    if (confirmed) {
      this.deleteProductUseCase.execute(this.product.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              // Navigate back to product list after successful deletion
              this.router.navigate(['/products']);
            } else {
              alert('Failed to delete product. Please try again.');
            }
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            alert('An error occurred while deleting the product.');
          }
        });
    }
  }

  duplicateProduct(): void {
    if (!this.product) return;
    // Navigate to create form with product data as initial values
    this.router.navigate(['/products/add'], {
      queryParams: { duplicate: this.product.id }
    });
  }

  manageInventory(): void {
    if (!this.productId) return;
    this.router.navigate(['/products', this.productId, 'inventory']);
  }

  shareProduct(): void {
    if (!this.product) return;
    // TODO: Implement product sharing functionality
    // For now, copy product URL to clipboard
    const url = `${window.location.origin}/products/${this.product.id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Product URL copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy URL to clipboard.');
    });
  }

  // Utility methods for template
  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatWeight(weight: number): string {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)} kg`;
    }
    return `${weight} g`;
  }

  formatDimensions(): string {
    if (!this.product?.dimensions) return 'Not specified';
    
    const { length, width, height, unit } = this.product.dimensions;
    return `${length} × ${width} × ${height} ${unit}`;
  }

  getStatusClass(status: ProductStatus): string {
    switch (status) {
      case ProductStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case ProductStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800';
      case ProductStatus.DRAFT:
        return 'bg-yellow-100 text-yellow-800';
      case ProductStatus.DISCONTINUED:
        return 'bg-red-100 text-red-800';
      case ProductStatus.OUT_OF_STOCK:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: ProductStatus): string {
    return getProductStatusLabel(status);
  }

  getInventoryTrackingLabel(method: InventoryTrackingMethod): string {
    switch (method) {
      case InventoryTrackingMethod.NONE:
        return 'No Tracking';
      case InventoryTrackingMethod.SIMPLE:
        return 'Simple Tracking';
      case InventoryTrackingMethod.DETAILED:
        return 'Detailed Tracking';
      default:
        return 'Unknown';
    }
  }

  getDaysSinceCreation(): number {
    if (!this.product?.createdAt) return 0;
    const createdDate = new Date(this.product.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDiscountPercentage(): number {
    if (!this.product?.compareAtPrice || !this.product?.price) return 0;
    return Math.round(((this.product.compareAtPrice - this.product.price) / this.product.compareAtPrice) * 100);
  }

  isOnSale(): boolean {
    return this.getDiscountPercentage() > 0;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast notification here
      console.log('Copied to clipboard:', text);
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
    });
  }

  openProductUrl(): void {
    if (this.product?.thumbnailUrl) {
      window.open(this.product.thumbnailUrl, '_blank');
    }
  }

  sendProductEmail(): void {
    if (!this.product) return;
    
    const subject = encodeURIComponent(`Product Information: ${this.product.name}`);
    const body = encodeURIComponent(
      `Product: ${this.product.name}\n` +
      `SKU: ${this.product.sku}\n` +
      `Price: ${this.formatCurrency(this.product.price)}\n` +
      `Description: ${this.product.description}`
    );
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

}