import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, forkJoin, takeUntil, finalize } from 'rxjs';
import { inject } from '@angular/core';

import { PageTitleComponent } from '../../../shared/components';
import {
  SaleFormBuilderService,
  SaleFormConfig,
  SaleFormSection,
  SaleFormFieldConfig,
  SaleFormFieldType,
  SaleFormFieldOption
} from '../services/sale-form-builder.service';
import { CreateSaleUseCase } from '../../../../core/application/use-cases/sales/create-sale.use-case';
import { GetCustomersUseCase } from '../../../../core/application/use-cases/customers/get-customers.use-case';
import { GetProductsUseCase } from '../../../../core/application/use-cases/products/get-products.use-case';
import { Customer } from '../../../../core/domain/models/customers/customer.interface';
import { Product } from '../../../../core/domain/models/products/product.interface';
import { DiscountType, PaymentMethod } from '../../../../core/domain/models/sales/sale-status.enum';

@Component({
  selector: 'app-sale-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PageTitleComponent],
  templateUrl: './sale-create.component.html',
  styleUrls: ['./sale-create.component.scss']
})
export class SaleCreateComponent implements OnInit, OnDestroy {
  // ── Dependencies ───────────────────────────────────────────────────────────
  private formBuilderSvc  = inject(SaleFormBuilderService);
  private createSaleUseCase = inject(CreateSaleUseCase);
  private getCustomersUseCase = inject(GetCustomersUseCase);
  private getProductsUseCase  = inject(GetProductsUseCase);
  private router = inject(Router);

  // ── Form ───────────────────────────────────────────────────────────────────
  saleForm!: FormGroup;
  formConfig!: SaleFormConfig;

  // ── State ──────────────────────────────────────────────────────────────────
  isSubmitting    = false;
  isLoadingData   = true;
  loadingError: string | null = null;

  // ── Reference data ─────────────────────────────────────────────────────────
  customers: Customer[] = [];
  products: Product[]   = [];

  // ── Enum refs for template ─────────────────────────────────────────────────
  readonly SaleFormFieldType = SaleFormFieldType;
  readonly DiscountType      = DiscountType;
  readonly PaymentMethod     = PaymentMethod;
  readonly paymentMethods    = Object.values(PaymentMethod);

  // ── Customer picker state ──────────────────────────────────────────────────
  customerSearchQuery = '';

  private destroy$ = new Subject<void>();

  // ────────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ────────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.initializeForm();
    this.loadReferenceData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Initialisation
  // ────────────────────────────────────────────────────────────────────────────

  private initializeForm(): void {
    this.saleForm   = this.formBuilderSvc.buildSaleForm();
    this.formConfig = this.formBuilderSvc.getHeaderConfiguration();
  }

