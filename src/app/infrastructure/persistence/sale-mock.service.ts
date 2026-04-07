import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  Sale,
  SaleId,
  SaleItem,
  SaleCustomerSnapshot,
  SaleSummary,
  CreateSale,
  CreateSaleItem
} from '../../core/domain/models/sales/sale.interface';
import {
  SaleStatus,
  PaymentStatus,
  PaymentMethod,
  DiscountType
} from '../../core/domain/models/sales/sale-status.enum';
import {
  SaleSearchCriteria,
  SaleSortField,
  PaginatedSales
} from '../../core/domain/models/sales/sale-types';
import { ProductId } from '../../core/domain/models/products/product-types';

/**
 * Mock service for sales data persistence.
 * Simulates API responses with realistic sale records.
 */
@Injectable({
  providedIn: 'root'
})
export class SaleMockService {

  // ─── Inline customer reference for snapshot building ──────────────────────

  private readonly customerRef: Record<string, Omit<SaleCustomerSnapshot, 'customerId'>> = {
    '1': { firstName: 'John',    lastName: 'Doe',       email: 'john.doe@email.com',         phone: '+1-555-0123', billingAddress: '123 Main St, New York, NY 10001' },
    '2': { firstName: 'Jane',    lastName: 'Smith',     email: 'jane.smith@email.com',       phone: '+1-555-0124', billingAddress: '456 Oak Ave, Los Angeles, CA 90210' },
    '3': { firstName: 'Carlos',  lastName: 'Rodriguez', email: 'carlos.rodriguez@email.com', phone: '+1-555-0125', billingAddress: '789 Pine Rd, Miami, FL 33101' },
    '4': { firstName: 'Emily',   lastName: 'Johnson',   email: 'emily.johnson@email.com',    phone: '+1-555-0126', billingAddress: '321 Elm St, Chicago, IL 60601' },
    '5': { firstName: 'Michael', lastName: 'Brown',     email: 'michael.brown@email.com',    phone: '+1-555-0127', billingAddress: '654 Maple Drive, Seattle, WA 98101' },
    '6': { firstName: 'Sarah',   lastName: 'Davis',     email: 'sarah.davis@company.com',    phone: '+1-555-0128', billingAddress: '789 Pine Avenue, Denver, CO 80202' },
    '7': { firstName: 'David',   lastName: 'Wilson',    email: 'david.wilson@tech.co',       phone: '+1-555-0129', billingAddress: '456 Cedar Lane, Portland, OR 97201' }
  };

  // ─── Mock data ────────────────────────────────────────────────────────────

