import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { 
  InventoryLocation,
  UpdateInventoryLocation
} from '../../../../domain/models/inventory/inventory.interface';
import { IInventoryLocationRepository } from '../../../../domain/repositories/inventory-location.repository';
import { INVENTORY_LOCATION_REPOSITORY_TOKEN } from '../../../ports/inventory-location-repository.token';

/**
 * Use case for updating inventory locations
 */
@Injectable({
  providedIn: 'root'
})
export class UpdateInventoryLocationUseCase {
  private readonly locationRepository = inject(INVENTORY_LOCATION_REPOSITORY_TOKEN);

  /**
   * Update an existing inventory location
   * @param id - The location ID to update
   * @param updates - The partial data to update
   * @returns Observable of the updated location
   * @throws Error if location not found or code already exists
   */
  execute(id: string, updates: UpdateInventoryLocation): Observable<InventoryLocation> {
    if (!id?.trim()) {
      return throwError(() => new Error('Location ID is required'));
    }

    // Validate and clean the updates
    const cleanUpdates: UpdateInventoryLocation = {};
    
    if (updates.name !== undefined) {
      if (!updates.name?.trim()) {
        return throwError(() => new Error('Location name cannot be empty'));
      }
      cleanUpdates.name = updates.name.trim();
    }

    if (updates.code !== undefined) {
      if (!updates.code?.trim()) {
        return throwError(() => new Error('Location code cannot be empty'));
      }
      cleanUpdates.code = updates.code.trim().toUpperCase();
    }

    if (updates.type !== undefined) {
      cleanUpdates.type = updates.type;
    }

    if (updates.address !== undefined) {
      cleanUpdates.address = updates.address?.trim() || undefined;
    }

    if (updates.isActive !== undefined) {
      cleanUpdates.isActive = updates.isActive;
    }

    // If code is being updated, check if it's unique
    if (cleanUpdates.code) {
      return this.locationRepository.isCodeUnique(cleanUpdates.code, id).pipe(
        switchMap(isUnique => {
          if (!isUnique) {
            return throwError(() => new Error(`Location code '${cleanUpdates.code}' is already in use`));
          }
          return this.locationRepository.update(id, cleanUpdates);
        })
      );
    }

    // Otherwise, proceed with update
    return this.locationRepository.update(id, cleanUpdates);
  }

  /**
   * Get location by ID for editing
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
   * Check if a location code is available (excluding current location)
   * @param code - The code to check
   * @param currentLocationId - The current location ID to exclude
   * @returns Observable of boolean indicating if code is unique
   */
  isCodeAvailable(code: string, currentLocationId: string): Observable<boolean> {
    if (!code?.trim()) {
      return throwError(() => new Error('Code is required'));
    }
    
    if (!currentLocationId?.trim()) {
      return throwError(() => new Error('Current location ID is required'));
    }
    
    return this.locationRepository.isCodeUnique(code.trim().toUpperCase(), currentLocationId);
  }
}