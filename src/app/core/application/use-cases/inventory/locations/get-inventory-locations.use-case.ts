import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { InventoryLocation } from '../../../../domain/models/inventory/inventory.interface';
import { INVENTORY_REPOSITORY_TOKEN } from '../../../ports/inventory-repository.token';

/**
 * Use case for retrieving all inventory locations
 */
@Injectable({
  providedIn: 'root'
})
export class GetInventoryLocationsUseCase {
  private readonly inventoryRepository = inject(INVENTORY_REPOSITORY_TOKEN);

  /**
   * Get all inventory locations
   */
  getInventoryLocations(): Observable<InventoryLocation[]> {
    return this.inventoryRepository.getInventoryLocations();
  }
}