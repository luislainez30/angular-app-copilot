import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { 
  Customer,
  CustomerStatus,
  CustomerWithComputed,
  CommunicationMethod,
  enrichCustomer,
  getCustomerStatusLabel,
  formatAddress
} from '../../../../core/domain/models/customers';
import { 
  GetCustomerByIdUseCase,
  DeleteCustomerUseCase
} from '../../../../core/application/use-cases/customers';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-detail.component.html',
  styles: []
})
export class CustomerDetailComponent implements OnInit, OnDestroy {
  customer: CustomerWithComputed | null = null;
  loading = false;
  error: string | null = null;
  customerId: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private getCustomerByIdUseCase: GetCustomerByIdUseCase,
    private deleteCustomerUseCase: DeleteCustomerUseCase
  ) {}

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id');
    if (this.customerId) {
      this.loadCustomer();
    } else {
      this.error = 'No customer ID provided';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load customer data
   */
  private loadCustomer(): void {
    if (!this.customerId) return;
    
    this.loading = true;
    this.error = null;

    this.getCustomerByIdUseCase.execute(this.customerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (customer) => {
          if (customer) {
            this.customer = enrichCustomer(customer);
          } else {
            this.error = 'Customer not found';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load customer details';
          this.loading = false;
          console.error('Error loading customer:', err);
        }
      });
  }

  /**
   * Navigate back to customer list
   */
  goBack(): void {
    this.router.navigate(['/customers']);
  }

  /**
   * Navigate to edit customer page
   */
  editCustomer(): void {
    if (this.customer) {
      this.router.navigate(['/customers', this.customer.id, 'edit']);
    }
  }

  /**
   * Delete customer with confirmation
   */
  deleteCustomer(): void {
    if (!this.customer) return;

    const confirmed = confirm(
      `Are you sure you want to delete customer "${this.customer.fullName}"? This action cannot be undone.`
    );

    if (confirmed) {
      this.deleteCustomerUseCase.execute(this.customer.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              // Navigate back to customer list after successful deletion
              this.router.navigate(['/customers']);
            } else {
              alert('Failed to delete customer. Please try again.');
            }
          },
          error: (err) => {
            console.error('Error deleting customer:', err);
            alert('Failed to delete customer. Please try again.');
          }
        });
    }
  }

  /**
   * Send email to customer
   */
  sendEmail(): void {
    if (this.customer) {
      window.open(`mailto:${this.customer.email}?subject=Customer Service`, '_blank');
    }
  }

  /**
   * Make phone call to customer
   */
  makeCall(): void {
    if (this.customer) {
      window.open(`tel:${this.customer.phone}`, '_self');
    }
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Get formatted address string
   */
  getFormattedAddress(): string {
    return this.customer ? formatAddress(this.customer.address) : '';
  }

  /**
   * Get membership duration in days
   */
  getMembershipDuration(): number {
    if (!this.customer) return 0;
    return this.customer.membershipDuration;
  }

  /**
   * Get customer status label
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
   * Get communication method label
   */
  getCommunicationMethodLabel(method: CommunicationMethod): string {
    const labels = {
      [CommunicationMethod.EMAIL]: 'Email',
      [CommunicationMethod.SMS]: 'SMS/Text Message',
      [CommunicationMethod.PHONE]: 'Phone Call',
      [CommunicationMethod.MAIL]: 'Postal Mail'
    };
    return labels[method] || method;
  }

  /**
   * Get language label
   */
  getLanguageLabel(languageCode: string): string {
    const languages: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'pt': 'Portuguese',
      'it': 'Italian',
      'ja': 'Japanese',
      'zh': 'Chinese',
      'hi': 'Hindi'
    };
    return languages[languageCode] || languageCode.toUpperCase();
  }
}