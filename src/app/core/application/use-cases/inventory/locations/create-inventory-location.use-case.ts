import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  InventoryLocation,
  CreateInventoryLocation
} from '../../../../domain/models/inventory/inventory.interface';
import { IInventoryLocationRepository } from '../../../../domain/repositories/inventory-location.repository';
import { INVENTORY_LOCATION_REPOSITORY_TOKEN } from '../../../ports/inventory-location-repository.token';

/**
 * Use case for creating inventory locations
 */
@Injectable({
  providedIn: 'root'
})
export class CreateInventoryLocationUseCase {
  private readonly locationRepository = inject(INVENTORY_LOCATION_REPOSITORY_TOKEN);

  /**
   * Create a new inventory location
   * @param locationData - The data for creating the location
   * @returns Observable of the created location
   * @throws Error if location code already exists
   */
  execute(locationData: CreateInventoryLocation): Observable<InventoryLocation> {
    // Validate required fields
    if (!locationData.name?.trim()) {
      throw new Error('Location name is required');
    }
    
    if (!locationData.code?.trim()) {
      throw new Error('Location code is required');
    }

    // Set default values
    const locationToCreate: CreateInventoryLocation = {
      ...locationData,
      name: locationData.name.trim(),
      code: locationData.code.trim().toUpperCase(),
      isActive: locationData.isActive ?? true
    };

    return this.locationRepository.create(locationToCreate);
  }

  /**
   * Check if a location code is available
   * @param code - The code to check
   * @returns Observable of boolean indicating if code is unique
   */
  isCodeAvailable(code: string): Observable<boolean> {
    if (!code?.trim()) {
      throw new Error('Code is required');
    }
    
    return this.locationRepository.isCodeUnique(code.trim().toUpperCase());
  }
}