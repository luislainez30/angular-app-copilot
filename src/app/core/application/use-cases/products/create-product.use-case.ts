import { Injectable, inject } from '@angular/core';
import { Observable, throwError, switchMap, catchError, tap } from 'rxjs';
import { Product, CreateProduct } from '../../../domain/models/products/product.interface';
import { PRODUCT_REPOSITORY_TOKEN } from '../../ports/product-repository.token';
import { AlertService } from '../../services/alert.service';
import { ProductStatus } from '../../../domain/models/products/product-status.enum';

/**
 * Use case for creating a new product
 * Handles business logic validation and notifications
 */
@Injectable({
  providedIn: 'root'
})
export class CreateProductUseCase {
  private readonly productRepository = inject(PRODUCT_REPOSITORY_TOKEN);
  private readonly alertService = inject(AlertService);

  /**
   * Create a new product with business validations
   * @param productData - The product data to create
   * @returns Observable of the created product
   */
  execute(productData: CreateProduct): Observable<Product> {
    // Validate business rules before creation
    const validationError = this.validateProductData(productData);
    if (validationError) {
      return throwError(() => new Error(validationError));
    }

    // Check SKU availability first
    return this.productRepository.isSkuAvailable(productData.sku).pipe(
      switchMap(isAvailable => {
        if (!isAvailable) {
          throw new Error(`SKU "${productData.sku}" is already in use. Please choose a different SKU.`);
        }
        
        return this.productRepository.create(productData);
      }),
      tap((createdProduct: Product) => {
        // Show success notification
        this.alertService.showSuccess(
          'Product Created',
          `"${createdProduct.name}" (SKU: ${createdProduct.sku}) has been successfully created.`
        );
        
        // Log creation for audit trail
        console.log('Product created successfully:', {
          id: createdProduct.id,
          name: createdProduct.name,
          sku: createdProduct.sku,
          status: createdProduct.status,
          price: createdProduct.price
        });
      }),
      catchError((error) => {
        // Show error notification
        this.alertService.showError(
          'Product Creation Failed',
          error.message || 'An unexpected error occurred while creating the product.'
        );
        
        // Log error for debugging
        console.error('Product creation failed:', error);
        
        return throwError(() => error);
      })
    );
  }

  /**
   * Validate SKU availability before creating product
   * @param sku - SKU to validate
   * @returns Observable indicating if SKU is available
   */
  validateSku(sku: string): Observable<boolean> {
    return this.productRepository.isSkuAvailable(sku);
  }

  /**
   * Pre-validate product data without creating the product
   * Useful for form validation
   * @param productData - Product data to validate
   * @returns Promise resolving to validation result
   */
  async preValidateProduct(productData: CreateProduct): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    // Check business rules
    const businessValidationError = this.validateProductData(productData);
    if (businessValidationError) {
      errors.push(businessValidationError);
    }
    
    // Check SKU availability
    try {
      const isSkuAvailable = await this.validateSku(productData.sku).toPromise();
      if (!isSkuAvailable) {
        errors.push(`SKU "${productData.sku}" is already in use.`);
      }
    } catch (error) {
      errors.push('Unable to validate SKU availability.');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate product data against business rules
   * @param productData - Product data to validate
   * @returns Error message if validation fails, null if valid
   */
  private validateProductData(productData: CreateProduct): string | null {
    // Required fields validation
    if (!productData.name?.trim()) {
      return 'Product name is required.';
    }
    
    if (!productData.sku?.trim()) {
      return 'Product SKU is required.';
    }
    
    if (!productData.description?.trim()) {
      return 'Product description is required.';
    }
    
    // SKU format validation
    const skuPattern = /^[A-Z0-9\-_]+$/;
    if (!skuPattern.test(productData.sku)) {
      return 'SKU must contain only uppercase letters, numbers, hyphens, and underscores.';
    }
    
    if (productData.sku.length < 3 || productData.sku.length > 50) {
      return 'SKU must be between 3 and 50 characters.';
    }
    
    // Price validation
    if (productData.price <= 0) {
      return 'Product price must be greater than 0.';
    }
    
    if (productData.price > 999999.99) {
      return 'Product price cannot exceed $999,999.99.';
    }
    
    // Cost price validation
    if (productData.costPrice !== undefined && productData.costPrice < 0) {
      return 'Cost price cannot be negative.';
    }
    
    // Compare-at price validation
    if (productData.compareAtPrice !== undefined) {
      if (productData.compareAtPrice <= productData.price) {
        return 'Compare-at price must be higher than the selling price.';
      }
    }
    
    // Weight validation
    if (productData.weight !== undefined && productData.weight < 0) {
      return 'Product weight cannot be negative.';
    }
    
    // Category validation
    if (!productData.categoryId) {
      return 'Product category is required.';
    }
    
    // Barcode validation (if provided)
    if (productData.barcode) {
      const barcodePattern = /^[0-9]+$/;
      if (!barcodePattern.test(productData.barcode) || 
          productData.barcode.length < 8 || 
          productData.barcode.length > 14) {
        return 'Barcode must be 8-14 digits.';
      }
    }
    
    // Tags validation
    if (productData.tags && productData.tags.length > 10) {
      return 'Maximum 10 tags are allowed per product.';
    }
    
    // Status validation
    const validStatuses = Object.values(ProductStatus);
    if (productData.status && !validStatuses.includes(productData.status)) {
      return 'Invalid product status.';
    }
    
    return null; // All validations passed
  }
}