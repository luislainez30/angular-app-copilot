/**
 * Overall lifecycle status of a sale
 */
export enum SaleStatus {
  DRAFT = 'draft',           // Not yet confirmed
  CONFIRMED = 'confirmed',   // Confirmed and awaiting processing
  PROCESSING = 'processing', // Being prepared / picked
  SHIPPED = 'shipped',       // Dispatched to customer
  DELIVERED = 'delivered',   // Received by customer
  CANCELLED = 'cancelled',   // Cancelled before completion
  REFUNDED = 'refunded'      // Fully refunded after completion
}

/**
 * Payment status of a sale
 */
export enum PaymentStatus {
  PENDING = 'pending',     // Payment not yet received
  PARTIAL = 'partial',     // Partially paid
  PAID = 'paid',           // Fully paid
  OVERDUE = 'overdue',     // Payment due date has passed
  REFUNDED = 'refunded',   // Payment returned to customer
  VOID = 'void'            // Payment voided / not applicable
}

/**
 * Accepted payment methods
 */
export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  DIGITAL_WALLET = 'digital_wallet',
  OTHER = 'other'
}

/**
 * Type of discount that can be applied to a line item or to the whole sale
 */
export enum DiscountType {
  NONE = 'none',
  PERCENTAGE = 'percentage', // e.g. 10 = 10%
  FIXED = 'fixed'            // fixed currency amount
}
