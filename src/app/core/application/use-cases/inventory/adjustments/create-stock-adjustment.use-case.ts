import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  StockAdjustment,
  CreateStockAdjustment,
  StockAdjustmentReason
} from '../../../../domain/models/inventory/inventory.interface';
import { INVENTORY_REPOSITORY_TOKEN } from '../../../ports/inventory-repository.token';

/**
 * Use case for creating stock adjustments
 */
@Injectable({
  providedIn: 'root'
})
export class CreateStockAdjustmentUseCase {
  private readonly inventoryRepository = inject(INVENTORY_REPOSITORY_TOKEN);

  /**
   * Create a new stock adjustment
   * @param adjustmentData - The data for creating the adjustment
   * @returns Observable of the created adjustment
   * @throws Error if validation fails
   */
  createStockAdjustment(adjustmentData: CreateStockAdjustment): Observable<StockAdjustment> {
    // Validate required fields
    if (!adjustmentData.productId) {
      throw new Error('Product ID is required');
    }
    
    if (!adjustmentData.locationId?.trim()) {
      throw new Error('Location ID is required');
    }
    
    if (!adjustmentData.reason) {
      throw new Error('Adjustment reason is required');
    }
    
    if (adjustmentData.quantityAdjusted === 0) {
      throw new Error('Adjustment quantity cannot be zero');
    }
    
    if (adjustmentData.quantityAdjusted === undefined || adjustmentData.quantityAdjusted === null) {
      throw new Error('Adjustment quantity is required');
    }

    // Validate reason-specific requirements
    if (adjustmentData.reason === StockAdjustmentReason.OTHER && !adjustmentData.notes?.trim()) {
      throw new Error('Notes are required when reason is "Other"');
    }

    // Set default values
    const adjustmentToCreate: CreateStockAdjustment = {
      ...adjustmentData,
      locationId: adjustmentData.locationId.trim(),
      notes: adjustmentData.notes?.trim() || undefined,
      reference: adjustmentData.reference?.trim() || undefined,
      requiresApproval: adjustmentData.requiresApproval ?? this.requiresApproval(adjustmentData)
    };

    return this.inventoryRepository.createStockAdjustment(adjustmentToCreate);
  }

  /**
   * Determine if an adjustment requires approval based on business rules
   * @param adjustmentData - The adjustment data to evaluate
   * @returns Boolean indicating if approval is required
   */
  private requiresApproval(adjustmentData: CreateStockAdjustment): boolean {
    // Business rules for when approval is required
    const highValueThreshold = 1000; // Adjustments over $1000
    const highQuantityThreshold = 100; // Adjustments over 100 units
    const reasonsRequiringApproval = [
      StockAdjustmentReason.THEFT_LOSS,
      StockAdjustmentReason.WRITE_OFF
    ];

    // Check value threshold
    if (adjustmentData.unitCost && 
        Math.abs(adjustmentData.quantityAdjusted * adjustmentData.unitCost) >= highValueThreshold) {
      return true;
    }

    // Check quantity threshold
    if (Math.abs(adjustmentData.quantityAdjusted) >= highQuantityThreshold) {
      return true;
    }

    // Check specific reasons
    if (reasonsRequiringApproval.includes(adjustmentData.reason)) {
      return true;
    }

    return false;
  }
}