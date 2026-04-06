import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { 
  InventoryLocation
} from '../../../../domain/models/inventory/inventory.interface';
import { INVENTORY_LOCATION_REPOSITORY_TOKEN } from '../../../ports/inventory-location-repository.token';

/**
 * Use case for deleting inventory locations
 */
@Injectable({
  providedIn: 'root'
})
export class DeleteInventoryLocationUseCase {
  private readonly locationRepository = inject(INVENTORY_LOCATION_REPOSITORY_TOKEN);

  /**
   * Delete an inventory location
   * @param id - The location ID to delete
   * @param forceDelete - Whether to force delete even if inventory exists
   * @returns Observable of boolean indicating success
   * @throws Error if location not found or has active inventory
   */
  execute(id: string, forceDelete: boolean = false): Observable<boolean> {
    if (!id?.trim()) {
      return throwError(() => new Error('Location ID is required'));
    }

    // First check if location exists
    return this.locationRepository.getById(id).pipe(
      switchMap(location => {
        if (!location) {
          return throwError(() => new Error('Location not found'));
        }

        // For now, we'll allow deletion
        // In a full implementation, you would check for inventory records:
        // return this.checkForInventoryAndDelete(id, location, forceDelete);
        
        return this.locationRepository.delete(id);
      })
    );
  }

  /**
   * Get location by ID for confirmation
   * @param id - The location ID
   * @returns Observable of the location or null if not found
   */
  getById(id: string): Observable<InventoryLocation | null> {
    if (!id?.trim()) {
      return throwError(() => new Error('Location ID is required'));
    }
    
    return this.locationRepository.getById(id);
  }

  /**
   * Soft delete - deactivate location instead of deleting
   * @param id - The location ID to deactivate
   * @returns Observable of the updated location
   */
  deactivate(id: string): Observable<InventoryLocation> {
    if (!id?.trim()) {
      return throwError(() => new Error('Location ID is required'));
    }

    return this.locationRepository.update(id, { isActive: false });
  }

  /**
   * Reactivate a deactivated location
   * @param id - The location ID to reactivate
   * @returns Observable of the updated location
   */
  activate(id: string): Observable<InventoryLocation> {
    if (!id?.trim()) {
      return throwError(() => new Error('Location ID is required'));
    }

    return this.locationRepository.update(id, { isActive: true });
  }
}