  private sales: Sale[] = [
    // ── Sale 1: Delivered & fully paid ──────────────────────────────────────
    {
      id: '1' as SaleId,
      saleNumber: 'SALE-2026-001',
      customer: {
        customerId: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1-555-0123',
        billingAddress: '123 Main St, New York, NY 10001'
      },
      items: [
        {
          id: 'item-1-1',
          productId: '1' as ProductId,
          productName: 'iPhone 15 Pro',
          sku: 'APPLE-IP15P-128-NTC',
          unitPrice: 999.99,
          quantity: 1,
          discountType: DiscountType.NONE,
          discountValue: 0,
          discountAmount: 0,
          taxRate: 13,
          taxAmount: 130.00,
          subtotal: 999.99,
          total: 1129.99,
          notes: undefined
        },
        {
          id: 'item-1-2',
          productId: '5' as ProductId,
          productName: 'Sony WH-1000XM5',
          sku: 'SONY-WH1000XM5-BLK',
          unitPrice: 399.99,
          quantity: 1,
          discountType: DiscountType.NONE,
          discountValue: 0,
          discountAmount: 0,
          taxRate: 13,
          taxAmount: 52.00,
          subtotal: 399.99,
          total: 451.99,
          notes: undefined
        }
      ],
      status: SaleStatus.DELIVERED,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-14'),
      paidAt: new Date('2026-01-10'),
      dueDate: undefined,
      subtotal: 1399.98,
      totalDiscount: 0,
      totalTax: 182.00,
      shippingCost: 0,
      total: 1581.98,
      amountPaid: 1581.98,
      balanceDue: 0,
      notes: 'Express delivery requested',
      internalNotes: undefined,
      externalReference: undefined
    },

    // ── Sale 2: Confirmed, pending payment ───────────────────────────────────
    {
      id: '2' as SaleId,
      saleNumber: 'SALE-2026-002',
      customer: {
        customerId: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@email.com',
        phone: '+1-555-0124',
        billingAddress: '456 Oak Ave, Los Angeles, CA 90210'
      },
      items: [
        {
          id: 'item-2-1',
          productId: '2' as ProductId,
          productName: 'Samsung Galaxy S24 Ultra',
          sku: 'SAMS-GS24U-256-BLK',
          unitPrice: 1199.99,
          quantity: 1,
          discountType: DiscountType.PERCENTAGE,
          discountValue: 10,
          discountAmount: 120.00,
          taxRate: 13,
          taxAmount: 140.40,
          subtotal: 1199.99,
          total: 1220.39,
          notes: 'Loyalty discount applied'
        }
      ],
      status: SaleStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      createdAt: new Date('2026-02-05'),
      updatedAt: new Date('2026-02-05'),
      paidAt: undefined,
      dueDate: new Date('2026-02-19'),
      subtotal: 1199.99,
      totalDiscount: 120.00,
      totalTax: 140.40,
      shippingCost: 20.00,
      total: 1240.39,
      amountPaid: 0,
      balanceDue: 1240.39,
      notes: undefined,
      internalNotes: 'Awaiting bank transfer confirmation',
      externalReference: 'PO-2026-0042'
    },

    // ── Sale 3: Processing, partially paid ───────────────────────────────────
    {
      id: '3' as SaleId,
      saleNumber: 'SALE-2026-003',
      customer: {
        customerId: '4',
        firstName: 'Emily',
        lastName: 'Johnson',
        email: 'emily.johnson@email.com',
        phone: '+1-555-0126',
        billingAddress: '321 Elm St, Chicago, IL 60601'
      },
      items: [
        {
          id: 'item-3-1',
          productId: '6' as ProductId,
          productName: 'iPad Air 11" M2',
          sku: 'APPLE-IPAD-AIR11-M2-64-GY',
          unitPrice: 599.99,
          quantity: 2,
          discountType: DiscountType.NONE,
          discountValue: 0,
          discountAmount: 0,
          taxRate: 8,
          taxAmount: 95.99,
          subtotal: 1199.98,
          total: 1295.97,
          notes: undefined
        }
      ],
      status: SaleStatus.PROCESSING,
      paymentStatus: PaymentStatus.PARTIAL,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      createdAt: new Date('2026-02-20'),
      updatedAt: new Date('2026-02-22'),
      paidAt: undefined,
      dueDate: new Date('2026-03-05'),
      subtotal: 1199.98,
      totalDiscount: 0,
      totalTax: 95.99,
      shippingCost: 15.00,
      total: 1310.97,
      amountPaid: 500.00,
      balanceDue: 810.97,
      notes: 'Split payment arrangement',
      internalNotes: 'Second installment due March 5',
      externalReference: undefined
    },

    // ── Sale 4: Cancelled ────────────────────────────────────────────────────
    {
      id: '4' as SaleId,
      saleNumber: 'SALE-2026-004',
      customer: {
        customerId: '3',
        firstName: 'Carlos',
        lastName: 'Rodriguez',
        email: 'carlos.rodriguez@email.com',
        phone: '+1-555-0125',
        billingAddress: '789 Pine Rd, Miami, FL 33101'
      },
      items: [
        {
          id: 'item-4-1',
          productId: '7' as ProductId,
          productName: 'Gaming Wireless Mouse',
          sku: 'GAME-WM-RGB-16K-BLK',
          unitPrice: 89.99,
          quantity: 3,
          discountType: DiscountType.NONE,
          discountValue: 0,
          discountAmount: 0,
          taxRate: 0,
          taxAmount: 0,
          subtotal: 269.97,
          total: 269.97,
          notes: undefined
        }
      ],
      status: SaleStatus.CANCELLED,
      paymentStatus: PaymentStatus.VOID,
      paymentMethod: PaymentMethod.CASH,
      createdAt: new Date('2026-03-01'),
      updatedAt: new Date('2026-03-02'),
      paidAt: undefined,
      dueDate: undefined,
      subtotal: 269.97,
      totalDiscount: 0,
      totalTax: 0,
      shippingCost: 10.00,
      total: 279.97,
      amountPaid: 0,
      balanceDue: 279.97,
      notes: undefined,
      internalNotes: 'Customer changed mind before processing',
      externalReference: undefined
    },

    // ── Sale 5: Delivered & fully paid ───────────────────────────────────────
    {
      id: '5' as SaleId,
      saleNumber: 'SALE-2026-005',
      customer: {
        customerId: '6',
        firstName: 'Sarah',
        lastName: 'Davis',
        email: 'sarah.davis@company.com',
        phone: '+1-555-0128',
        billingAddress: '789 Pine Avenue, Denver, CO 80202'
      },
      items: [
        {
          id: 'item-5-1',
          productId: '4' as ProductId,
          productName: 'Dell XPS 13 Plus',
          sku: 'DELL-XPS13P-512-SLV',
          unitPrice: 1499.99,
          quantity: 1,
          discountType: DiscountType.FIXED,
          discountValue: 50,
          discountAmount: 50.00,
          taxRate: 13,
          taxAmount: 188.50,
          subtotal: 1499.99,
          total: 1638.49,
          notes: 'Corporate client discount'
        }
      ],
      status: SaleStatus.DELIVERED,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      createdAt: new Date('2026-03-10'),
      updatedAt: new Date('2026-03-15'),
      paidAt: new Date('2026-03-12'),
      dueDate: undefined,
      subtotal: 1499.99,
      totalDiscount: 50.00,
      totalTax: 188.50,
      shippingCost: 0,
      total: 1638.49,
      amountPaid: 1638.49,
      balanceDue: 0,
      notes: undefined,
      internalNotes: undefined,
      externalReference: 'CORP-INV-0021'
    },

    // ── Sale 6: Shipped, payment pending ─────────────────────────────────────
    {
      id: '6' as SaleId,
      saleNumber: 'SALE-2026-006',
      customer: {
        customerId: '5',
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@email.com',
        phone: '+1-555-0127',
        billingAddress: '654 Maple Drive, Seattle, WA 98101'
      },
      items: [
        {
          id: 'item-6-1',
          productId: '7' as ProductId,
          productName: 'Gaming Wireless Mouse',
          sku: 'GAME-WM-RGB-16K-BLK',
          unitPrice: 89.99,
          quantity: 1,
          discountType: DiscountType.NONE,
          discountValue: 0,
          discountAmount: 0,
          taxRate: 8,
          taxAmount: 7.20,
          subtotal: 89.99,
          total: 97.19,
          notes: undefined
        },
        {
          id: 'item-6-2',
          productId: '5' as ProductId,
          productName: 'Sony WH-1000XM5',
          sku: 'SONY-WH1000XM5-BLK',
          unitPrice: 399.99,
          quantity: 1,
          discountType: DiscountType.PERCENTAGE,
          discountValue: 5,
          discountAmount: 20.00,
          taxRate: 8,
          taxAmount: 30.40,
          subtotal: 399.99,
          total: 410.39,
          notes: undefined
        }
      ],
      status: SaleStatus.SHIPPED,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: PaymentMethod.DIGITAL_WALLET,
      createdAt: new Date('2026-04-01'),
      updatedAt: new Date('2026-04-04'),
      paidAt: undefined,
      dueDate: new Date('2026-04-15'),
      subtotal: 489.98,
      totalDiscount: 20.00,
      totalTax: 37.60,
      shippingCost: 12.00,
      total: 519.58,
      amountPaid: 0,
      balanceDue: 519.58,
      notes: undefined,
      internalNotes: undefined,
      externalReference: undefined
    }
  ];

