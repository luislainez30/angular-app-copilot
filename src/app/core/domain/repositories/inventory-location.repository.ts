import { Observable } from 'rxjs';
import { 
  InventoryLocation,
  CreateInventoryLocation,
  UpdateInventoryLocation
} from '../models/inventory/inventory.interface';

/**
 * Inventory Location repository interface - defines data access contract for location management
 * Infrastructure layer will implement this interface
 */
export interface IInventoryLocationRepository {
  /**
   * Get all inventory locations
   */
  getAll(): Observable<InventoryLocation[]>;

  /**
   * Get active inventory locations only
   */
  getActive(): Observable<InventoryLocation[]>;

  /**
   * Get location by ID
   */
  getById(id: string): Observable<InventoryLocation | null>;

  /**
   * Get location by code
   */
  getByCode(code: string): Observable<InventoryLocation | null>;

  /**
   * Get locations by type
   */
  getByType(type: 'warehouse' | 'store' | 'supplier'): Observable<InventoryLocation[]>;

  /**
   * Create a new inventory location
   */
  create(location: CreateInventoryLocation): Observable<InventoryLocation>;

  /**
   * Update an existing inventory location
   */
  update(id: string, updates: UpdateInventoryLocation): Observable<InventoryLocation>;

  /**
   * Delete an inventory location
   */
  delete(id: string): Observable<boolean>;

  /**
   * Check if location code is unique
   */
  isCodeUnique(code: string, excludeId?: string): Observable<boolean>;
}