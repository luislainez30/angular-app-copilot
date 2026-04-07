import { ProductId } from '../products/product-types';
import { CustomerId } from '../customers/customer-types';
import { SaleStatus, PaymentStatus, PaymentMethod, DiscountType } from './sale-status.enum';

// ─── Customer Snapshot ────────────────────────────────────────────────────────

/**
 * Immutable copy of relevant customer info captured at the moment of sale.
 * Preserves billing details even if the customer record changes later.
 */
export interface SaleCustomerSnapshot {
  readonly customerId: CustomerId;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string;
  /** Billing address at the time of purchase */
  readonly billingAddress?: string;
}

// ─── Sale Line Item ───────────────────────────────────────────────────────────

/**
 * A single product line within a sale bill.
 * Pricing and product info are snapshotted to maintain historical accuracy.
 */
export interface SaleItem {
  readonly id: string;
  readonly productId: ProductId;

  /** Snapshot of product name at the time of sale */
  productName: string;
  /** Snapshot of SKU at the time of sale */
  sku: string;

  /** Unit selling price at the time of sale */
  unitPrice: number;
  quantity: number;

  discountType: DiscountType;
  /** Percentage (0-100) or fixed currency amount depending on discountType */
  discountValue: number;
  /** Computed: resolved discount amount in currency */
  readonly discountAmount: number;

  /** Tax rate as a percentage (e.g. 13 = 13%) */
  taxRate: number;
  /** Computed: tax amount in currency */
  readonly taxAmount: number;

  /** Computed: unitPrice × quantity */
  readonly subtotal: number;
  /** Computed: subtotal − discountAmount + taxAmount */
  readonly total: number;

  notes?: string;
}

// ─── Main Sale Bill ───────────────────────────────────────────────────────────

/**
 * Core Sale (bill) domain model.
 * Represents a complete sales transaction between the business and a customer.
 */
export interface Sale {
  readonly id: SaleId;
  /** Human-readable sale reference, e.g. SALE-2026-001 */
  saleNumber: string;

  customer: SaleCustomerSnapshot;
  items: SaleItem[];

  status: SaleStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;

  // ── Dates ──────────────────────────────────────────────────────────────────
  createdAt: Date;
  updatedAt: Date;
  /** Date when payment was received in full */
  paidAt?: Date;
  /** Payment due date for credit/invoiced sales */
  dueDate?: Date;

  // ── Amounts ────────────────────────────────────────────────────────────────
  /** Sum of (unitPrice × quantity) for all items, before any discounts or taxes */
  subtotal: number;
  /** Total discount applied across all line items */
  totalDiscount: number;
  /** Total tax applied across all line items */
  totalTax: number;
  /** Any shipping or delivery fee */
  shippingCost: number;
  /** Final amount due: subtotal − totalDiscount + totalTax + shippingCost */
  total: number;
  /** Amount already collected */
  amountPaid: number;
  /** Computed: total − amountPaid */
  readonly balanceDue: number;

  /** Customer-visible notes (printed on invoice) */
  notes?: string;
  /** Internal-only notes not visible to customer */
  internalNotes?: string;

  /** Reference to external system or document (e.g. PO number) */
  externalReference?: string;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

/**
 * Payload for creating a new sale.
 * Computed amount fields are derived server-side / in the use case.
 */
export interface CreateSale {
  customerId: CustomerId;
  items: CreateSaleItem[];
  paymentMethod?: PaymentMethod;
  dueDate?: Date;
  shippingCost?: number;
  notes?: string;
  internalNotes?: string;
  externalReference?: string;
}

export interface CreateSaleItem {
  productId: ProductId;
  quantity: number;
  unitPrice: number;
  discountType?: DiscountType;
  discountValue?: number;
  taxRate?: number;
  notes?: string;
}

/**
 * Payload for updating an existing sale (only mutable fields).
 */
export interface UpdateSale {
  readonly id: SaleId;
  status?: SaleStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  items?: CreateSaleItem[];
  dueDate?: Date;
  shippingCost?: number;
  amountPaid?: number;
  notes?: string;
  internalNotes?: string;
  externalReference?: string;
}

// ─── Summary ──────────────────────────────────────────────────────────────────

/**
 * Lightweight sale representation for list/table views.
 */
export interface SaleSummary {
  readonly id: SaleId;
  readonly saleNumber: string;
  readonly customerId: CustomerId;
  readonly customerName: string;
  readonly customerEmail: string;
  readonly itemCount: number;
  readonly total: number;
  readonly balanceDue: number;
  readonly status: SaleStatus;
  readonly paymentStatus: PaymentStatus;
  readonly createdAt: Date;
  readonly dueDate?: Date;
}

// ─── Branded ID ───────────────────────────────────────────────────────────────

export type SaleId = string & { readonly __brand: 'SaleId' };
