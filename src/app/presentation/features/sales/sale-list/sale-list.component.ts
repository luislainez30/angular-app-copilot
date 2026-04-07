import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { SaleSummary, SaleId } from '../../../../core/domain/models/sales/sale.interface';
import { SaleStatus, PaymentStatus } from '../../../../core/domain/models/sales/sale-status.enum';
import { SaleSearchCriteria, SaleSortField, PaginatedSales } from '../../../../core/domain/models/sales/sale-types';
import { GetSalesUseCase } from '../../../../core/application/use-cases/sales/get-sales.use-case';
import { CancelSaleUseCase } from '../../../../core/application/use-cases/sales/cancel-sale.use-case';
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';

@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PageTitleComponent],
  templateUrl: './sale-list.component.html',
  styleUrls: ['./sale-list.component.scss']
})
export class SaleListComponent implements OnInit {
  // ── Dependencies ───────────────────────────────────────────────────────────
  private getSalesUseCase   = inject(GetSalesUseCase);
  private cancelSaleUseCase = inject(CancelSaleUseCase);
  private router            = inject(Router);

  // ── Data ───────────────────────────────────────────────────────────────────
  sales: SaleSummary[] = [];
  loading = false;
  error: string | null = null;

  // ── Filters ────────────────────────────────────────────────────────────────
  searchQuery    = '';
  selectedStatus: SaleStatus | ''        = '';
  selectedPaymentStatus: PaymentStatus | '' = '';

  // ── Sorting ────────────────────────────────────────────────────────────────
  sortField: SaleSortField = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';

  // ── Pagination ─────────────────────────────────────────────────────────────
  currentPage  = 1;
  pageSize     = 10;
  totalSales   = 0;
  totalPages   = 0;

  // ── Actions dropdown ───────────────────────────────────────────────────────
  openActionsMenuId: SaleId | null = null;

  // ── Enum refs for template ─────────────────────────────────────────────────
  readonly SaleStatus    = SaleStatus;
  readonly PaymentStatus = PaymentStatus;
  readonly saleStatusOptions   = Object.values(SaleStatus);
  readonly paymentStatusOptions = Object.values(PaymentStatus);

  ngOnInit(): void {
    this.loadSales();
  }

  // ── Data loading ───────────────────────────────────────────────────────────

  loadSales(): void {
    this.loading = true;
    this.error   = null;

    const criteria: SaleSearchCriteria = {
      query:         this.searchQuery || undefined,
      status:        this.selectedStatus        ? [this.selectedStatus]        : undefined,
      paymentStatus: this.selectedPaymentStatus ? [this.selectedPaymentStatus] : undefined,
      sortBy:        this.sortField,
      sortOrder:     this.sortOrder,
      page:          this.currentPage,
      pageSize:      this.pageSize
    };

    this.getSalesUseCase.execute(criteria).subscribe({
      next: (result: PaginatedSales) => {
        this.sales      = result.items;
        this.totalSales = result.total;
        this.totalPages = result.totalPages;
        this.loading    = false;
        console.log(result.items);
        
      },
      error: (err) => {
        console.error('Failed to load sales:', err);
        this.error   = 'Failed to load sales. Please try again.';
        this.loading = false;
      }
    });
  }

  // ── Filter handlers ────────────────────────────────────────────────────────

  onSearch(): void {
    this.currentPage = 1;
    this.loadSales();
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadSales();
  }

  onPaymentStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadSales();
  }

  clearFilters(): void {
    this.searchQuery          = '';
    this.selectedStatus       = '';
    this.selectedPaymentStatus = '';
    this.currentPage          = 1;
    this.loadSales();
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.selectedStatus || this.selectedPaymentStatus);
  }

  // ── Sorting ────────────────────────────────────────────────────────────────

  onSort(field: SaleSortField): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'desc';
    }
    this.currentPage = 1;
    this.loadSales();
  }

  getSortIcon(field: SaleSortField): string {
    if (this.sortField !== field) return 'sort';
    return this.sortOrder === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  }

  isSorted(field: SaleSortField): boolean {
    return this.sortField === field;
  }

  // ── Pagination ─────────────────────────────────────────────────────────────

  previousPage(): void {
    if (this.currentPage > 1) { this.currentPage--; this.loadSales(); }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) { this.currentPage++; this.loadSales(); }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadSales();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const max  = 5;
    const half = Math.floor(max / 2);
    let start  = Math.max(1, this.currentPage - half);
    let end    = Math.min(this.totalPages, start + max - 1);
    if (end - start < max - 1) { start = Math.max(1, end - max + 1); }
    for (let i = start; i <= end; i++) { pages.push(i); }
    return pages;
  }

  // ── Actions menu ───────────────────────────────────────────────────────────

  toggleActionsMenu(saleId: SaleId): void {
    this.openActionsMenuId = this.openActionsMenuId === saleId ? null : saleId;
  }

  isActionsMenuOpen(saleId: SaleId): boolean {
    return this.openActionsMenuId === saleId;
  }

  closeActionsMenu(): void {
    this.openActionsMenuId = null;
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  viewSaleDetail(saleId: SaleId): void {
    this.router.navigate(['/sales', saleId]);
  }

  viewCustomer(customerId: string): void {
    this.router.navigate(['/customers', customerId]);
  }

  // ── Cancel sale ────────────────────────────────────────────────────────────

  cancelSale(sale: SaleSummary): void {
    const confirmed = confirm(
      `Cancel sale ${sale.saleNumber}?\n\n` +
      `Customer: ${sale.customerName}\n` +
      `Total: $${sale.total.toFixed(2)}\n\n` +
      'This action cannot be undone.'
    );
    if (!confirmed) return;

    this.cancelSaleUseCase.execute(sale.id).subscribe({
      next: () => this.loadSales(),
      error: (err) => {
        console.error('Failed to cancel sale:', err);
        alert('An error occurred while cancelling the sale. Please try again.');
      }
    });
  }

  canCancel(sale: SaleSummary): boolean {
    return sale.status !== SaleStatus.CANCELLED
        && sale.status !== SaleStatus.REFUNDED
        && sale.status !== SaleStatus.DELIVERED;
  }

  // ── Badge helpers ──────────────────────────────────────────────────────────

  getSaleStatusBadgeClasses(status: SaleStatus): string {
    switch (status) {
      case SaleStatus.DRAFT:       return 'bg-yellow-100 text-yellow-800';
      case SaleStatus.CONFIRMED:   return 'bg-blue-100 text-blue-800';
      case SaleStatus.PROCESSING:  return 'bg-indigo-100 text-indigo-800';
      case SaleStatus.SHIPPED:     return 'bg-purple-100 text-purple-800';
      case SaleStatus.DELIVERED:   return 'bg-green-100 text-green-800';
      case SaleStatus.CANCELLED:   return 'bg-red-100 text-red-800';
      case SaleStatus.REFUNDED:    return 'bg-gray-100 text-gray-600';
      default:                     return 'bg-gray-100 text-gray-600';
    }
  }

  getPaymentStatusBadgeClasses(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.PENDING:  return 'bg-yellow-100 text-yellow-800';
      case PaymentStatus.PARTIAL:  return 'bg-orange-100 text-orange-800';
      case PaymentStatus.PAID:     return 'bg-green-100 text-green-800';
      case PaymentStatus.OVERDUE:  return 'bg-red-100 text-red-800';
      case PaymentStatus.REFUNDED: return 'bg-gray-100 text-gray-600';
      case PaymentStatus.VOID:     return 'bg-slate-100 text-slate-500';
      default:                     return 'bg-gray-100 text-gray-600';
    }
  }

  formatStatusLabel(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  trackBySaleId(_index: number, sale: SaleSummary): SaleId {
    return sale.id;
  }
}
