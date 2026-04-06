import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, FormArray } from '@angular/forms';
import { CreateProduct } from '../../../../core/domain/models/products/product.interface';
import { CategoryId } from '../../../../core/domain/models/products/category-types';
import { ProductStatus, getProductStatusLabel } from '../../../../core/domain/models/products/product-status.enum';
import { InventoryTrackingMethod } from '../../../../core/domain/models/inventory/inventory.interface';
import { ProductDimensions } from '../../../../core/domain/models/products';

/**
 * Form field configuration interface
 */
export interface ProductFormFieldConfig {
  key: string;
  label: string;
  type: ProductFormFieldType;
  required: boolean;
  validators?: ValidatorFn[];
  options?: ProductFormFieldOption[];
  placeholder?: string;
  hint?: string;
  group?: string;
  order: number;
  suffix?: string; // For units like $, kg, cm
  min?: number;
  max?: number;
  step?: number; // For number inputs
}

/**
 * Form field option for select/radio fields
 */
export interface ProductFormFieldOption {
  value: any;
  label: string;
  disabled?: boolean;
}

/**
 * Form field types supported by the product form
 */
export enum ProductFormFieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  SELECT = 'select',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  TAGS = 'tags', // Special type for tag input
  IMAGE_UPLOAD = 'image-upload',
  URL = 'url'
}

/**
 * Form section for organizing related fields
 */
export interface ProductFormSection {
  key: string;
  title: string;
  description?: string;
  fields: ProductFormFieldConfig[];
  order: number;
}

/**
 * Complete product form configuration
 */
export interface ProductFormConfig {
  sections: ProductFormSection[];
  submitLabel: string;
  cancelLabel: string;
}

/**
 * Service responsible for building and managing product creation/update forms
 * Moved to presentation layer for proper clean architecture
 */
@Injectable({
  providedIn: 'root'
})
export class ProductFormBuilderService {

  constructor(private fb: FormBuilder) {}

  /**
   * Build the complete product creation form
   */
  buildProductForm(initialData?: Partial<CreateProduct>): FormGroup {
    const formConfig = this.getFormConfiguration();
    return this.createFormFromConfig(formConfig, initialData);
  }

  /**
   * Get the complete form configuration with all fields and sections
   */
  getFormConfiguration(): ProductFormConfig {
    return {
      sections: [
        this.getBasicInformationSection(),
        this.getCategoryClassificationSection(),
        this.getPricingSection(),
        this.getPhysicalPropertiesSection(),
        this.getInventorySettingsSection(),
        this.getMediaSeoSection(),
        this.getStatusVisibilitySection()
      ],
      submitLabel: 'Create Product',
      cancelLabel: 'Cancel'
    };
  }

