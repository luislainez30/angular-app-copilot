import { Injectable, inject } from '@angular/core';
import { Observable, throwError, switchMap, catchError, tap } from 'rxjs';
import { Product, UpdateProduct } from '../../../domain/models/products/product.interface';
import { ProductId } from '../../../domain/models/products/product-types';
import { PRODUCT_REPOSITORY_TOKEN } from '../../ports/product-repository.token';
import { AlertService } from '../../services/alert.service';

/**
 * Use case for updating an existing product
 * Handles business logic validation and notifications
 */
@Injectable({
  providedIn: 'root'
})
export class UpdateProductUseCase {
  private readonly productRepository = inject(PRODUCT_REPOSITORY_TOKEN);
  private readonly alertService = inject(AlertService);

  /**
   * Update a product with business validations and notifications
   * @param id - The product ID to update
   * @param updates - The product updates to apply
   * @returns Observable of the updated product
   */
  execute(id: ProductId, updates: UpdateProduct): Observable<Product | null> {
    // Validate business rules before update
    const validationError = this.validateUpdateData(updates);
    if (validationError) {
      return throwError(() => new Error(validationError));
    }

    return this.productRepository.update(id, updates).pipe(
      tap((updatedProduct: Product | null) => {
        if (updatedProduct) {
          // Show success notification
          this.alertService.showSuccess(
            'Product Updated',
            `"${updatedProduct.name}" (SKU: ${updatedProduct.sku}) has been successfully updated.`
          );
          
          // Log update for audit trail
          console.log('Product updated successfully:', {
            id: updatedProduct.id,
            name: updatedProduct.name,
            sku: updatedProduct.sku,
            status: updatedProduct.status,
            price: updatedProduct.price
          });
        } else {
          // Product not found case
          this.alertService.showError(
            'Product Update Failed',
            'Product not found or has been deleted.'
          );
        }
      }),
      catchError((error) => {
        // Show error notification
        this.alertService.showError(
          'Product Update Failed',
          error.message || 'An unexpected error occurred while updating the product.'
        );
        
        // Log error for debugging
        console.error('Product update failed:', error);
        
        return throwError(() => error);
      })
    );
  }

  /**
   * Update product status (activate/deactivate) with notifications
   */
  updateStatus(id: ProductId, isActive: boolean): Observable<Product | null> {
    const statusText = isActive ? 'activated' : 'deactivated';
    
    return this.execute(id, { id, isActive }).pipe(
      tap((product) => {
        if (product) {
          this.alertService.showSuccess(
            'Status Updated',
            `Product "${product.name}" has been ${statusText}.`
          );
        }
      })
    );
  }

  /**
   * Update product featured status with notifications
   */
  updateFeaturedStatus(id: ProductId, isFeatured: boolean): Observable<Product | null> {
    const featuredText = isFeatured ? 'marked as featured' : 'removed from featured';
    
    return this.execute(id, { id, isFeatured }).pipe(
      tap((product) => {
        if (product) {
          this.alertService.showSuccess(
            'Featured Status Updated',
            `Product "${product.name}" has been ${featuredText}.`
          );
        }
      })
    );
  }

  /**
   * Update product pricing with validation and notifications
   */
  updatePricing(id: ProductId, pricing: {
    basePrice?: number;
    salePrice?: number;
    costPrice?: number;
    discountPercentage?: number;
  }): Observable<Product | null> {
    // Validate pricing data
    if (pricing.basePrice && pricing.basePrice <= 0) {
      return throwError(() => new Error('Base price must be greater than 0.'));
    }
    
    if (pricing.salePrice && pricing.salePrice <= 0) {
      return throwError(() => new Error('Sale price must be greater than 0.'));
    }
    
    if (pricing.costPrice && pricing.costPrice < 0) {
      return throwError(() => new Error('Cost price cannot be negative.'));
    }
    
    if (pricing.discountPercentage && (pricing.discountPercentage < 0 || pricing.discountPercentage > 100)) {
      return throwError(() => new Error('Discount percentage must be between 0 and 100.'));
    }
    
    return this.execute(id, { 
      id,
      basePrice: pricing.basePrice,
      salePrice: pricing.salePrice,
      costPrice: pricing.costPrice,
      discountPercentage: pricing.discountPercentage
    } as UpdateProduct).pipe(
      tap((product) => {
        if (product) {
          this.alertService.showSuccess(
            'Pricing Updated',
            `Pricing for "${product.name}" has been updated.`
          );
        }
      })
    );
  }

  /**
   * Validate update data against business rules
   * @param updates - Update data to validate
   * @returns Error message if validation fails, null if valid
   */
  private validateUpdateData(updates: UpdateProduct): string | null {
    // Name validation
    if (updates.name !== undefined) {
      if (!updates.name?.trim()) {
        return 'Product name cannot be empty.';
      }
      
      if (updates.name.length > 255) {
        return 'Product name cannot exceed 255 characters.';
      }
    }

    // SKU validation (if being updated)
    if (updates.sku !== undefined) {
      if (!updates.sku?.trim()) {
        return 'Product SKU cannot be empty.';
      }
      
      const skuPattern = /^[A-Z0-9\-_]+$/;
      if (!skuPattern.test(updates.sku)) {
        return 'SKU must contain only uppercase letters, numbers, hyphens, and underscores.';
      }
      
      if (updates.sku.length < 3 || updates.sku.length > 50) {
        return 'SKU must be between 3 and 50 characters.';
      }
    }

    // Price validation
    if (updates.price !== undefined) {
      if (updates.price <= 0) {
        return 'Product price must be greater than 0.';
      }
      
      if (updates.price > 999999.99) {
        return 'Product price cannot exceed $999,999.99.';
      }
    }

    // Cost price validation
    if (updates.costPrice !== undefined && updates.costPrice < 0) {
      return 'Cost price cannot be negative.';
    }

    // Weight validation
    if (updates.weight !== undefined && updates.weight < 0) {
      return 'Product weight cannot be negative.';
    }

    // Dimensions validation
    if (updates.dimensions) {
      if (updates.dimensions.length !== undefined && updates.dimensions.length <= 0) {
        return 'Length must be greater than 0.';
      }
      
      if (updates.dimensions.width !== undefined && updates.dimensions.width <= 0) {
        return 'Width must be greater than 0.';
      }
      
      if (updates.dimensions.height !== undefined && updates.dimensions.height <= 0) {
        return 'Height must be greater than 0.';
      }
    }

    return null; // All validations passed
  }
}