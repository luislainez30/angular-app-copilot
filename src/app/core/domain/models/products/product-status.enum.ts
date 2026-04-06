/**
 * Product Status Enum
 * Defines the various states a product can be in
 */
export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive', 
  DISCONTINUED = 'discontinued',
  DRAFT = 'draft',
  OUT_OF_STOCK = 'out_of_stock'
}

/**
 * Get human-readable label for product status
 */
export function getProductStatusLabel(status: ProductStatus): string {
  switch (status) {
    case ProductStatus.ACTIVE:
      return 'Active';
    case ProductStatus.INACTIVE:
      return 'Inactive';
    case ProductStatus.DISCONTINUED:
      return 'Discontinued';
    case ProductStatus.DRAFT:
      return 'Draft';
    case ProductStatus.OUT_OF_STOCK:
      return 'Out of Stock';
    default:
      return 'Unknown';
  }
}

/**
 * Check if product can be sold
 */
export function canProductBeSold(status: ProductStatus): boolean {
  return status === ProductStatus.ACTIVE;
}

/**
 * Check if product is available for purchase
 */
export function isProductAvailable(status: ProductStatus): boolean {
  return status === ProductStatus.ACTIVE || status === ProductStatus.INACTIVE;
}