  /**
   * Get all form fields organized by sections
   */
  getFormFields(): ProductFormFieldConfig[] {
    const config = this.getFormConfiguration();
    return config.sections.flatMap(section => section.fields)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Validate the entire form and return validation errors
   */
  validateForm(form: FormGroup): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control && control.errors) {
        errors[key] = this.getFieldErrors(control);
      }
    });

    return errors;
  }

  /**
   * Transform form data to CreateProduct interface
   */
  transformFormToProduct(formValue: any): CreateProduct {
    const product: CreateProduct = {
      name: formValue.name?.trim(),
      description: formValue.description?.trim(),
      shortDescription: formValue.shortDescription?.trim() || undefined,
      sku: formValue.sku?.trim().toUpperCase(),
      barcode: formValue.barcode?.trim() || undefined,
      categoryId: formValue.categoryId as CategoryId,
      brand: formValue.brand?.trim() || undefined,
      manufacturer: formValue.manufacturer?.trim() || undefined,
      price: parseFloat(formValue.price) || 0,
      costPrice: formValue.costPrice ? parseFloat(formValue.costPrice) : undefined,
      compareAtPrice: formValue.compareAtPrice ? parseFloat(formValue.compareAtPrice) : undefined,
      weight: formValue.weight ? parseFloat(formValue.weight) : undefined,
      dimensions: this.buildDimensions(formValue),
      trackInventory: formValue.trackInventory || InventoryTrackingMethod.SIMPLE,
      allowBackorder: formValue.allowBackorder ?? false,
      requiresShipping: formValue.requiresShipping ?? true,
      images: this.processImageUrls(formValue.images) || [],
      thumbnailUrl: formValue.thumbnailUrl?.trim() || undefined,
      metaTitle: formValue.metaTitle?.trim() || undefined,
      metaDescription: formValue.metaDescription?.trim() || undefined,
      tags: this.processTags(formValue.tags) || [],
      status: formValue.status || ProductStatus.DRAFT,
      isVisible: formValue.isVisible ?? false,
      isFeatured: formValue.isFeatured ?? false,
      notes: formValue.notes?.trim() || undefined,
      externalId: formValue.externalId?.trim() || undefined
    };

    return product;
  }

  /**
   * Get basic information section fields
   */
  private getBasicInformationSection(): ProductFormSection {
    return {
      key: 'basicInfo',
      title: 'Basic Information',
      description: 'Essential product details and identifiers',
      order: 1,
      fields: [
        {
          key: 'name',
          label: 'Product Name',
          type: ProductFormFieldType.TEXT,
          required: true,
          validators: [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
            this.noSpecialCharactersValidator()
          ],
          placeholder: 'Enter product name',
          hint: 'Minimum 3 characters, maximum 100 characters',
          group: 'basicInfo',
          order: 1
        },
        {
          key: 'shortDescription',
          label: 'Short Description',
          type: ProductFormFieldType.TEXT,
          required: false,
          validators: [
            Validators.maxLength(160)
          ],
          placeholder: 'Brief product description for listings',
          hint: 'Maximum 160 characters - used in product listings and search results',
          group: 'basicInfo',
          order: 2
        },
        {
          key: 'description',
          label: 'Full Description',
          type: ProductFormFieldType.TEXTAREA,
          required: true,
          validators: [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(2000)
          ],
          placeholder: 'Detailed product description',
          hint: 'Minimum 10 characters - provide comprehensive product information',
          group: 'basicInfo',
          order: 3
        },
        {
          key: 'sku',
          label: 'SKU (Stock Keeping Unit)',
          type: ProductFormFieldType.TEXT,
          required: true,
          validators: [
            Validators.required,
            Validators.pattern(/^[A-Z0-9\-_]+$/),
            Validators.minLength(3),
            Validators.maxLength(50)
          ],
          placeholder: 'PROD-001',
          hint: 'Unique identifier - letters, numbers, hyphens, underscores only',
          group: 'basicInfo',
          order: 4
        },
        {
          key: 'barcode',
          label: 'Barcode (UPC/EAN)',
          type: ProductFormFieldType.TEXT,
          required: false,
          validators: [
            Validators.pattern(/^[0-9]+$/),
            Validators.minLength(8),
            Validators.maxLength(14)
          ],
          placeholder: '123456789012',
          hint: 'Optional - 8-14 digit barcode number',
          group: 'basicInfo',
          order: 5
        }
      ]
    };
  }

  /**
   * Get category and classification section fields
   */
  private getCategoryClassificationSection(): ProductFormSection {
    return {
      key: 'categoryClassification',
      title: 'Category & Classification',
      description: 'Product categorization and brand information',
      order: 2,
      fields: [
        {
          key: 'categoryId',
          label: 'Product Category',
          type: ProductFormFieldType.SELECT,
          required: true,
          validators: [Validators.required],
          options: this.getCategoryOptions(),
          placeholder: 'Select category',
          hint: 'Choose the most appropriate category for this product',
          group: 'categoryClassification',
          order: 6
        },
        {
          key: 'brand',
          label: 'Brand',
          type: ProductFormFieldType.TEXT,
          required: false,
          validators: [
            Validators.maxLength(50),
            this.alphaNumericSpacesValidator()
          ],
          placeholder: 'Enter brand name',
          hint: 'Product brand or manufacturer brand',
          group: 'categoryClassification',
          order: 7
        },
        {
          key: 'manufacturer',
          label: 'Manufacturer',
          type: ProductFormFieldType.TEXT,
          required: false,
          validators: [
            Validators.maxLength(100)
          ],
          placeholder: 'Enter manufacturer name',
          hint: 'Company that produces this product',
          group: 'categoryClassification',
          order: 8
        },
        {
          key: 'tags',
          label: 'Search Tags',
          type: ProductFormFieldType.TAGS,
          required: false,
          validators: [
            this.tagsValidator(10) // Maximum 10 tags
          ],
          placeholder: 'Add tags separated by commas',
          hint: 'Keywords to help customers find this product (max 10 tags)',
          group: 'categoryClassification',
          order: 9
        }
      ]
    };
  }

  /**
   * Get pricing section fields
   */
  private getPricingSection(): ProductFormSection {
    return {
      key: 'pricing',
      title: 'Pricing',
      description: 'Product pricing and cost information',
      order: 3,
      fields: [
        {
          key: 'price',
          label: 'Selling Price',
          type: ProductFormFieldType.NUMBER,
          required: true,
          validators: [
            Validators.required,
            Validators.min(0.01),
            Validators.max(999999.99)
          ],
          placeholder: '0.00',
          hint: 'Customer-facing price in USD',
          suffix: '$',
          min: 0.01,
          max: 999999.99,
          step: 0.01,
          group: 'pricing',
          order: 10
        },
        {
          key: 'costPrice',
          label: 'Cost Price',
          type: ProductFormFieldType.NUMBER,
          required: false,
          validators: [
            Validators.min(0),
            Validators.max(999999.99)
          ],
          placeholder: '0.00',
          hint: 'Your cost from supplier (optional)',
          suffix: '$',
          min: 0,
          max: 999999.99,
          step: 0.01,
          group: 'pricing',
          order: 11
        },
        {
          key: 'compareAtPrice',
          label: 'Compare At Price (MSRP)',
          type: ProductFormFieldType.NUMBER,
          required: false,
          validators: [
            Validators.min(0),
            Validators.max(999999.99),
            this.compareAtPriceValidator()
          ],
          placeholder: '0.00',
          hint: 'Original/MSRP price to show savings (must be higher than selling price)',
          suffix: '$',
          min: 0,
          max: 999999.99,
          step: 0.01,
          group: 'pricing',
          order: 12
        }
      ]
    };
  }

  /**
   * Get physical properties section fields
   */
  private getPhysicalPropertiesSection(): ProductFormSection {
    return {
      key: 'physicalProperties',
      title: 'Physical Properties',
      description: 'Weight, dimensions, and shipping information',
      order: 4,
      fields: [
        {
          key: 'weight',
          label: 'Weight',
          type: ProductFormFieldType.NUMBER,
          required: false,
          validators: [
            Validators.min(0),
            Validators.max(999999)
          ],
          placeholder: '0',
          hint: 'Product weight in grams',
          suffix: 'g',
          min: 0,
          max: 999999,
          step: 1,
          group: 'physicalProperties',
          order: 13
        },
        {
          key: 'dimensionsLength',
          label: 'Length',
          type: ProductFormFieldType.NUMBER,
          required: false,
          validators: [
            Validators.min(0),
            Validators.max(999.99)
          ],
          placeholder: '0',
          hint: 'Length in centimeters',
          suffix: 'cm',
          min: 0,
          max: 999.99,
          step: 0.1,
          group: 'physicalProperties',
          order: 14
        },
        {
          key: 'dimensionsWidth',
          label: 'Width',
          type: ProductFormFieldType.NUMBER,
          required: false,
          validators: [
            Validators.min(0),
            Validators.max(999.99)
          ],
          placeholder: '0',
          hint: 'Width in centimeters',
          suffix: 'cm',
          min: 0,
          max: 999.99,
          step: 0.1,
          group: 'physicalProperties',
          order: 15
        },
        {
          key: 'dimensionsHeight',
          label: 'Height',
          type: ProductFormFieldType.NUMBER,
          required: false,
          validators: [
            Validators.min(0),
            Validators.max(999.99)
          ],
          placeholder: '0',
          hint: 'Height in centimeters',
          suffix: 'cm',
          min: 0,
          max: 999.99,
          step: 0.1,
          group: 'physicalProperties',
          order: 16
        }
      ]
    };
  }

  /**
   * Get inventory settings section fields
   */
  private getInventorySettingsSection(): ProductFormSection {
    return {
      key: 'inventorySettings',
      title: 'Inventory Settings',
      description: 'Inventory tracking and shipping configuration',
      order: 5,
      fields: [
        {
          key: 'trackInventory',
          label: 'Inventory Tracking Method',
          type: ProductFormFieldType.RADIO,
          required: true,
          validators: [Validators.required],
          options: this.getInventoryTrackingOptions(),
          hint: 'How to track inventory for this product',
          group: 'inventorySettings',
          order: 17
        },
        {
          key: 'allowBackorder',
          label: 'Allow Backorders',
          type: ProductFormFieldType.CHECKBOX,
          required: false,
          hint: 'Allow customers to order when out of stock',
          group: 'inventorySettings',
          order: 18
        },
        {
          key: 'requiresShipping',
          label: 'Requires Shipping',
          type: ProductFormFieldType.CHECKBOX,
          required: false,
          hint: 'Physical product that needs to be shipped',
          group: 'inventorySettings',
          order: 19
        }
      ]
    };
  }

  /**
   * Get media and SEO section fields
   */
  private getMediaSeoSection(): ProductFormSection {
    return {
      key: 'mediaSeo',
      title: 'Media & SEO',
      description: 'Images, thumbnails, and search engine optimization',
      order: 6,
      fields: [
        {
          key: 'thumbnailUrl',
          label: 'Thumbnail Image URL',
          type: ProductFormFieldType.URL,
          required: false,
          validators: [
            Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)
          ],
          placeholder: 'https://example.com/image.jpg',
          hint: 'Primary product image URL (JPG, PNG, GIF, WebP)',
          group: 'mediaSeo',
          order: 20
        },
        {
          key: 'images',
          label: 'Additional Images',
          type: ProductFormFieldType.TEXTAREA,
          required: false,
          validators: [
            this.imageUrlsValidator()
          ],
          placeholder: 'Enter image URLs, one per line',
          hint: 'Additional product images - one URL per line',
          group: 'mediaSeo',
          order: 21
        },
        {
          key: 'metaTitle',
          label: 'SEO Title',
          type: ProductFormFieldType.TEXT,
          required: false,
          validators: [
            Validators.maxLength(60)
          ],
          placeholder: 'SEO-optimized page title',
          hint: 'Page title for search engines (max 60 characters)',
          group: 'mediaSeo',
          order: 22
        },
        {
          key: 'metaDescription',
          label: 'SEO Description',
          type: ProductFormFieldType.TEXTAREA,
          required: false,
          validators: [
            Validators.maxLength(160)
          ],
          placeholder: 'SEO meta description',
          hint: 'Meta description for search engines (max 160 characters)',
          group: 'mediaSeo',
          order: 23
        }
      ]
    };
  }

  /**
   * Get status and visibility section fields
   */
  private getStatusVisibilitySection(): ProductFormSection {
    return {
      key: 'statusVisibility',
      title: 'Status & Visibility',
      description: 'Product status and catalog visibility settings',
      order: 7,
      fields: [
        {
          key: 'status',
          label: 'Product Status',
          type: ProductFormFieldType.SELECT,
          required: true,
          validators: [Validators.required],
          options: this.getProductStatusOptions(),
          hint: 'Current product status',
          group: 'statusVisibility',
          order: 24
        },
        {
          key: 'isVisible',
          label: 'Visible in Catalog',
          type: ProductFormFieldType.CHECKBOX,
          required: false,
          hint: 'Show this product to customers in the catalog',
          group: 'statusVisibility',
          order: 25
        },
        {
          key: 'isFeatured',
          label: 'Featured Product',
          type: ProductFormFieldType.CHECKBOX,
          required: false,
          hint: 'Highlight this product as featured',
          group: 'statusVisibility',
          order: 26
        },
        {
          key: 'notes',
          label: 'Internal Notes',
          type: ProductFormFieldType.TEXTAREA,
          required: false,
          validators: [
            Validators.maxLength(500)
          ],
          placeholder: 'Internal notes about this product',
          hint: 'Private notes for internal use (not visible to customers)',
          group: 'statusVisibility',
          order: 27
        }
      ]
    };
  }

  /**
   * Create reactive form from configuration
   */
  private createFormFromConfig(config: ProductFormConfig, initialData?: Partial<CreateProduct>): FormGroup {
    const formControls: { [key: string]: any } = {};
    
    config.sections.forEach(section => {
      section.fields.forEach(field => {
        const defaultValue = this.getDefaultValue(field, initialData);
        const validators = field.validators || [];
        
        formControls[field.key] = [defaultValue, validators];
      });
    });

    // Add dynamic controls for dimensions
    if (initialData?.dimensions) {
      formControls['dimensionsLength'] = [initialData.dimensions.length || '', [Validators.min(0)]];
      formControls['dimensionsWidth'] = [initialData.dimensions.width || '', [Validators.min(0)]];
      formControls['dimensionsHeight'] = [initialData.dimensions.height || '', [Validators.min(0)]];
    }

    return this.fb.group(formControls);
  }

  /**
   * Get default value for a field
   */
  private getDefaultValue(field: ProductFormFieldConfig, initialData?: Partial<CreateProduct>): any {
    if (initialData) {
      const value = (initialData as any)[field.key];
      if (value !== undefined) return value;
    }

    // Default values based on field type and field key
    switch (field.key) {
      case 'trackInventory':
        return InventoryTrackingMethod.SIMPLE;
      case 'status':
        return ProductStatus.DRAFT;
      case 'requiresShipping':
        return true;
      case 'allowBackorder':
      case 'isVisible':
      case 'isFeatured':
        return false;
      case 'price':
        return 0.01;
      default:
        switch (field.type) {
          case ProductFormFieldType.CHECKBOX:
            return false;
          case ProductFormFieldType.NUMBER:
            return '';
          default:
            return '';
        }
    }
  }

  /**
   * Get field validation errors as human-readable messages
   */
  private getFieldErrors(control: AbstractControl): string[] {
    const errors: string[] = [];
    
    if (control.errors) {
      Object.keys(control.errors).forEach(errorKey => {
        switch (errorKey) {
          case 'required':
            errors.push('This field is required');
            break;
          case 'minlength':
            errors.push(`Minimum length is ${control.errors![errorKey].requiredLength} characters`);
            break;
          case 'maxlength':
            errors.push(`Maximum length is ${control.errors![errorKey].requiredLength} characters`);
            break;
          case 'min':
            errors.push(`Minimum value is ${control.errors![errorKey].min}`);
            break;
          case 'max':
            errors.push(`Maximum value is ${control.errors![errorKey].max}`);
            break;
          case 'pattern':
            errors.push('Please enter a valid format');
            break;
          case 'invalidSku':
            errors.push('SKU must contain only uppercase letters, numbers, hyphens, and underscores');
            break;
          case 'invalidComparePrice':
            errors.push('Compare at price must be higher than selling price');
            break;
          case 'invalidImageUrls':
            errors.push('Please enter valid image URLs (one per line)');
            break;
          case 'tooManyTags':
            errors.push(control.errors![errorKey].message);
            break;
          case 'specialCharacters':
            errors.push('Product name contains invalid characters');
            break;
          case 'alphaNumericSpaces':
            errors.push('Only letters, numbers, and spaces are allowed');
            break;
          default:
            errors.push('Invalid value');
        }
      });
    }
    
    return errors;
  }

  /**
   * Custom validator for product names (no special characters except spaces, hyphens, parentheses)
   */
  private noSpecialCharactersValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null;
      
      const pattern = /^[a-zA-Z0-9\s\-\(\)\.]+$/;
      return pattern.test(value.trim()) ? null : { specialCharacters: true };
    };
  }

  /**
   * Custom validator for alpha numeric with spaces
   */
  private alphaNumericSpacesValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null;
      
      const pattern = /^[a-zA-Z0-9\s]+$/;
      return pattern.test(value.trim()) ? null : { alphaNumericSpaces: true };
    };
  }

  /**
   * Custom validator for compare at price (must be higher than selling price)
   */
  private compareAtPriceValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.parent) return null;
      
      const comparePrice = parseFloat(control.value);
      const sellingPrice = parseFloat(control.parent.get('price')?.value);
      
      if (comparePrice && sellingPrice && comparePrice <= sellingPrice) {
        return { invalidComparePrice: true };
      }
      
      return null;
    };
  }

  /**
   * Custom validator for tags (limit number of tags)
   */
  private tagsValidator(maxTags: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null;
      
      const tags = value.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
      
      if (tags.length > maxTags) {
        return { 
          tooManyTags: { 
            message: `Maximum ${maxTags} tags allowed` 
          } 
        };
      }
      
      return null;
    };
  }

  /**
   * Custom validator for image URLs
   */
  private imageUrlsValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null;
      
      const urls = value.split('\n').map((url: string) => url.trim()).filter((url: string) => url.length > 0);
      const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
      
      const invalidUrls = urls.filter((url: string) => !urlPattern.test(url));
      
      if (invalidUrls.length > 0) {
        return { invalidImageUrls: true };
      }
      
      return null;
    };
  }

  /**
   * Build dimensions object from form values
   */
  private buildDimensions(formValue: any): ProductDimensions | undefined {
    const length = parseFloat(formValue.dimensionsLength);
    const width = parseFloat(formValue.dimensionsWidth);
    const height = parseFloat(formValue.dimensionsHeight);
    
    if (length || width || height) {
      return {
        length: length || 0,
        width: width || 0,
        height: height || 0,
        unit: 'cm'
      };
    }
    
    return undefined;
  }

  /**
   * Process image URLs from textarea input
   */
  private processImageUrls(imagesText: string): string[] | undefined {
    if (!imagesText) return undefined;
    
    return imagesText.split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
  }

  /**
   * Process tags from comma-separated string
   */
  private processTags(tagsText: string): string[] | undefined {
    if (!tagsText) return undefined;
    
    return tagsText.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }

  /**
   * Get category options (placeholder - should be loaded from CategoryService)
   */
  private getCategoryOptions(): ProductFormFieldOption[] {
    return [
      { value: 'cat-1', label: 'Electronics' },
      { value: 'cat-2', label: 'Clothing' },
      { value: 'cat-3', label: 'Home & Garden' },
      { value: 'cat-4', label: 'Smartphones' },
      { value: 'cat-5', label: 'Laptops' },
      { value: 'cat-6', label: 'Audio Equipment' }
    ];
  }

  /**
   * Get product status options
   */
  private getProductStatusOptions(): ProductFormFieldOption[] {
    return Object.values(ProductStatus).map(status => ({
      value: status,
      label: getProductStatusLabel(status)
    }));
  }

  /**
   * Get inventory tracking method options
   */
  private getInventoryTrackingOptions(): ProductFormFieldOption[] {
    return [
      { 
        value: InventoryTrackingMethod.NONE, 
        label: 'No Tracking',
        disabled: false
      },
      { 
        value: InventoryTrackingMethod.SIMPLE, 
        label: 'Simple Tracking',
        disabled: false
      },
      { 
        value: InventoryTrackingMethod.DETAILED, 
        label: 'Detailed Tracking',
        disabled: false
      }
    ];
  }
}