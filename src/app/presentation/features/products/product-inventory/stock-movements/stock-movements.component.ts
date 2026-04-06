import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Domain models
import { 
  StockMovement 
} from '../../../../../core/domain/models/inventory/inventory.interface';
import { ProductId } from '../../../../../core/domain/models/products/product-types';

// Use cases
import { 
  GetStockMovementsByProductUseCase 
} from '../../../../../core/application/use-cases/inventory';

// Services
import { AlertService } from '../../../../../core/application/services/alert.service';

@Component({
  selector: 'app-stock-movements',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './stock-movements.component.html',
  styleUrls: ['./stock-movements.component.scss']
})
export class StockMovementsComponent implements OnInit, OnDestroy, OnChanges {
  // Dependencies
  private readonly getStockMovementsByProductUseCase = inject(GetStockMovementsByProductUseCase);
  private readonly alertService = inject(AlertService);
  
  // Lifecycle
  private readonly destroy$ = new Subject<void>();

  // Inputs
  @Input() productId: ProductId | null = null;
  @Input() locationId?: string;
  @Input() limit?: number = 50; // Default to last 50 movements

  // Component state
  stockMovements: StockMovement[] = [];
  loading = false;
  error: string | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalMovements = 0;

  ngOnInit(): void {
    this.loadStockMovements();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId'] && this.productId) {
      this.loadStockMovements();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load stock movements for the current product
   */
  loadStockMovements(): void {
    if (!this.productId) {
      this.stockMovements = [];
      return;
    }

    this.loading = true;
    this.error = null;

    // Use recent movements if no specific parameters
    this.getStockMovementsByProductUseCase
      .execute(this.productId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error loading stock movements:', error);
          this.error = 'Failed to load stock movements. Please try again.';
          this.alertService.showError('Failed to load stock movements');
          return [];
        })
      )
      .subscribe({
        next: (movements) => {
          this.stockMovements = movements;
          this.totalMovements = movements.length;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  /**
   * Get paginated movements
   */
  getPaginatedMovements(): StockMovement[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.stockMovements.slice(startIndex, endIndex);
  }

  /**
   * Get total pages for pagination
   */
  getTotalPages(): number {
    return Math.ceil(this.totalMovements / this.pageSize);
  }

  /**
   * Navigate to specific page
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  /**
   * Get movement type configuration for styling and display
   */
  getMovementTypeConfig(type: StockMovement['movementType']): {
    label: string;
    classes: string;
    icon: string;
  } {
    const configs = {
      'purchase': {
        label: 'Purchase',
        classes: 'bg-green-100 text-green-800 border-green-200',
        icon: 'add_shopping_cart'
      },
      'sale': {
        label: 'Sale',
        classes: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: 'shopping_cart'
      },
      'adjustment': {
        label: 'Adjustment',
        classes: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: 'tune'
      },
      'transfer': {
        label: 'Transfer',
        classes: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: 'call_received'
      },
      'return': {
        label: 'Return',
        classes: 'bg-teal-100 text-teal-800 border-teal-200',
        icon: 'keyboard_return'
      },
      'damaged': {
        label: 'Damaged',
        classes: 'bg-red-100 text-red-800 border-red-200',
        icon: 'report_problem'
      },
      'expired': {
        label: 'Expired',
        classes: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: 'schedule'
      }
    };

    return configs[type] || {
      label: type,
      classes: 'bg-slate-100 text-slate-800 border-slate-200',
      icon: 'inventory_2'
    };
  }

  /**
   * Format quantity with proper sign and styling
   */
  formatQuantity(quantity: number): {
    display: string;
    classes: string;
  } {
    const isPositive = quantity > 0;
    const isNegative = quantity < 0;
    
    return {
      display: quantity > 0 ? `+${quantity}` : quantity.toString(),
      classes: isPositive 
        ? 'text-green-600 font-semibold' 
        : isNegative 
          ? 'text-red-600 font-semibold'
          : 'text-slate-600'
    };
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  /**
   * Refresh movements data
   */
  refresh(): void {
    this.currentPage = 1;
    this.loadStockMovements();
  }

  /**
   * Check if there are any movements to display
   */
  hasMovements(): boolean {
    return this.stockMovements.length > 0;
  }

  /**
   * Track by function for movement list performance
   */
  trackByMovementId(index: number, movement: StockMovement): string {
    return movement.id;
  }

  /**
   * Get page numbers for pagination
   */
  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const numbers: number[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        numbers.push(i);
      }
    } else {
      // Show pages around current page
      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      // Adjust start if we're near the end
      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        numbers.push(i);
      }
    }
    
    return numbers;
  }
}