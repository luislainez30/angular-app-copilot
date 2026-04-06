import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { 
  InventoryLocation,
  CreateInventoryLocation,
  UpdateInventoryLocation
} from '../../../../core/domain/models/inventory/inventory.interface';

/**
 * Form builder service for inventory location management
 * Handles form creation and validation specifically for location operations
 * Located in presentation layer as it handles Angular-specific form logic
 */
@Injectable({
  providedIn: 'root'
})
export class InventoryLocationFormBuilderService {

  constructor(private fb: FormBuilder) {}

  /**
   * Create form for creating a new inventory location
   */
  createLocationForm(location?: InventoryLocation): FormGroup {
    return this.fb.group({
      name: [
        location?.name || '', 
        [
          Validators.required, 
          Validators.minLength(2), 
          Validators.maxLength(100),
          this.locationNameValidator()
        ]
      ],
      code: [
        location?.code || '', 
        [
          Validators.required, 
          Validators.minLength(2), 
          Validators.maxLength(20),
          this.locationCodeValidator()
        ]
      ],
      type: [
        location?.type || 'warehouse', 
        [Validators.required]
      ],
      address: [
        location?.address || '', 
        [Validators.maxLength(250)]
      ],
      isActive: [
        location?.isActive !== undefined ? location.isActive : true
      ]
    });
  }

  /**
   * Create form for editing an existing inventory location
   */
  createEditLocationForm(location: InventoryLocation): FormGroup {
    return this.createLocationForm(location);
  }

  /**
   * Create form for bulk location operations
   */
  createBulkLocationForm(): FormGroup {
    return this.fb.group({
      operation: [
        'activate', 
        [Validators.required]
      ],
      locationIds: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      confirmAction: [
        false, 
        [Validators.requiredTrue]
      ]
    });
  }

  /**
   * Create form for location search/filter
   */
  createLocationFilterForm(): FormGroup {
    return this.fb.group({
      searchTerm: [''],
      type: [''],
      isActive: [''],
      sortBy: ['name'],
      sortOrder: ['asc']
    });
  }

  /**
   * Create form for location settings/configuration
   */
  createLocationSettingsForm(location: InventoryLocation): FormGroup {
    return this.fb.group({
      allowNegativeStock: [false],
      requireLotTracking: [false],
      autoReorderEnabled: [false],
      defaultReorderLevel: [
        0, 
        [Validators.min(0), this.numericValidator()]
      ],
      costingMethod: ['FIFO'],
      notes: [
        '', 
        [Validators.maxLength(500)]
      ]
    });
  }

  // =============================================================================
  // FORM ARRAY HELPERS
  // =============================================================================

  /**
   * Add location ID to bulk operations form
   */
  addLocationToBulk(form: FormGroup, locationId: string): void {
    const locationIdsArray = form.get('locationIds') as FormArray;
    if (!this.isLocationInBulk(form, locationId)) {
      locationIdsArray.push(this.fb.control(locationId, [Validators.required]));
    }
  }

  /**
   * Remove location ID from bulk operations form
   */
  removeLocationFromBulk(form: FormGroup, locationId: string): void {
    const locationIdsArray = form.get('locationIds') as FormArray;
    const index = locationIdsArray.controls.findIndex(control => control.value === locationId);
    if (index >= 0) {
      locationIdsArray.removeAt(index);
    }
  }

  /**
   * Check if location is already in bulk operations
   */
  isLocationInBulk(form: FormGroup, locationId: string): boolean {
    const locationIdsArray = form.get('locationIds') as FormArray;
    return locationIdsArray.controls.some(control => control.value === locationId);
  }

  /**
   * Clear all locations from bulk operations
   */
  clearBulkLocations(form: FormGroup): void {
    const locationIdsArray = form.get('locationIds') as FormArray;
    while (locationIdsArray.length !== 0) {
      locationIdsArray.removeAt(0);
    }
  }

  // =============================================================================
  // DTO MAPPING METHODS
  // =============================================================================

  /**
   * Convert form data to CreateInventoryLocation DTO
   */
  mapToCreateLocation(formValue: any): CreateInventoryLocation {
    return {
      name: formValue.name?.trim(),
      code: formValue.code?.trim().toUpperCase(),
      type: formValue.type,
      address: formValue.address?.trim() || undefined,
      isActive: formValue.isActive ?? true
    };
  }

