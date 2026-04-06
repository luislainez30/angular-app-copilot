import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Domain models
import { 
  StockAdjustment,
  CreateStockAdjustment,
  StockAdjustmentReason,
  InventoryLocation
} from '../../../../../core/domain/models/inventory/inventory.interface';
import { ProductId } from '../../../../../core/domain/models/products/product-types';

// Use cases
import { 
  CreateStockAdjustmentUseCase,
  GetStockAdjustmentsUseCase,
  GetInventoryLocationsUseCase,
  GetProductInventoryUseCase
} from '../../../../../core/application/use-cases/inventory';

// Services
import { 
  StockAdjustmentFormBuilderService 
} from '../../services/stock-adjustment-form-builder.service';
import { AlertService } from '../../../../../core/application/services/alert.service';

@Component({
  selector: 'app-manage-inventory-adjustments',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './manage-inventory-adjustments.component.html',
  styleUrls: ['./manage-inventory-adjustments.component.scss']
})
export class ManageInventoryAdjustmentsComponent implements OnInit, OnDestroy, OnChanges {
  // Dependencies
  private readonly createAdjustmentUseCase = inject(CreateStockAdjustmentUseCase);
  private readonly getAdjustmentsUseCase = inject(GetStockAdjustmentsUseCase);
  private readonly getLocationsUseCase = inject(GetInventoryLocationsUseCase);
  private readonly getInventoryUseCase = inject(GetProductInventoryUseCase);
  private readonly formBuilder = inject(StockAdjustmentFormBuilderService);
  private readonly alertService = inject(AlertService);
  
  // Lifecycle
  private readonly destroy$ = new Subject<void>();

  // Inputs
  @Input() productId: ProductId | null = null;

  // Component state
  adjustmentForm: FormGroup = new FormGroup({});
  recentAdjustments: StockAdjustment[] = [];
  availableLocations: InventoryLocation[] = [];
  adjustmentReasons: Array<{ value: StockAdjustmentReason; label: string; description: string }> = [];
  
  // UI state
  showCreateForm = false;
  loading = false;
  savingAdjustment = false;
  loadingAdjustments = false;
  error: string | null = null;
  adjustmentError: string | null = null;
  selectedLocationId: string | null = null;
  currentStockQuantity = 0;

  // Modal/Form state
  formMode: 'create' | 'view' = 'create';