  // ─── Public methods ────────────────────────────────────────────────────────

  /**
   * Get paginated, optionally filtered list of sales (returns summaries).
   */
  getSales(page = 1, pageSize = 10, criteria?: SaleSearchCriteria): Observable<PaginatedSales> {
    let filtered = [...this.sales];

    if (criteria) {
      if (criteria.query) {
        const q = criteria.query.toLowerCase();
        filtered = filtered.filter(s =>
          s.saleNumber.toLowerCase().includes(q) ||
          s.customer.firstName.toLowerCase().includes(q) ||
          s.customer.lastName.toLowerCase().includes(q) ||
          s.customer.email.toLowerCase().includes(q)
        );
      }

      if (criteria.status && criteria.status.length > 0) {
        filtered = filtered.filter(s => criteria.status!.includes(s.status));
      }

      if (criteria.paymentStatus && criteria.paymentStatus.length > 0) {
        filtered = filtered.filter(s => criteria.paymentStatus!.includes(s.paymentStatus));
      }

      if (criteria.paymentMethod && criteria.paymentMethod.length > 0) {
        filtered = filtered.filter(s => s.paymentMethod && criteria.paymentMethod!.includes(s.paymentMethod));
      }

      if (criteria.customerId) {
        filtered = filtered.filter(s => s.customer.customerId === criteria.customerId);
      }

      if (criteria.createdAfter) {
        filtered = filtered.filter(s => s.createdAt >= criteria.createdAfter!);
      }

      if (criteria.createdBefore) {
        filtered = filtered.filter(s => s.createdAt <= criteria.createdBefore!);
      }

      if (criteria.minTotal !== undefined) {
        filtered = filtered.filter(s => s.total >= criteria.minTotal!);
      }

      if (criteria.maxTotal !== undefined) {
        filtered = filtered.filter(s => s.total <= criteria.maxTotal!);
      }

      if (criteria.sortBy) {
        filtered = this.sortSales(filtered, criteria.sortBy, criteria.sortOrder ?? 'desc');
      }
    } else {
      filtered = this.sortSales(filtered, 'createdAt', 'desc');
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize).map(s => this.toSummary(s));

    return of({ items, total, page, pageSize, totalPages }).pipe(delay(300));
  }

