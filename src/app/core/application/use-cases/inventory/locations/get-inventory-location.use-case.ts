import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { InventoryLocation } from '../../../../domain/models/inventory/inventory.interface';
import { INVENTORY_LOCATION_REPOSITORY_TOKEN } from '../../../ports/inventory-location-repository.token';

/**
 * Use case for retrieving a single inventory location
 */
@Injectable({
  providedIn: 'root'
})
export class GetInventoryLocationUseCase {
  private readonly inventoryLocationRepository = inject(INVENTORY_LOCATION_REPOSITORY_TOKEN);

  /**
   * Get inventory location by ID
   */
  getInventoryLocationById(id: string): Observable<InventoryLocation | null> {
    if (!id?.trim()) {
      throw new Error('Location ID is required');
    }
    
    return this.inventoryLocationRepository.getById(id.trim());
  }

  /**
   * Get inventory location by code
   */
  getInventoryLocationByCode(code: string): Observable<InventoryLocation | null> {
    if (!code?.trim()) {
      throw new Error('Location code is required');
    }
    
    return this.inventoryLocationRepository.getByCode(code.trim());
  }

  /**
   * Get inventory locations by type
   */
  getInventoryLocationsByType(type: 'warehouse' | 'store' | 'supplier'): Observable<InventoryLocation[]> {
    return this.inventoryLocationRepository.getByType(type);
  }

  /**
   * Get active inventory locations only
   */
  getActiveInventoryLocations(): Observable<InventoryLocation[]> {
    return this.inventoryLocationRepository.getActive();
  }
}