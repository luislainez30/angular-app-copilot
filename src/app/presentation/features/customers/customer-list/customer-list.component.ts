import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  Customer,
  CustomerStatus,
  CustomerWithComputed,
  CustomerSearchCriteria,
  CustomerPageResult,
  CustomerSortField,
  getCustomerStatusLabel,
  enrichCustomer
} from '../../../../core/domain/models/customers';
import { GetCustomersUseCase, DeleteCustomerUseCase } from '../../../../core/application/use-cases/customers';
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageTitleComponent],
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {
  private getCustomersUseCase = inject(GetCustomersUseCase);
  private deleteCustomerUseCase = inject(DeleteCustomerUseCase);
  private router = inject(Router);

  // Component state
  customers: CustomerWithComputed[] = [];
  loading = false;
  error: string | null = null;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCustomers = 0;
  totalPages = 0;
  
  // Search and filters
  searchQuery = '';
  selectedStatus: CustomerStatus | '' = '';
  
  // Sorting
  sortField: CustomerSortField = CustomerSortField.ID;
  sortOrder: 'asc' | 'desc' = 'desc';
  
  // Enums for template
  readonly CustomerStatus = CustomerStatus;
  readonly CustomerSortField = CustomerSortField;

  // Math object for template
  readonly Math = Math;
  
  ngOnInit(): void {
    this.loadCustomers();
  }

  /**
   * Load customers with current filters
   */
  loadCustomers(): void {
    this.loading = true;
    this.error = null;

    const criteria: CustomerSearchCriteria = {
      query: this.searchQuery || undefined,
      status: this.selectedStatus ? [this.selectedStatus] : undefined,
      sortBy: this.sortField,
      sortOrder: this.sortOrder,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.getCustomersUseCase.execute(criteria)
      .subscribe({
        next: (result: CustomerPageResult) => {
          this.customers = result.customers.map((customer: Customer) => enrichCustomer(customer));
          this.totalCustomers = result.total;
          this.totalPages = result.totalPages;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load customers';
          this.loading = false;
          console.error('Error loading customers:', err);
        }
      });
  }

  /**
   * Handle search input
   */
  onSearch(): void {
    this.currentPage = 1;
    this.loadCustomers();
  }

  /**
   * Clear search and filters
   */
  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.sortField = CustomerSortField.ID;
    this.sortOrder = 'desc';
    this.currentPage = 1;
    this.loadCustomers();
  }

  /**
   * Handle status filter change
   */
  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadCustomers();
  }

  /**
   * Navigate to previous page
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCustomers();
    }
  }

  /**
   * Navigate to next page
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCustomers();
    }
  }

  /**
   * Navigate to specific page
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCustomers();
    }
  }

  /**
   * Navigate to add customer page
   */
  navigateToAdd(): void {
    this.router.navigate(['/customers/add']);
  }

  /**
   * Navigate to customer detail page
   */
  viewCustomer(customerId: string): void {
    this.router.navigate(['/customers', customerId]);
  }

  /**
   * Navigate to edit customer page
   */
  editCustomer(customerId: string): void {
    this.router.navigate(['/customers', customerId, 'edit']);
  }

  /**
   * Delete customer (with confirmation)
   */
  deleteCustomer(customer: CustomerWithComputed): void {
    const confirmed = confirm(
      `Are you sure you want to delete customer "${customer.fullName}"? This action cannot be undone.`
    );
    
    if (confirmed) {
      this.loading = true;
      this.deleteCustomerUseCase.execute(customer.id).subscribe({
        next: (success) => {
          if (success) {
            this.loadCustomers(); // Reload the list
          } else {
            this.error = 'Failed to delete customer';
            this.loading = false;
          }
        },
        error: (err) => {
          this.error = 'Failed to delete customer';
          this.loading = false;
          console.error('Error deleting customer:', err);
        }
      });
    }
  }

  /**
   * Get status label for display
   */
  getStatusLabel(status: CustomerStatus): string {
    return getCustomerStatusLabel(status);
  }

  /**
   * Get status CSS class
   */
  getStatusClass(status: CustomerStatus): string {
    const classes = {
      [CustomerStatus.ACTIVE]: 'bg-green-100 text-green-800',
      [CustomerStatus.INACTIVE]: 'bg-gray-100 text-gray-800',
      [CustomerStatus.SUSPENDED]: 'bg-red-100 text-red-800',
      [CustomerStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [CustomerStatus.BLOCKED]: 'bg-red-900 text-red-100'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  /**
   * Get page numbers for pagination
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    const start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible - 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  /**
   * Handle column sort
   */
  onSort(field: CustomerSortField): void {
    if (this.sortField === field) {
      // Toggle sort order if same field
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new field with default desc order
      this.sortField = field;
      this.sortOrder = 'desc';
    }
    
    this.currentPage = 1;
    this.loadCustomers();
  }

  /**
   * Get sort icon for column
   */
  getSortIcon(field: CustomerSortField): string {
    if (this.sortField !== field) {
      return 'sort'; // Default sort icon
    }
    return this.sortOrder === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  }

  /**
   * Check if column is currently sorted
   */
  isSorted(field: CustomerSortField): boolean {
    return this.sortField === field;
  }

  /**
   * Get sortable field label
   */
  getSortFieldLabel(field: CustomerSortField): string {
    const labels = {
      [CustomerSortField.ID]: 'Customer ID',
      [CustomerSortField.FIRST_NAME]: 'First Name',
      [CustomerSortField.LAST_NAME]: 'Last Name',
      [CustomerSortField.EMAIL]: 'Email',
      [CustomerSortField.PHONE]: 'Phone',
      [CustomerSortField.REGISTERED_DATE]: 'Registered Date',
      [CustomerSortField.DATE_OF_BIRTH]: 'Date of Birth',
      [CustomerSortField.STATUS]: 'Status',
      [CustomerSortField.CITY]: 'City',
      [CustomerSortField.STATE]: 'State'
    };
    return labels[field] || field;
  }
}