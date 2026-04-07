import { Sale, SaleId, SaleSummary } from './sale.interface';
import { SaleStatus, PaymentStatus, PaymentMethod } from './sale-status.enum';

/**
 * Sale with additional computed/enriched properties for UI consumption.
 */
export interface SaleWithComputed extends Sale {
  /** true when balanceDue > 0 */
  readonly hasOutstandingBalance: boolean;
  /** true when dueDate is in the past and payment is not complete */
  readonly isOverdue: boolean;
  /** Overall discount percentage relative to gross subtotal */
  readonly discountPercentage: number;
  /** Resolved payment method label for display */
  readonly paymentMethodLabel: string;
}

// ─── Search & Filter ──────────────────────────────────────────────────────────

/**
 * Criteria for querying / filtering sales records.
 */
export interface SaleSearchCriteria {
  query?: string; // Searches saleNumber, customerName, customerEmail
  status?: SaleStatus[];
  paymentStatus?: PaymentStatus[];
  paymentMethod?: PaymentMethod[];
  customerId?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  dueBefore?: Date;
  minTotal?: number;
  maxTotal?: number;
  sortBy?: SaleSortField;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export type SaleSortField =
  | 'saleNumber'
  | 'customerName'
  | 'total'
  | 'status'
  | 'paymentStatus'
  | 'createdAt'
  | 'dueDate';

// ─── Aggregate Statistics ─────────────────────────────────────────────────────

/**
 * Aggregated sales statistics for dashboard / reporting.
 */
export interface SaleStats {
  totalSales: number;
  totalRevenue: number;
  totalOutstanding: number; // Sum of balanceDue across unpaid sales
  averageOrderValue: number;
  salesByStatus: Record<SaleStatus, number>;
  salesByPaymentStatus: Record<PaymentStatus, number>;
  topCustomers: TopCustomerStat[];
}

export interface TopCustomerStat {
  readonly customerId: string;
  readonly customerName: string;
  readonly totalPurchases: number;
  readonly totalSpent: number;
}

// ─── Paginated Result ─────────────────────────────────────────────────────────

export interface PaginatedSales {
  items: SaleSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
