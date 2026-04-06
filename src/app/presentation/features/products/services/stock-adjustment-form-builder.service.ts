import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { 
  StockAdjustment,
  CreateStockAdjustment, 
  StockAdjustmentReason
} from '../../../../core/domain/models/inventory/inventory.interface';
import { ProductId } from '../../../../core/domain/models/products/product-types';

/**
 * Form builder service for stock adjustment management
 * Handles form creation and validation for stock adjustments with comprehensive business logic
 * Located in presentation layer as it handles Angular-specific form logic
 */
@Injectable({
  providedIn: 'root'
})
export class StockAdjustmentFormBuilderService {

  constructor(private fb: FormBuilder) {}

  /**
   * Create form for creating a new stock adjustment
   */
  createStockAdjustmentForm(productId?: ProductId, locationId?: string): FormGroup {
    return this.fb.group({
      productId: [
        productId || '', 
        [Validators.required]
      ],
      locationId: [
        locationId || '', 
        [Validators.required]
      ],
      reason: [
        '', 
        [Validators.required]
      ],
      quantityAdjusted: [
        '', 
        [Validators.required, this.adjustmentQuantityValidator()]
      ],
      unitCost: [
        '', 
        [Validators.min(0.01), this.currencyValidator()]
      ],
      reference: [
        '', 
        [Validators.maxLength(100), this.referenceValidator()]
      ],
      notes: [
        '', 
        [Validators.maxLength(1000)]
      ],
      requiresApproval: [
        false
      ]
    }, {
      validators: [this.stockAdjustmentValidator()]
    });
  }

  /**
   * Create form for approving/rejecting stock adjustments
   */
  createAdjustmentApprovalForm(adjustment?: StockAdjustment): FormGroup {
    return this.fb.group({
      adjustmentId: [
        adjustment?.id || '', 
        [Validators.required]
      ],
      action: [
        '', 
        [Validators.required]
      ],
      approverNotes: [
        '', 
        [Validators.maxLength(500)]
      ],
      rejectionReason: [
        '',
        // Required only when action is 'reject'
      ]
    }, {
      validators: [this.approvalActionValidator()]
    });
  }