  ngOnInit(): void {
    this.initializeForm();
    this.loadAdjustmentReasons();
    this.loadAvailableLocations();
    if (this.productId) {
      this.loadRecentAdjustments();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId'] && this.productId) {
      this.loadRecentAdjustments();
      this.resetForm();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize the adjustment form
   */
  private initializeForm(): void {
    this.adjustmentForm = this.formBuilder.createStockAdjustmentForm(this.productId || undefined);
    this.setupFormValueChanges();
  }

  /**
   * Setup form value change listeners
   */
  private setupFormValueChanges(): void {
    // Listen for reason changes to update validation
    this.adjustmentForm.get('reason')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(reason => {
        if (reason) {
          this.formBuilder.updateFormValidationForReason(this.adjustmentForm, reason);
          this.updateApprovalRequirement(reason);
        }
      });

    // Listen for location changes to update current quantity
    this.adjustmentForm.get('locationId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(locationId => {
        if (locationId && this.productId) {
          this.loadCurrentStockQuantity(this.productId, locationId);
        }
      });
  }

  /**
   * Load adjustment reasons for dropdown
   */
  private loadAdjustmentReasons(): void {
    this.adjustmentReasons = this.formBuilder.getAdjustmentReasons();
  }

  /**
   * Load available inventory locations
   */
  private loadAvailableLocations(): void {
    this.loading = true;
    this.getLocationsUseCase.getInventoryLocations()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error loading locations:', error);
          this.error = 'Failed to load inventory locations';
          this.alertService.showError('Failed to load inventory locations');
          return [];
        })
      )
      .subscribe({
        next: (locations) => {
          this.availableLocations = locations.filter(loc => loc.isActive);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  /**
   * Load recent adjustments for the product
   */
  private loadRecentAdjustments(): void {
    if (!this.productId) return;

    this.loadingAdjustments = true;
    this.getAdjustmentsUseCase.getStockAdjustmentsByProduct(this.productId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error loading recent adjustments:', error);
          this.alertService.showError('Failed to load recent adjustments');
          return [];
        })
      )
      .subscribe({
        next: (adjustments) => {
            console.log(adjustments);
            
          this.recentAdjustments = adjustments;
          this.loadingAdjustments = false;
        },
        error: () => {
          this.loadingAdjustments = false;
        }
      });
  }

  /**
   * Load current stock quantity for selected location
   */
  private loadCurrentStockQuantity(productId: ProductId, locationId: string): void {
    this.getInventoryUseCase.getProductInventory(productId, locationId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.warn('Could not load current stock quantity:', error);
          return [null];
        })
      )
      .subscribe(inventory => {
        this.currentStockQuantity = inventory?.quantityAvailable || 0;
      });
  }

  /**
   * Update approval requirement suggestion
   */
  private updateApprovalRequirement(reason: StockAdjustmentReason): void {
    const requiresApprovalControl = this.adjustmentForm.get('requiresApproval');
    if (requiresApprovalControl && this.formBuilder.typicallyRequiresApproval(reason)) {
      requiresApprovalControl.setValue(true);
    }
  }

  /**
   * Show create adjustment form
   */
  showCreateAdjustmentForm(): void {
    this.showCreateForm = true;
    this.formMode = 'create';
    this.adjustmentError = null;
    this.resetForm();
  }

  /**
   * Hide create adjustment form
   */
  hideCreateAdjustmentForm(): void {
    this.showCreateForm = false;
    this.resetForm();
  }

  /**
   * Reset form to initial state
   */
  private resetForm(): void {
    this.adjustmentForm.reset();
    if (this.productId) {
      this.adjustmentForm.patchValue({
        productId: this.productId,
        requiresApproval: false
      });
    }
    this.adjustmentError = null;
  }

  /**
   * Save the adjustment
   */
  saveAdjustment(): void {
    if (!this.adjustmentForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.savingAdjustment = true;
    this.adjustmentError = null;

    const adjustmentData = this.formBuilder.mapToCreateStockAdjustment(this.adjustmentForm.value);

    this.createAdjustmentUseCase.createStockAdjustment(adjustmentData)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error creating stock adjustment:', error);
          this.adjustmentError = error.message || 'Failed to create stock adjustment. Please try again.';
          this.alertService.showError(this.adjustmentError as string);
          return [];
        })
      )
      .subscribe({
        next: (adjustment) => {
          this.alertService.showSuccess(
            adjustment.status === 'pending' 
              ? 'Stock adjustment created and is pending approval'
              : 'Stock adjustment created successfully'
          );
          this.hideCreateAdjustmentForm();
          this.loadRecentAdjustments();
          this.savingAdjustment = false;
        },
        error: () => {
          this.savingAdjustment = false;
        }
      });
  }

  /**
   * Mark all form controls as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.adjustmentForm.controls).forEach(key => {
      const control = this.adjustmentForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Calculate new quantity after adjustment
   */
  getNewQuantity(): number {
    const adjustmentQuantity = this.adjustmentForm.get('quantityAdjusted')?.value;
    if (!adjustmentQuantity || isNaN(Number(adjustmentQuantity))) {
      return this.currentStockQuantity;
    }
    return this.formBuilder.calculateNewQuantity(this.currentStockQuantity, Number(adjustmentQuantity));
  }

  /**
   * Check if form has errors for a specific field
   */
  hasError(fieldName: string): boolean {
    const field = this.adjustmentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Get error message for a specific field
   */
  getFieldError(fieldName: string): string {
    const field = this.adjustmentForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;
    
    if (errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
    if (errors['numeric']) return 'Must be a valid number';
    if (errors['zeroQuantity']) return 'Adjustment quantity cannot be zero';
    if (errors['quantityTooLarge']) return 'Adjustment quantity is too large';
    if (errors['currency']) return 'Must be a valid currency amount';
    if (errors['currencyPrecision']) return 'Too many decimal places';
    if (errors['invalidReference']) return 'Invalid reference format';
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters allowed`;

    return 'Invalid value';
  }

  /**
   * Get field label for error messages
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'productId': 'Product',
      'locationId': 'Location',
      'reason': 'Reason',
      'quantityAdjusted': 'Adjustment Quantity',
      'unitCost': 'Unit Cost',
      'reference': 'Reference',
      'notes': 'Notes'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Format adjustment status for display
   */
  formatAdjustmentStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending Approval',
      'approved': 'Approved',
      'rejected': 'Rejected'
    };
    return statusMap[status] || status;
  }

  /**
   * Get status styling classes
   */
  getStatusClasses(status: string): string {
    const classMap: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'approved': 'bg-green-100 text-green-800 border-green-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200'
    };
    return classMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
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
}