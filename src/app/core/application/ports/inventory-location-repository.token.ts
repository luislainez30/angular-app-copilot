import { InjectionToken } from '@angular/core';
import { IInventoryLocationRepository } from '../../domain/repositories/inventory-location.repository';

/**
 * Injection token for inventory location repository
 * This allows dependency injection of the inventory location repository implementation
 */
export const INVENTORY_LOCATION_REPOSITORY_TOKEN = new InjectionToken<IInventoryLocationRepository>('InventoryLocationRepository');