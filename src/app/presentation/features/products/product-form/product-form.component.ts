import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';

import { PageTitleComponent } from '../../../shared/components';
import { 
  ProductFormBuilderService, 
  ProductFormConfig, 
  ProductFormSection, 
  ProductFormFieldConfig, 
  ProductFormFieldType, 
  ProductFormFieldOption
} from '../services/product-form-builder.service';
import { CreateProduct, Product, ProductId } from '../../../../core/domain/models/products';
import { 
  GetProductUseCase,
  CreateProductUseCase,
  UpdateProductUseCase
} from '../../../../core/application/use-cases/products';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink, 
    PageTitleComponent
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit, OnDestroy {
  productForm!: FormGroup;
  formConfig!: ProductFormConfig;
  isEditMode = false;
  productId: ProductId | null = null;
  isSubmitting = false;
  showDebugInfo = false; // Set to true for development
  
  // Expose enum for template
  ProductFormFieldType = ProductFormFieldType;
  
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: ProductFormBuilderService,
    private getProductUseCase: GetProductUseCase,
    private createProductUseCase: CreateProductUseCase,
    private updateProductUseCase: UpdateProductUseCase,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupRouteHandling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.formConfig = this.formBuilder.getFormConfiguration();
    this.productForm = this.formBuilder.buildProductForm();
    
    // Update submit label based on mode
    if (this.isEditMode) {
      this.formConfig.submitLabel = 'Update Product';
    }
  }

  private setupRouteHandling(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.productId = params['id'] || null;
        this.isEditMode = !!this.productId;
        
        if (this.isEditMode) {
          this.loadProductData();
        }
        
        // Update form configuration after mode is determined
        this.updateFormConfiguration();
      });
  }

  private updateFormConfiguration(): void {
    if (this.isEditMode) {
      this.formConfig.submitLabel = 'Update Product';
    } else {
      this.formConfig.submitLabel = 'Create Product';
    }
  }

  private loadProductData(): void {
    if (!this.productId) return;
    
    this.getProductUseCase.executeById(this.productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          if (product) {
            this.populateFormWithProductData(product);
          } else {
            // Navigate back to list if product doesn't exist
            this.router.navigate(['/products']);
          }
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.router.navigate(['/products']);
        }
      });
  }
  
  private populateFormWithProductData(product: Product): void {
    // Create form data that matches the form structure
    const formData = {
      name: product.name,
      shortDescription: product.shortDescription || '',
      description: product.description,
      sku: product.sku,
      barcode: product.barcode || '',
      categoryId: product.categoryId,
      brand: product.brand || '',
      manufacturer: product.manufacturer || '',
      tags: product.tags?.join(', ') || '',
      price: product.price,
      costPrice: product.costPrice || '',
      compareAtPrice: product.compareAtPrice || '',
      weight: product.weight || '',
      dimensionsLength: product.dimensions?.length || '',
      dimensionsWidth: product.dimensions?.width || '',
      dimensionsHeight: product.dimensions?.height || '',
      trackInventory: product.trackInventory,
      allowBackorder: product.allowBackorder,
      requiresShipping: product.requiresShipping,
      thumbnailUrl: product.thumbnailUrl || '',
      images: product.images?.join('\n') || '',
      metaTitle: product.metaTitle || '',
      metaDescription: product.metaDescription || '',
      status: product.status,
      isVisible: product.isVisible,
      isFeatured: product.isFeatured,
      notes: product.notes || ''
    };
    
    this.productForm.patchValue(formData);
  }

  onSubmit(): void {
    // First check basic form validity
    if (this.productForm.invalid) {
      this.markAllFieldsAsTouched();
      this.scrollToFirstError();
      return;
    }

    this.isSubmitting = true;
    
    try {
      const productData: CreateProduct = this.formBuilder.transformFormToProduct(this.productForm.value);
      
      if (this.isEditMode && this.productId) {
        // Update existing product
        this.updateProductUseCase.execute(this.productId, {
          ...productData,
          id: this.productId,
        })
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isSubmitting = false)
        )
        .subscribe({
          next: (updatedProduct) => {
            if (updatedProduct) {
              this.handleFormSubmissionSuccess('Product updated successfully', updatedProduct);
            } else {
              this.handleFormSubmissionError('Product not found');
            }
          },
          error: (error) => {
            this.handleFormSubmissionError(error.message || 'Failed to update product');
          }
        });
      } else {
        // Create new product - enhanced with validation feedback
        this.createProductUseCase.execute(productData)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isSubmitting = false)
        )
        .subscribe({
          next: (newProduct) => {
            this.handleFormSubmissionSuccess('Product created successfully', newProduct);
          },
          error: (error) => {
            // Enhanced error handling with specific validation messages
            this.handleFormSubmissionError(error.message || 'Failed to create product');
          }
        });
      }
    } catch (error: any) {
      // Handle form transformation errors
      this.isSubmitting = false;
      this.handleFormSubmissionError(error.message || 'Invalid form data');
    }
  }

  private handleFormSubmissionSuccess(message: string, product: Product): void {
    console.log('Product operation successful:', {
      message,
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        status: product.status
      }
    });
    
    // Both CreateProductUseCase and UpdateProductUseCase show success alerts via AlertService
    // Navigate back to product list after short delay to show success message
    setTimeout(() => {
      this.router.navigate(['/products']);
    }, 1000);
  }

  private handleFormSubmissionError(message: string): void {
    console.error('Product operation failed:', message);
    
    // Both CreateProductUseCase and UpdateProductUseCase show error alerts via AlertService
    // Additional client-side feedback could be added here if needed
    
    // Scroll to top to ensure user sees any validation messages
    this.scrollToTop();
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      if (control) {
        control.markAsTouched();
      }      
    });
  }

  /**
   * Scroll to the first form error for better UX
   */
  private scrollToFirstError(): void {
    setTimeout(() => {
      const firstErrorElement = document.querySelector('.text-red-600');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  /**
   * Scroll to top of form
   */
  private scrollToTop(): void {
    setTimeout(() => {
      const formElement = document.querySelector('.product-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  }

  /**
   * Check if form can be submitted (for template)
   */
  canSubmit(): boolean {
    return this.productForm.valid && !this.isSubmitting;
  }

  /**
   * Get current form validation status for debugging
   */
  getFormValidationSummary(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      if (control?.errors && (control.dirty || control.touched)) {
        const fieldErrors = this.getFieldErrorMessages(key);
        if (fieldErrors.length > 0) {
          errors.push(`${key}: ${fieldErrors.join(', ')}`);
        }
      }
    });
    
    return {
      valid: this.productForm.valid,
      errors
    };
  }

  // Template Helper Methods
  trackBySection(index: number, section: ProductFormSection): string {
    return section.key;
  }

  trackByField(index: number, field: ProductFormFieldConfig): string {
    return field.key;
  }

  trackByOption(index: number, option: ProductFormFieldOption): any {
    return option.value;
  }

  isTextInput(fieldType: ProductFormFieldType): boolean {
    return [
      ProductFormFieldType.TEXT,
      ProductFormFieldType.URL
    ].includes(fieldType);
  }

  isNumberInput(fieldType: ProductFormFieldType): boolean {
    return fieldType === ProductFormFieldType.NUMBER;
  }

  isTextareaInput(fieldType: ProductFormFieldType): boolean {
    return [
      ProductFormFieldType.TEXTAREA,
      ProductFormFieldType.TAGS
    ].includes(fieldType);
  }

  isSelectInput(fieldType: ProductFormFieldType): boolean {
    return fieldType === ProductFormFieldType.SELECT;
  }

  isRadioInput(fieldType: ProductFormFieldType): boolean {
    return fieldType === ProductFormFieldType.RADIO;
  }

  isCheckboxInput(fieldType: ProductFormFieldType): boolean {
    return fieldType === ProductFormFieldType.CHECKBOX;
  }

  getInputType(fieldType: ProductFormFieldType): string {
    switch (fieldType) {
      case ProductFormFieldType.URL: return 'url';
      case ProductFormFieldType.NUMBER: return 'number';
      default: return 'text';
    }
  }

  getFieldColumnSpan(field: ProductFormFieldConfig): string {
    // Full width fields
    const fullWidthFields = [
      'description', 'shortDescription', 'images', 'metaDescription', 
      'notes', 'tags', 'trackInventory'
    ];
    
    if (fullWidthFields.includes(field.key) || field.type === ProductFormFieldType.TEXTAREA) {
      return 'md:col-span-2';
    }
    
    return 'md:col-span-1';
  }

  getInputClasses(fieldKey: string): string {
    const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-colors';
    
    if (this.isFieldInvalid(fieldKey)) {
      return `${baseClasses} border-red-300 text-red-900 placeholder-red-300 focus:border-red-300 focus:ring-red-500`;
    }
    
    return `${baseClasses} border-slate-300 placeholder-slate-400 focus:border-blue-500`;
  }

  getTextareaClasses(fieldKey: string): string {
    const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-colors resize-vertical';
    
    if (this.isFieldInvalid(fieldKey)) {
      return `${baseClasses} border-red-300 text-red-900 placeholder-red-300 focus:border-red-300 focus:ring-red-500`;
    }
    
    return `${baseClasses} border-slate-300 placeholder-slate-400 focus:border-blue-500`;
  }

  getSelectClasses(fieldKey: string): string {
    const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-colors';
    
    if (this.isFieldInvalid(fieldKey)) {
      return `${baseClasses} border-red-300 text-red-900 focus:border-red-300 focus:ring-red-500`;
    }
    
    return `${baseClasses} border-slate-300 focus:border-blue-500`;
  }

  getCheckboxClasses(fieldKey: string): string {
    const baseClasses = 'h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 transition-colors';
    
    if (this.isFieldInvalid(fieldKey)) {
      return `${baseClasses} border-red-300 focus:ring-red-500`;
    }
    
    return baseClasses;
  }

  getRadioClasses(fieldKey: string): string {
    const baseClasses = 'h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500 transition-colors';
    
    if (this.isFieldInvalid(fieldKey)) {
      return `${baseClasses} border-red-300 focus:ring-red-500`;
    }
    
    return baseClasses;
  }

  getSubmitButtonClasses(): string {
    const baseClasses = 'px-6 py-2 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors';
    
    if (this.productForm.invalid || this.isSubmitting) {
      return `${baseClasses} bg-slate-400 cursor-not-allowed`;
    }
    
    return `${baseClasses} bg-blue-600 hover:bg-blue-700`;
  }

  isFieldInvalid(fieldKey: string): boolean {
    const control = this.productForm.get(fieldKey);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldErrorMessages(fieldKey: string): string[] {
    const control = this.productForm.get(fieldKey);
    if (!control || !control.errors) {
      return [];
    }
    
    const formErrors = this.formBuilder.validateForm(this.productForm);
    return formErrors[fieldKey] || [];
  }

  getLabelClasses(): string {
    return 'block text-sm font-medium text-slate-700 mb-1';
  }

  getRequiredIndicatorClasses(): string {
    return 'text-red-500 ml-1';
  }

  getHintClasses(): string {
    return 'text-xs text-slate-500 mt-1';
  }

  getErrorClasses(): string {
    return 'text-xs text-red-600 mt-1';
  }

  getSectionTitleClasses(): string {
    return 'text-lg font-semibold text-slate-800 mb-2';
  }

  getSectionDescriptionClasses(): string {
    return 'text-sm text-slate-600 mb-4';
  }
}