  /**
   * Get a single sale by ID (full detail).
   */
  getSaleById(id: string): Observable<Sale | null> {
    const sale = this.sales.find(s => s.id === id) ?? null;
    return of(sale).pipe(delay(100));
  }

  /**
   * Create a new sale.
   * Computes all item-level and bill-level amounts from the provided payload.
   */
  createSale(data: CreateSale): Observable<Sale> {
    const existingIds = this.sales.map(s => parseInt(s.id)).filter(id => !isNaN(id));
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    const year = new Date().getFullYear();
    const saleNumber = `SALE-${year}-${String(nextId).padStart(3, '0')}`;

    const customerInfo = this.customerRef[data.customerId];
    const customer: SaleCustomerSnapshot = customerInfo
      ? { customerId: data.customerId, ...customerInfo }
      : { customerId: data.customerId, firstName: '', lastName: '', email: '', phone: '' };

    const items = data.items.map((item, index) => this.buildSaleItem(item, `item-${nextId}-${index + 1}`));
    const shippingCost = data.shippingCost ?? 0;
    const subtotal      = items.reduce((sum, i) => sum + i.subtotal, 0);
    const totalDiscount = items.reduce((sum, i) => sum + i.discountAmount, 0);
    const totalTax      = items.reduce((sum, i) => sum + i.taxAmount, 0);
    const total         = subtotal - totalDiscount + totalTax + shippingCost;

    const newSale: Sale = {
      id: nextId.toString() as SaleId,
      saleNumber,
      customer,
      items,
      status: SaleStatus.DRAFT,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: data.paymentMethod,
      createdAt: new Date(),
      updatedAt: new Date(),
      paidAt: undefined,
      dueDate: data.dueDate,
      subtotal,
      totalDiscount,
      totalTax,
      shippingCost,
      total,
      amountPaid: 0,
      balanceDue: total,
      notes: data.notes,
      internalNotes: data.internalNotes,
      externalReference: data.externalReference
    };

    this.sales.push(newSale);
    return of(newSale).pipe(delay(200));
  }

