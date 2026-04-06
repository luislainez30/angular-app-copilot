import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { 
  InventoryLocation,
  CreateInventoryLocation,
  UpdateInventoryLocation
} from '../../core/domain/models/inventory/inventory.interface';
import { IInventoryLocationRepository } from '../../core/domain/repositories/inventory-location.repository';

/**
 * Mock implementation of inventory location repository for development/testing
 * Simulates database operations with in-memory data
 */
@Injectable({
  providedIn: 'root'
})
export class InventoryLocationMockService implements IInventoryLocationRepository {

  private locations: InventoryLocation[] = [
    {
      id: 'loc-1',
      name: 'Main Warehouse',
      code: 'WH-MAIN',
      address: '123 Industrial Blvd, City, State 12345',
      type: 'warehouse',
      isActive: true
    },
    {
      id: 'loc-2',
      name: 'Downtown Store',
      code: 'ST-DOWN',
      address: '456 Main Street, Downtown, City, State 12345',
      type: 'store',
      isActive: true
    },
    {
      id: 'loc-3',
      name: 'Secondary Warehouse',
      code: 'WH-SEC',
      address: '789 Commerce Ave, Industrial Park, City, State 12345',
      type: 'warehouse',
      isActive: true
    },
    {
      id: 'loc-4',
      name: 'Northside Store',
      code: 'ST-NORTH',
      address: '321 North Boulevard, Northside, City, State 12345',
      type: 'store',
      isActive: true
    },
    {
      id: 'loc-5',
      name: 'Export Warehouse',
      code: 'WH-EXPORT',
      address: '555 Export Route, Port District, City, State 12345',
      type: 'warehouse',
      isActive: false
    }
  ];

  // Track next ID for new locations
  private nextId = 6;

  /**
   * Get all inventory locations
   */
  getAll(): Observable<InventoryLocation[]> {
    return of([...this.locations]).pipe(
      delay(100) // Simulate network delay
    );
  }

  /**
   * Get active inventory locations only
   */
  getActive(): Observable<InventoryLocation[]> {
    return of(this.locations.filter(location => location.isActive)).pipe(
      delay(100)
    );
  }

  /**
   * Get location by ID
   */
  getById(id: string): Observable<InventoryLocation | null> {
    const location = this.locations.find(loc => loc.id === id);
    return of(location || null).pipe(
      delay(100)
    );
  }

  /**
   * Get location by code
   */
  getByCode(code: string): Observable<InventoryLocation | null> {
    const location = this.locations.find(loc => 
      loc.code.toUpperCase() === code.toUpperCase()
    );
    return of(location || null).pipe(
      delay(100)
    );
  }

  /**
   * Get locations by type
   */
  getByType(type: 'warehouse' | 'store' | 'supplier'): Observable<InventoryLocation[]> {
    const filteredLocations = this.locations.filter(loc => loc.type === type);
    return of(filteredLocations).pipe(
      delay(100)
    );
  }

  /**
   * Create a new inventory location
   */
  create(locationData: CreateInventoryLocation): Observable<InventoryLocation> {
    // Check if code already exists
    const existingLocation = this.locations.find(loc => 
      loc.code.toUpperCase() === locationData.code.toUpperCase()
    );

    if (existingLocation) {
      return throwError(() => new Error(`Location with code '${locationData.code}' already exists`));
    }

    // Create new location
    const newLocation: InventoryLocation = {
      id: `loc-${this.nextId++}`,
      name: locationData.name,
      code: locationData.code.toUpperCase(),
      address: locationData.address || '',
      type: locationData.type,
      isActive: locationData.isActive ?? true
    };

    // Add to locations array
    this.locations.push(newLocation);

    return of(newLocation).pipe(
      delay(200) // Simulate network delay for create operation
    );
  }

  /**
   * Update an existing inventory location
   */
  update(id: string, updates: UpdateInventoryLocation): Observable<InventoryLocation> {
    const locationIndex = this.locations.findIndex(loc => loc.id === id);
    
    if (locationIndex === -1) {
      return throwError(() => new Error(`Location with ID '${id}' not found`));
    }

    // Check if code update conflicts with existing location
    if (updates.code) {
      const existingLocation = this.locations.find(loc => 
        loc.id !== id && 
        loc.code.toUpperCase() === updates.code!.toUpperCase()
      );

      if (existingLocation) {
        return throwError(() => new Error(`Location with code '${updates.code}' already exists`));
      }
    }

    // Update the location
    const currentLocation = this.locations[locationIndex];
    const updatedLocation: InventoryLocation = {
      ...currentLocation,
      ...updates,
      code: updates.code ? updates.code.toUpperCase() : currentLocation.code
    };

    this.locations[locationIndex] = updatedLocation;

    return of(updatedLocation).pipe(
      delay(200)
    );
  }

  /**
   * Delete an inventory location
   */
  delete(id: string): Observable<boolean> {
    const locationIndex = this.locations.findIndex(loc => loc.id === id);
    
    if (locationIndex === -1) {
      return throwError(() => new Error(`Location with ID '${id}' not found`));
    }

    // Remove from array
    this.locations.splice(locationIndex, 1);

    return of(true).pipe(
      delay(150)
    );
  }

  /**
   * Check if location code is unique
   */
  isCodeUnique(code: string, excludeId?: string): Observable<boolean> {
    const existingLocation = this.locations.find(loc => 
      loc.code.toUpperCase() === code.toUpperCase() && 
      (!excludeId || loc.id !== excludeId)
    );

    return of(!existingLocation).pipe(
      delay(100)
    );
  }

  /**
   * Search locations by name or code
   */
  search(searchTerm: string): Observable<InventoryLocation[]> {
    const term = searchTerm.toLowerCase();
    const filtered = this.locations.filter(loc =>
      loc.name.toLowerCase().includes(term) ||
      loc.code.toLowerCase().includes(term) ||
      (loc.address && loc.address.toLowerCase().includes(term))
    );

    return of(filtered).pipe(
      delay(150)
    );
  }
}