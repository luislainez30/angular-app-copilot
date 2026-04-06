import { InjectionToken } from '@angular/core';
import { IInventoryRepository } from '../../domain/repositories/inventory.repository';

/**
 * Injection token for inventory repository
 * This allows dependency injection of the inventory repository implementation
 */
export const INVENTORY_REPOSITORY_TOKEN = new InjectionToken<IInventoryRepository>('InventoryRepository');