  loadReferenceData(): void {
    this.isLoadingData = true;
    this.loadingError  = null;

    forkJoin({
      customers: this.getCustomersUseCase.execute({ page: 1, pageSize: 200 }),
      products:  this.getProductsUseCase.execute({ page: 1, pageSize: 200 })
    })
    .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoadingData = false)))
    .subscribe({
      next: ({ customers, products }) => {
        this.customers = customers.customers;
        this.products  = products.products;
      },
      error: (err) => {
        console.error('Failed to load reference data:', err);
        this.loadingError = 'Failed to load customers and products. Please refresh.';
      }
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Items FormArray helpers
  // ────────────────────────────────────────────────────────────────────────────

  get itemsArray(): FormArray {
    return this.formBuilderSvc.getItemsArray(this.saleForm);
  }

  addItem(): void {
    this.formBuilderSvc.addItem(this.itemsArray);
  }

  removeItem(index: number): void {
    this.formBuilderSvc.removeItem(this.itemsArray, index);
  }

  /** When a product is selected in a row, auto-fill the unit price. */
  onProductChange(index: number): void {
    const row = this.itemsArray.at(index) as FormGroup;
    const product = this.products.find(p => p.id === row.get('productId')?.value);
    if (product) {
      row.patchValue({ unitPrice: product.price });
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Live totals
  // ────────────────────────────────────────────────────────────────────────────

  getItemLineTotal(index: number): number {
    const row = this.itemsArray.at(index).value;
    const subtotal = (+row.quantity || 0) * (+row.unitPrice || 0);

    let discount = 0;
    if (row.discountType === DiscountType.PERCENTAGE) {
      discount = subtotal * ((+row.discountValue || 0) / 100);
    } else if (row.discountType === DiscountType.FIXED) {
      discount = Math.min(+row.discountValue || 0, subtotal);
    }

    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * ((+row.taxRate || 0) / 100);
    return afterDiscount + tax;
  }

  get subtotal(): number {
    return this.itemsArray.controls.reduce((sum, _, i) => {
      const row = this.itemsArray.at(i).value;
      return sum + (+row.quantity || 0) * (+row.unitPrice || 0);
    }, 0);
  }

  get totalDiscount(): number {
    return this.itemsArray.controls.reduce((sum, _, i) => {
      const row  = this.itemsArray.at(i).value;
      const base = (+row.quantity || 0) * (+row.unitPrice || 0);
      if (row.discountType === DiscountType.PERCENTAGE) {
        return sum + base * ((+row.discountValue || 0) / 100);
      }
      if (row.discountType === DiscountType.FIXED) {
        return sum + Math.min(+row.discountValue || 0, base);
      }
      return sum;
    }, 0);
  }

  get totalTax(): number {
    return this.itemsArray.controls.reduce((sum, _, i) => {
      const row     = this.itemsArray.at(i).value;
      const base    = (+row.quantity || 0) * (+row.unitPrice || 0);
      let discount  = 0;
      if (row.discountType === DiscountType.PERCENTAGE) {
        discount = base * ((+row.discountValue || 0) / 100);
      } else if (row.discountType === DiscountType.FIXED) {
        discount = Math.min(+row.discountValue || 0, base);
      }
      return sum + (base - discount) * ((+row.taxRate || 0) / 100);
    }, 0);
  }

  get shippingCost(): number {
    return +this.saleForm.get('shippingCost')?.value || 0;
  }

  get grandTotal(): number {
    return this.subtotal - this.totalDiscount + this.totalTax + this.shippingCost;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Options helpers
  // ────────────────────────────────────────────────────────────────────────────

  getCustomerOptions(): SaleFormFieldOption[] {
    return this.customers.map(c => ({
      value: c.id,
      label: `${c.firstName} ${c.lastName} — ${c.email}`
    }));
  }

  getProductOptions(): SaleFormFieldOption[] {
    return this.products.map(p => ({
      value: p.id,
      label: `${p.name} (${p.sku}) — $${p.price.toFixed(2)}`
    }));
  }

  getDiscountTypeOptions(): SaleFormFieldOption[] {
    return this.formBuilderSvc.getDiscountTypeOptions();
  }

  getProductNameForRow(productId: string | null | undefined): string {
    if (!productId) return 'Product…';
    const product = this.products.find(p => p.id === productId);
    return product ? product.name : 'Product…';
  }

  getPaymentMethodOptions(): SaleFormFieldOption[] {
    return this.formBuilderSvc.getPaymentMethodOptions();
  }

  // ── Customer picker helpers ────────────────────────────────────────────────

  get filteredCustomers(): Customer[] {
    const q = this.customerSearchQuery.trim().toLowerCase();
    if (!q) return this.customers;
    return this.customers.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  }

  get selectedCustomer(): Customer | null {
    const id = this.saleForm.get('customerId')?.value;
    return id ? (this.customers.find(c => c.id === id) ?? null) : null;
  }

  selectCustomer(customer: Customer): void {
    this.saleForm.get('customerId')?.setValue(customer.id);
    this.saleForm.get('customerId')?.markAsTouched();
    this.customerSearchQuery = '';
  }

  clearCustomer(): void {
    this.saleForm.get('customerId')?.setValue('');
  }

  // ── Payment method picker helpers ──────────────────────────────────────────

  get selectedPaymentMethod(): string {
    return this.saleForm.get('paymentMethod')?.value ?? '';
  }

  selectPaymentMethod(method: PaymentMethod): void {
    const current = this.saleForm.get('paymentMethod')?.value;
    this.saleForm.get('paymentMethod')?.setValue(current === method ? '' : method);
  }

  getPaymentMethodIcon(method: string): string {
    const icons: Record<string, string> = {
      [PaymentMethod.CASH]:           'payments',
      [PaymentMethod.CREDIT_CARD]:    'credit_card',
      [PaymentMethod.DEBIT_CARD]:     'credit_card',
      [PaymentMethod.BANK_TRANSFER]:  'account_balance',
      [PaymentMethod.CHECK]:          'description',
      [PaymentMethod.DIGITAL_WALLET]: 'account_balance_wallet',
      [PaymentMethod.OTHER]:          'more_horiz',
    };
    return icons[method] ?? 'payment';
  }

  getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      [PaymentMethod.CASH]:           'Cash',
      [PaymentMethod.CREDIT_CARD]:    'Credit Card',
      [PaymentMethod.DEBIT_CARD]:     'Debit Card',
      [PaymentMethod.BANK_TRANSFER]:  'Bank Transfer',
      [PaymentMethod.CHECK]:          'Check',
      [PaymentMethod.DIGITAL_WALLET]: 'Digital Wallet',
      [PaymentMethod.OTHER]:          'Other',
    };
    return labels[method] ?? method;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Form submission
  // ────────────────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.saleForm.invalid) {
      this.markAllAsTouched();
      this.scrollToFirstError();
      return;
    }

    this.isSubmitting = true;
    const createSale = this.formBuilderSvc.transformFormToCreateSale(this.saleForm.value);

    this.createSaleUseCase.execute(createSale)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          setTimeout(() => this.router.navigate(['/sales/list']), 800);
        },
        error: (err) => {
          console.error('Failed to create sale:', err);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/sales/list']);
  }

  canSubmit(): boolean {
    return this.saleForm.valid && !this.isSubmitting && !this.isLoadingData;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Validation helpers
  // ────────────────────────────────────────────────────────────────────────────

  isFieldInvalid(fieldKey: string): boolean {
    const ctrl = this.saleForm.get(fieldKey);
    return !!(ctrl?.invalid && (ctrl.dirty || ctrl.touched));
  }

  isItemFieldInvalid(rowIndex: number, fieldKey: string): boolean {
    const ctrl = this.itemsArray.at(rowIndex).get(fieldKey);
    return !!(ctrl?.invalid && (ctrl.dirty || ctrl.touched));
  }

  getFieldErrorMessages(fieldKey: string): string[] {
    const ctrl = this.saleForm.get(fieldKey);
    if (!ctrl?.errors) return [];
    return this.formBuilderSvc.validateForm(this.saleForm)[fieldKey] ?? [];
  }

  getItemFieldErrorMessages(rowIndex: number, fieldKey: string): string[] {
    const ctrl = this.itemsArray.at(rowIndex).get(fieldKey);
    if (!ctrl?.errors) return [];
    const allErrors = this.formBuilderSvc.validateForm(this.saleForm);
    return allErrors[`items[${rowIndex}].${fieldKey}`] ?? [];
  }

  getInputClasses(fieldKey: string): string {
    const base = 'block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-colors bg-white';
    return this.isFieldInvalid(fieldKey)
      ? `${base} border-red-300 focus:border-red-300 focus:ring-red-500`
      : `${base} border-slate-300 placeholder-slate-400 focus:border-blue-500`;
  }

  getItemInputClasses(rowIndex: number, fieldKey: string): string {
    const base = 'block w-full px-2.5 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white';
    return this.isItemFieldInvalid(rowIndex, fieldKey)
      ? `${base} border-red-300 focus:ring-red-500`
      : `${base} border-slate-300 focus:border-blue-500`;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // TrackBy / utilities
  // ────────────────────────────────────────────────────────────────────────────

  trackBySection(_i: number, s: SaleFormSection): string     { return s.key; }
  trackByField(_i: number, f: SaleFormFieldConfig): string   { return f.key; }
  trackByIndex(i: number): number                            { return i; }
  trackByCustomerId(_i: number, c: Customer): string         { return c.id; }

  private markAllAsTouched(): void {
    Object.values(this.saleForm.controls).forEach(c => c.markAsTouched());
    this.itemsArray.controls.forEach(row =>
      Object.values((row as FormGroup).controls).forEach(c => c.markAsTouched())
    );
  }

  private scrollToFirstError(): void {
    setTimeout(() => {
      const el = document.querySelector('.border-red-300');
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }, 100);
  }
}
