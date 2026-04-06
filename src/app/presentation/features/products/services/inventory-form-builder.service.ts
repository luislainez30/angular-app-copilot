import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { 
  ProductInventory, 
  CreateProductInventory, 
  UpdateProductInventory,
  StockMovement,
  InventoryTrackingMethod
} from '../../../../core/domain/models/inventory/inventory.interface';
import { ProductId } from '../../../../core/domain/models/products/product-types';

/**
 * Form builder service for inventory management forms
 * Handles form creation and validation for inventory and movements
 * Located in presentation layer as it handles Angular-specific form logic
 * Note: Location forms are handled by InventoryLocationFormBuilderService
 */
@Injectable({
  providedIn: 'root'
})
export class InventoryFormBuilderService {

  constructor(private fb: FormBuilder) {}

  /**
   * Create form for managing product inventory at a specific location
   */
  createProductInventoryForm(inventory?: ProductInventory): FormGroup {
    return this.fb.group({
      productId: [
        inventory?.productId || '', 
        [Validators.required]
      ],
      locationId: [
        inventory?.locationId || '', 
        [Validators.required]
      ],
      quantityAvailable: [
        inventory?.quantityAvailable || 0, 
        [Validators.required, Validators.min(0), this.numericValidator()]
      ],
      quantityReserved: [
        inventory?.quantityReserved || 0, 
        [Validators.min(0), this.numericValidator()]
      ],
      quantityOnOrder: [
        inventory?.quantityOnOrder || 0, 
        [Validators.min(0), this.numericValidator()]
      ],
      reorderLevel: [
        inventory?.reorderLevel || 0, 
        [Validators.required, Validators.min(0), this.numericValidator()]
      ],
      maxStockLevel: [
        inventory?.maxStockLevel || null, 
        [Validators.min(0), this.numericValidator()]
      ],
      costPerUnit: [
        inventory?.costPerUnit || 0, 
        [Validators.required, Validators.min(0.01), this.currencyValidator()]
      ]
    }, { 
      validators: [this.inventoryLevelsValidator()] 
    });
  }

  /**
   * Create form for recording stock movements
   */
  createStockMovementForm(): FormGroup {
    return this.fb.group({
      productId: [
        '', 
        [Validators.required]
      ],
      locationId: [
        '', 
        [Validators.required]
      ],
      movementType: [
        '', 
        [Validators.required]
      ],
      quantity: [
        0, 
        [Validators.required, this.quantityValidator()]
      ],
      unitCost: [
        null, 
        [Validators.min(0.01), this.currencyValidator()]
      ],
      reference: [
        '', 
        [Validators.maxLength(100)]
      ],
      notes: [
        '', 
        [Validators.maxLength(500)]
      ]
    });
  }

  /**
   * Create form for bulk stock movements (multiple items)
   */
  createBulkStockMovementForm(): FormGroup {
    return this.fb.group({
      locationId: [
        '', 
        [Validators.required]
      ],
      movementType: [
        '', 
        [Validators.required]
      ],
      reference: [
        '', 
        [Validators.maxLength(100)]
      ],
      notes: [
        '', 
        [Validators.maxLength(500)]
      ],
      movements: this.fb.array([], [Validators.required, Validators.minLength(1)])
    });
  }

  /**
   * Create form group for individual movement item in bulk operations
   */
  createMovementItemForm(): FormGroup {
    return this.fb.group({
      productId: [
        '', 
        [Validators.required]
      ],
      quantity: [
        0, 
        [Validators.required, this.quantityValidator()]
      ],
      unitCost: [
        null, 
        [Validators.min(0.01), this.currencyValidator()]
      ]
    });
  }

  /**
   * Create form for inventory adjustment
   */
  createInventoryAdjustmentForm(): FormGroup {
    return this.fb.group({
      productId: [
        '', 
        [Validators.required]
      ],
      locationId: [
        '', 
        [Validators.required]
      ],
      currentQuantity: [
        { value: 0, disabled: true }
      ],
      adjustmentQuantity: [
        0, 
        [Validators.required, this.adjustmentQuantityValidator()]
      ],
      newQuantity: [
        { value: 0, disabled: true }
      ],
      reason: [
        'adjustment', 
        [Validators.required]
      ],
      reference: [
        '', 
        [Validators.maxLength(100)]
      ],
      notes: [
        '', 
        [Validators.required, Validators.maxLength(500)]
      ]
    });
  }

  /**
   * Create form for inventory transfer between locations
   */
  createInventoryTransferForm(): FormGroup {
    return this.fb.group({
      productId: [
        '', 
        [Validators.required]
      ],
      fromLocationId: [
        '', 
        [Validators.required]
      ],
      toLocationId: [
        '', 
        [Validators.required]
      ],
      quantity: [
        0, 
        [Validators.required, Validators.min(1), this.numericValidator()]
      ],
      reference: [
        '', 
        [Validators.maxLength(100)]
      ],
      notes: [
        '', 
        [Validators.maxLength(500)]
      ]
    }, {
      validators: [this.transferLocationValidator()]
    });
  }