  /**
   * Create search/filter form for stock adjustments
   */
  createAdjustmentSearchForm(): FormGroup {
    return this.fb.group({
      productId: [''],
      locationId: [''],
      reason: [''],
      status: [''],
      fromDate: [''],
      toDate: [''],
      createdBy: [''],
      approvedBy: [''],
      minAmount: ['', [Validators.min(0)]],
      maxAmount: ['', [Validators.min(0)]]
    }, {
      validators: [this.dateRangeValidator(), this.amountRangeValidator()]
    });
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  /**
   * Get stock adjustment reasons for dropdown options
   */
  getAdjustmentReasons(): Array<{ value: StockAdjustmentReason; label: string; description: string }> {
    return [
      {
        value: StockAdjustmentReason.PHYSICAL_COUNT,
        label: 'Physical Count',
        description: 'Adjustment based on physical inventory count'
      },
      {
        value: StockAdjustmentReason.DAMAGED_GOODS,
        label: 'Damaged Goods',
        description: 'Products damaged beyond use'
      },
      {
        value: StockAdjustmentReason.EXPIRED_GOODS,
        label: 'Expired Goods',
        description: 'Products past expiration date'
      },
      {
        value: StockAdjustmentReason.THEFT_LOSS,
        label: 'Theft/Loss',
        description: 'Lost due to theft or unknown reasons'
      },
      {
        value: StockAdjustmentReason.SYSTEM_CORRECTION,
        label: 'System Correction',
        description: 'Correcting system errors'
      },
      {
        value: StockAdjustmentReason.RETURNED_DEFECTIVE,
        label: 'Returned Defective',
        description: 'Defective products returned by customers'
      },
      {
        value: StockAdjustmentReason.WRITE_OFF,
        label: 'Write Off',
        description: 'General write-off'
      },
      {
        value: StockAdjustmentReason.PROMOTION_SAMPLE,
        label: 'Promotion/Sample',
        description: 'Used for samples or promotional purposes'
      },
      {
        value: StockAdjustmentReason.BREAKAGE,
        label: 'Breakage',
        description: 'Broken during handling or storage'
      },
      {
        value: StockAdjustmentReason.OTHER,
        label: 'Other',
        description: 'Other reasons (specify in notes)'
      }
    ];
  }

  /**
   * Get approval statuses for dropdown options
   */
  getApprovalStatuses(): Array<{ value: string; label: string }> {
    return [
      { value: 'pending', label: 'Pending Approval' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' }
    ];
  }

  /**
   * Check if a reason requires mandatory notes
   */
  requiresNotes(reason: StockAdjustmentReason): boolean {
    return reason === StockAdjustmentReason.OTHER;
  }

  /**
   * Check if a reason typically requires approval
   */
  typicallyRequiresApproval(reason: StockAdjustmentReason): boolean {
    const approvalReasons = [
      StockAdjustmentReason.THEFT_LOSS,
      StockAdjustmentReason.WRITE_OFF
    ];
    return approvalReasons.includes(reason);
  }

  /**
   * Calculate new quantity after adjustment
   */
  calculateNewQuantity(currentQuantity: number, adjustmentQuantity: number): number {
    return currentQuantity + adjustmentQuantity;
  }

  /**
   * Convert form data to CreateStockAdjustment DTO
   */
  mapToCreateStockAdjustment(formValue: any): CreateStockAdjustment {
    const adjustment: CreateStockAdjustment = {
      productId: formValue.productId,
      locationId: formValue.locationId,
      reason: formValue.reason as StockAdjustmentReason,
      quantityAdjusted: Number(formValue.quantityAdjusted),
      requiresApproval: Boolean(formValue.requiresApproval)
    };

    // Add optional fields if provided
    if (formValue.unitCost && formValue.unitCost !== '') {
      adjustment.unitCost = Number(formValue.unitCost);
    }
    
    if (formValue.reference && formValue.reference.trim()) {
      adjustment.reference = formValue.reference.trim();
    }
    
    if (formValue.notes && formValue.notes.trim()) {
      adjustment.notes = formValue.notes.trim();
    }

    return adjustment;
  }

  /**
   * Update form validation based on selected reason
   */
  updateFormValidationForReason(form: FormGroup, reason: StockAdjustmentReason): void {
    const notesControl = form.get('notes');
    const requiresApprovalControl = form.get('requiresApproval');

    if (!notesControl || !requiresApprovalControl) return;

    // Clear existing validators
    notesControl.clearValidators();
    
    // Set base validators
    const baseValidators = [Validators.maxLength(1000)];
    
    // Add required validator for 'Other' reason
    if (this.requiresNotes(reason)) {
      baseValidators.push(Validators.required);
    }
    
    notesControl.setValidators(baseValidators);
    notesControl.updateValueAndValidity();

    // Update approval requirement suggestion
    if (this.typicallyRequiresApproval(reason)) {
      requiresApprovalControl.setValue(true);
    }
  }

  // =============================================================================
  // CUSTOM VALIDATORS
  // =============================================================================

  /**
   * Validator for adjustment quantity (cannot be zero)
   */
  private adjustmentQuantityValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      
      if (!value && value !== 0) {
        return { 'required': true };
      }
      
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return { 'numeric': true };
      }
      
      if (numValue === 0) {
        return { 'zeroQuantity': true };
      }

      // Check for reasonable limits
      if (Math.abs(numValue) > 1000000) {
        return { 'quantityTooLarge': true };
      }

      return null;
    };
  }

  /**
   * Validator for currency fields
   */
  private currencyValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      
      if (!value || value === '') {
        return null; // Allow empty for optional fields
      }

      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) {
        return { 'currency': true };
      }

      // Check for reasonable decimal places (max 4 for currencies)
      const decimalPlaces = (value.toString().split('.')[1] || '').length;
      if (decimalPlaces > 4) {
        return { 'currencyPrecision': true };
      }

      return null;
    };
  }

  /**
   * Validator for reference codes
   */
  private referenceValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      
      if (!value || value === '') {
        return null; // Optional field
      }

      // Check for valid reference format (alphanumeric, hyphens, underscores)
      if (!/^[A-Za-z0-9\-_\s]+$/.test(value)) {
        return { 'invalidReference': true };
      }

      return null;
    };
  }

  /**
   * Cross-field validator for stock adjustment form
   */
  private stockAdjustmentValidator() {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      if (!(formGroup instanceof FormGroup)) return null;

      const reason = formGroup.get('reason')?.value;
      const notes = formGroup.get('notes')?.value;

      // Validate notes requirement for 'Other' reason
      if (reason === StockAdjustmentReason.OTHER && (!notes || !notes.trim())) {
        return { 'notesRequiredForOther': true };
      }

      return null;
    };
  }

  /**
   * Validator for approval action form
   */
  private approvalActionValidator() {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      if (!(formGroup instanceof FormGroup)) return null;

      const action = formGroup.get('action')?.value;
      const rejectionReason = formGroup.get('rejectionReason')?.value;

      // Require rejection reason when action is 'reject'
      if (action === 'reject' && (!rejectionReason || !rejectionReason.trim())) {
        return { 'rejectionReasonRequired': true };
      }

      return null;
    };
  }

  /**
   * Date range validator for search form
   */
  private dateRangeValidator() {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      if (!(formGroup instanceof FormGroup)) return null;

      const fromDate = formGroup.get('fromDate')?.value;
      const toDate = formGroup.get('toDate')?.value;

      if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
        return { 'invalidDateRange': true };
      }

      return null;
    };
  }

  /**
   * Amount range validator for search form
   */
  private amountRangeValidator() {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      if (!(formGroup instanceof FormGroup)) return null;

      const minAmount = formGroup.get('minAmount')?.value;
      const maxAmount = formGroup.get('maxAmount')?.value;

      if (minAmount && maxAmount && Number(minAmount) > Number(maxAmount)) {
        return { 'invalidAmountRange': true };
      }

      return null;
    };
  }
}