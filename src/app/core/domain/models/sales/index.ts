// Enums
export * from './sale-status.enum';

// Interfaces
export * from './sale.interface';

// Types & utilities
export * from './sale-types';

// Re-export key types for convenience
export type {
  Sale,
  SaleId,
  SaleItem,
  SaleCustomerSnapshot,
  SaleSummary,
  CreateSale,
  CreateSaleItem,
  UpdateSale
} from './sale.interface';

export type {
  SaleWithComputed,
  SaleSearchCriteria,
  SaleSortField,
  SaleStats,
  PaginatedSales
} from './sale-types';