  /**
   * Create form for setting reorder levels for multiple products
   */
  createBulkReorderLevelForm(): FormGroup {
    return this.fb.group({
      locationId: [
        '', 
        [Validators.required]
      ],
      products: this.fb.array([], [Validators.required, Validators.minLength(1)])
    });
  }

  /**
   * Create form group for individual product reorder level
   */
  createReorderLevelItemForm(): FormGroup {
    return this.fb.group({
      productId: [
        '', 
        [Validators.required]
      ],
      currentLevel: [
        { value: 0, disabled: true }
      ],
      newReorderLevel: [
        0, 
        [Validators.required, Validators.min(0), this.numericValidator()]
      ],
      maxStockLevel: [
        null, 
        [Validators.min(0), this.numericValidator()]
      ]
    });
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  /**
   * Add movement item to bulk movement form
   */
  addMovementItem(form: FormGroup): void {
    const movementsArray = form.get('movements') as FormArray;
    movementsArray.push(this.createMovementItemForm());
  }

  /**
   * Remove movement item from bulk movement form
   */
  removeMovementItem(form: FormGroup, index: number): void {
    const movementsArray = form.get('movements') as FormArray;
    movementsArray.removeAt(index);
  }

  /**
   * Add reorder level item to bulk reorder form
   */
  addReorderLevelItem(form: FormGroup): void {
    const productsArray = form.get('products') as FormArray;
    productsArray.push(this.createReorderLevelItemForm());
  }

  /**
   * Remove reorder level item from bulk reorder form
   */
  removeReorderLevelItem(form: FormGroup, index: number): void {
    const productsArray = form.get('products') as FormArray;
    productsArray.removeAt(index);
  }

  /**
   * Convert form data to CreateProductInventory DTO
   */
  mapToCreateProductInventory(formValue: any): CreateProductInventory {
    return {
      productId: formValue.productId,
      locationId: formValue.locationId,
      quantityAvailable: Number(formValue.quantityAvailable),
      quantityReserved: Number(formValue.quantityReserved || 0),
      quantityOnOrder: Number(formValue.quantityOnOrder || 0),
      reorderLevel: Number(formValue.reorderLevel),
      maxStockLevel: formValue.maxStockLevel ? Number(formValue.maxStockLevel) : undefined,
      costPerUnit: Number(formValue.costPerUnit)
    };
  }

  /**
   * Convert form data to UpdateProductInventory DTO
   */
  mapToUpdateProductInventory(formValue: any): UpdateProductInventory {
    const update: UpdateProductInventory = {};
    
    if (formValue.quantityAvailable !== undefined) {
      update.quantityAvailable = Number(formValue.quantityAvailable);
    }
    if (formValue.quantityReserved !== undefined) {
      update.quantityReserved = Number(formValue.quantityReserved);
    }
    if (formValue.quantityOnOrder !== undefined) {
      update.quantityOnOrder = Number(formValue.quantityOnOrder);
    }
    if (formValue.reorderLevel !== undefined) {
      update.reorderLevel = Number(formValue.reorderLevel);
    }
    if (formValue.maxStockLevel !== undefined && formValue.maxStockLevel !== null) {
      update.maxStockLevel = Number(formValue.maxStockLevel);
    }
    if (formValue.costPerUnit !== undefined) {
      update.costPerUnit = Number(formValue.costPerUnit);
    }

    return update;
  }

  // =============================================================================
  // CUSTOM VALIDATORS
  // =============================================================================

  private numericValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value !== null && value !== undefined && value !== '' && isNaN(Number(value))) {
        return { 'numeric': true };
      }
      return null;
    };
  }

  private currencyValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value !== null && value !== undefined && value !== '') {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue < 0) {
          return { 'currency': true };
        }
        const decimalPlaces = (value.toString().split('.')[1] || '').length;
        if (decimalPlaces > 4) {
          return { 'currencyPrecision': true };
        }
      }
      return null;
    };
  }

  private quantityValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value !== null && value !== undefined && value !== '' && (isNaN(Number(value)) || Number(value) === 0)) {
        return { 'quantity': true };
      }
      return null;
    };
  }

  private adjustmentQuantityValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value !== null && value !== undefined && value !== '' && (isNaN(Number(value)) || Number(value) === 0)) {
        return { 'adjustmentQuantity': true };
      }
      return null;
    };
  }

  private codeValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value && !/^[A-Z0-9_-]+$/i.test(value)) {
        return { 'code': true };
      }
      return null;
    };
  }

  private inventoryLevelsValidator() {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      if (!(formGroup instanceof FormGroup)) return null;
      const reorderLevel = formGroup.get('reorderLevel')?.value;
      const maxStockLevel = formGroup.get('maxStockLevel')?.value;
      if (reorderLevel && maxStockLevel && Number(reorderLevel) >= Number(maxStockLevel)) {
        return { 'inventoryLevels': true };
      }
      return null;
    };
  }

  private transferLocationValidator() {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      if (!(formGroup instanceof FormGroup)) return null;
      const fromLocationId = formGroup.get('fromLocationId')?.value;
      const toLocationId = formGroup.get('toLocationId')?.value;
      if (fromLocationId && toLocationId && fromLocationId === toLocationId) {
        return { 'sameLocation': true };
      }
      return null;
    };
  }
}
