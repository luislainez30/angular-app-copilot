import { Product } from './product.interface';
import { ProductValidationErrors, ProductDimensions, ProductWithComputed } from './product-types';
import { ProductStatus } from './product-status.enum';

/**
 * Calculate if product is on sale
 */
export function isProductOnSale(product: Product): boolean {
  return !!product.compareAtPrice && product.compareAtPrice > product.price;
}

/**
 * Calculate discount amount
 */
export function calculateDiscountAmount(product: Product): number {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) {
    return 0;
  }
  return product.compareAtPrice - product.price;
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(product: Product): number {
  const discountAmount = calculateDiscountAmount(product);
  if (discountAmount === 0 || !product.compareAtPrice) {
    return 0;
  }
  return Math.round((discountAmount / product.compareAtPrice) * 100);
}

/**
 * Generate URL-friendly slug from product name
 */
export function generateProductSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format price as currency string
 */
export function formatProductPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(price);
}

/**
 * Format weight with unit
 */
export function formatProductWeight(weight: number): string {
  if (weight >= 1000) {
    return `${(weight / 1000).toFixed(1)} kg`;
  }
  return `${weight} g`;
}

/**
 * Format dimensions as string
 */
export function formatProductDimensions(dimensions?: ProductDimensions): string {
  if (!dimensions) {
    return 'Not specified';
  }
  const { length, width, height, unit } = dimensions;
  return `${length} × ${width} × ${height} ${unit}`;
}

/**
 * Check if product has inventory tracking
 */
export function hasInventoryTracking(product: Product): boolean {
  return product.trackInventory !== 'none';
}

/**
 * Check if product is discontinued
 */
export function isProductDiscontinued(product: Product): boolean {
  return product.status === ProductStatus.DISCONTINUED;
}

/**
 * Check if product can be purchased
 */
export function canProductBePurchased(product: Product): boolean {
  return product.status === ProductStatus.ACTIVE && product.isVisible;
}

/**
 * Enrich product with computed properties
 */
export function enrichProduct(product: Product, categoryName: string = 'Unknown Category'): ProductWithComputed {
  return {
    ...product,
    isOnSale: isProductOnSale(product),
    discountAmount: calculateDiscountAmount(product),
    discountPercentage: calculateDiscountPercentage(product),
    isDiscontinued: isProductDiscontinued(product),
    hasInventoryTracking: hasInventoryTracking(product),
    categoryName,
    formattedPrice: formatProductPrice(product.price),
    formattedWeight: product.weight ? formatProductWeight(product.weight) : 'Not specified',
    slug: generateProductSlug(product.name)
  };
}

/**
 * Basic product validation
 */
export function validateProduct(product: Partial<Product>): ProductValidationErrors {
  const errors: ProductValidationErrors = {};

  // Name validation
  if (!product.name || product.name.trim().length === 0) {
    errors.name = ['Product name is required'];
  } else if (product.name.trim().length < 2) {
    errors.name = ['Product name must be at least 2 characters'];
  } else if (product.name.trim().length > 255) {
    errors.name = ['Product name cannot exceed 255 characters'];
  }

  // Description validation
  if (!product.description || product.description.trim().length === 0) {
    errors.description = ['Product description is required'];
  } else if (product.description.trim().length < 10) {
    errors.description = ['Product description must be at least 10 characters'];
  }

  // SKU validation
  if (!product.sku || product.sku.trim().length === 0) {
    errors.sku = ['SKU is required'];
  } else if (!/^[A-Za-z0-9\-_]+$/.test(product.sku)) {
    errors.sku = ['SKU can only contain letters, numbers, hyphens, and underscores'];
  }

  // Price validation
  if (product.price === undefined || product.price === null) {
    errors.price = ['Price is required'];
  } else if (product.price < 0) {
    errors.price = ['Price cannot be negative'];
  }

  // Cost price validation
  if (product.costPrice !== undefined && product.costPrice < 0) {
    errors.costPrice = ['Cost price cannot be negative'];
  }

  // Category validation
  if (!product.categoryId) {
    errors.categoryId = ['Category is required'];
  }

  // Weight validation
  if (product.weight !== undefined && product.weight < 0) {
    errors.weight = ['Weight cannot be negative'];
  }

  return errors;
}

/**
 * Create search key for product (for client-side search)
 */
export function createProductSearchKey(product: Product): string {
  return [
    product.name,
    product.description,
    product.shortDescription || '',
    product.sku,
    product.barcode || '',
    product.brand || '',
    product.manufacturer || '',
    ...product.tags
  ].filter(Boolean).join(' ').toLowerCase();
}

/**
 * Get product display info for lists
 */
export function getProductDisplayInfo(product: Product): {
  title: string;
  subtitle: string;
  badge?: string;
} {
  const title = product.name;
  const subtitle = `SKU: ${product.sku}`;
  
  let badge: string | undefined;
  if (product.isFeatured) {
    badge = 'Featured';
  } else if (isProductOnSale(product)) {
    badge = `${calculateDiscountPercentage(product)}% OFF`;
  } else if (product.status === ProductStatus.OUT_OF_STOCK) {
    badge = 'Out of Stock';
  }

  return { title, subtitle, badge };
}