  /**
   * Cancel a sale by ID — sets status CANCELLED and blanks payment if still pending.
   */
  cancelSale(id: string): Observable<Sale> {
    const index = this.sales.findIndex(s => s.id === id);
    if (index === -1) {
      return of({} as Sale).pipe(delay(100));
    }
    this.sales[index] = {
      ...this.sales[index],
      status: SaleStatus.CANCELLED,
      paymentStatus:
        this.sales[index].paymentStatus === PaymentStatus.PAID
          ? PaymentStatus.PAID  // keep paid status if already paid
          : PaymentStatus.VOID,
      updatedAt: new Date()
    };
    return of(this.sales[index]).pipe(delay(150));
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private buildSaleItem(data: CreateSaleItem, id: string): SaleItem {
    const discountType  = data.discountType  ?? DiscountType.NONE;
    const discountValue = data.discountValue ?? 0;
    const taxRate       = data.taxRate       ?? 0;
    const subtotal      = data.unitPrice * data.quantity;

    const discountAmount = discountType === DiscountType.PERCENTAGE
      ? parseFloat((subtotal * (discountValue / 100)).toFixed(2))
      : discountType === DiscountType.FIXED
        ? Math.min(discountValue, subtotal)
        : 0;

    const taxableAmount = subtotal - discountAmount;
    const taxAmount     = parseFloat((taxableAmount * (taxRate / 100)).toFixed(2));
    const total         = parseFloat((taxableAmount + taxAmount).toFixed(2));

    return {
      id,
      productId: data.productId,
      productName: '',  // Caller should provide product name if needed via an extended DTO
      sku: '',
      unitPrice: data.unitPrice,
      quantity: data.quantity,
      discountType,
      discountValue,
      discountAmount,
      taxRate,
      taxAmount,
      subtotal,
      total,
      notes: data.notes
    };
  }

  private toSummary(sale: Sale): SaleSummary {
    return {
      id: sale.id,
      saleNumber: sale.saleNumber,
      customerId: sale.customer.customerId,
      customerName: `${sale.customer.firstName} ${sale.customer.lastName}`.trim(),
      customerEmail: sale.customer.email,
      itemCount: sale.items.length,
      total: sale.total,
      balanceDue: sale.balanceDue,
      status: sale.status,
      paymentStatus: sale.paymentStatus,
      createdAt: sale.createdAt,
      dueDate: sale.dueDate
    };
  }

  private sortSales(sales: Sale[], sortBy: SaleSortField, order: 'asc' | 'desc'): Sale[] {
    return [...sales].sort((a, b) => {
      let valueA: number | string;
      let valueB: number | string;

      switch (sortBy) {
        case 'saleNumber':
          valueA = a.saleNumber;
          valueB = b.saleNumber;
          break;
        case 'customerName':
          valueA = `${a.customer.firstName} ${a.customer.lastName}`.toLowerCase();
          valueB = `${b.customer.firstName} ${b.customer.lastName}`.toLowerCase();
          break;
        case 'total':
          valueA = a.total;
          valueB = b.total;
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        case 'paymentStatus':
          valueA = a.paymentStatus;
          valueB = b.paymentStatus;
          break;
        case 'dueDate':
          valueA = a.dueDate?.getTime() ?? 0;
          valueB = b.dueDate?.getTime() ?? 0;
          break;
        case 'createdAt':
        default:
          valueA = a.createdAt.getTime();
          valueB = b.createdAt.getTime();
          break;
      }

      if (valueA < valueB) return order === 'asc' ? -1 : 1;
      if (valueA > valueB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }
}