  /**
   * Convert form data to UpdateInventoryLocation DTO
   */
  mapToUpdateLocation(formValue: any): UpdateInventoryLocation {
    const update: UpdateInventoryLocation = {};
    
    if (formValue.name !== undefined && formValue.name?.trim()) {
      update.name = formValue.name.trim();
    }
    if (formValue.code !== undefined && formValue.code?.trim()) {
      update.code = formValue.code.trim().toUpperCase();
    }
    if (formValue.type !== undefined) {
      update.type = formValue.type;
    }
    if (formValue.address !== undefined) {
      update.address = formValue.address?.trim() || undefined;
    }
    if (formValue.isActive !== undefined) {
      update.isActive = formValue.isActive;
    }

    return update;
  }

  /**
   * Map bulk operation form data
   */
  mapToBulkOperation(formValue: any): {
    operation: string;
    locationIds: string[];
  } {
    return {
      operation: formValue.operation,
      locationIds: formValue.locationIds || []
    };
  }

  // =============================================================================
  // FORM UTILITIES
  // =============================================================================

  /**
   * Reset form to initial state
   */
  resetLocationForm(form: FormGroup, location?: InventoryLocation): void {
    if (location) {
      form.patchValue({
        name: location.name,
        code: location.code,
        type: location.type,
        address: location.address || '',
        isActive: location.isActive
      });
    } else {
      form.reset({
        name: '',
        code: '',
        type: 'warehouse',
        address: '',
        isActive: true
      });
    }
    
    // Clear validation errors
    form.markAsUntouched();
    form.markAsPristine();
  }

  /**
   * Pre-fill code based on name (helper for UX)
   */
  generateCodeFromName(name: string): string {
    if (!name) return '';
    
    return name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .substring(0, 15); // Limit length
  }

  /**
   * Validate entire form and return error summary
   */
  getFormErrors(form: FormGroup): { [key: string]: string[] } {
    const errors: { [key: string]: string[] } = {};

    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control && control.errors) {
        errors[key] = [];
        
        if (control.errors['required']) {
          errors[key].push(`${this.getFieldDisplayName(key)} is required`);
        }
        if (control.errors['minlength']) {
          errors[key].push(`${this.getFieldDisplayName(key)} must be at least ${control.errors['minlength'].requiredLength} characters`);
        }
        if (control.errors['maxlength']) {
          errors[key].push(`${this.getFieldDisplayName(key)} cannot exceed ${control.errors['maxlength'].requiredLength} characters`);
        }
        if (control.errors['locationName']) {
          errors[key].push('Location name contains invalid characters');
        }
        if (control.errors['locationCode']) {
          errors[key].push('Location code must contain only letters, numbers, hyphens, and underscores');
        }
        if (control.errors['numeric']) {
          errors[key].push(`${this.getFieldDisplayName(key)} must be a valid number`);
        }
      }
    });

    return errors;
  }

  /**
   * Get user-friendly field names
   */
  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      'name': 'Location Name',
      'code': 'Location Code', 
      'type': 'Location Type',
      'address': 'Address',
      'isActive': 'Active Status',
      'defaultReorderLevel': 'Default Reorder Level'
    };
    
    return fieldNames[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  }

  // =============================================================================
  // CUSTOM VALIDATORS
  // =============================================================================

  /**
   * Validator for location names
   */
  private locationNameValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value && !/^[a-zA-Z0-9\s\-_.,'()]+$/.test(value)) {
        return { 'locationName': true };
      }
      return null;
    };
  }

  /**
   * Validator for location codes
   */
  private locationCodeValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value && !/^[A-Z0-9_-]+$/i.test(value)) {
        return { 'locationCode': true };
      }
      return null;
    };
  }

  /**
   * Validator for numeric fields
   */
  private numericValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value !== null && value !== undefined && value !== '' && isNaN(Number(value))) {
        return { 'numeric': true };
      }
      return null;
    };
  }

  /**
   * Async validator for code uniqueness (to be implemented with repository)
   */
  codeUniquenessValidator(excludeLocationId?: string) {
    return (control: AbstractControl): Promise<{ [key: string]: any } | null> => {
      const value = control.value;
      
      if (!value || value.trim().length < 2) {
        return Promise.resolve(null);
      }

      // TODO: Implement actual uniqueness check with repository
      // For now, return a resolved promise
      // In real implementation, you would inject the location repository or use case
      // and check if the code already exists
      
      return new Promise(resolve => {
        setTimeout(() => {
          // Simulate async validation
          // Replace this with actual repository call
          resolve(null); // null means valid
          
          // Example of returning error:
          // resolve({ 'codeExists': true });
        }, 300);
      });
    };
  }
}