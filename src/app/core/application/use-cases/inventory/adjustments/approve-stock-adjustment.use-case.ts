import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { StockAdjustment } from '../../../../domain/models/inventory/inventory.interface';
import { INVENTORY_REPOSITORY_TOKEN } from '../../../ports/inventory-repository.token';

/**
 * Use case for approving and cancelling stock adjustments
 */
@Injectable({
  providedIn: 'root'
})
export class ApproveStockAdjustmentUseCase {
  private readonly inventoryRepository = inject(INVENTORY_REPOSITORY_TOKEN);

  /**
   * Cancel a pending stock adjustment
   * @param adjustmentId - The adjustment identifier to cancel
   * @param reason - Optional cancellation reason
   * @returns Observable of the cancelled adjustment
   * @throws Error if adjustment cannot be cancelled
   */
  cancelStockAdjustment(adjustmentId: string, reason?: string): Observable<StockAdjustment> {
    if (!adjustmentId?.trim()) {
      throw new Error('Adjustment ID is required');
    }

    return this.inventoryRepository.cancelStockAdjustment(adjustmentId.trim(), reason?.trim());
  }

  /**
   * Approve a pending stock adjustment
   * @param adjustmentId - The adjustment identifier to approve
   * @param approvedBy - User who is approving the adjustment
   * @returns Observable of the approved adjustment
   * @throws Error if adjustment cannot be approved
   */
  approveStockAdjustment(adjustmentId: string, approvedBy: string): Observable<StockAdjustment> {
    if (!adjustmentId?.trim()) {
      throw new Error('Adjustment ID is required');
    }
    
    if (!approvedBy?.trim()) {
      throw new Error('Approver information is required');
    }

    return this.inventoryRepository.approveStockAdjustment(adjustmentId.trim(), approvedBy.trim());
  }
}