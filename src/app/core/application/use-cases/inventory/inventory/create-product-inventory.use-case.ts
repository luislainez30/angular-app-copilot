import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  ProductInventory, 
  CreateProductInventory
} from '../../../../domain/models/inventory/inventory.interface';
import { INVENTORY_REPOSITORY_TOKEN } from '../../../ports/inventory-repository.token';

/**
 * Use case for creating product inventory records
 */
@Injectable({
  providedIn: 'root'
})
export class CreateProductInventoryUseCase {
  private readonly inventoryRepository = inject(INVENTORY_REPOSITORY_TOKEN);

  /**
   * Create inventory record for a product
   */
  createProductInventory(inventory: CreateProductInventory): Observable<ProductInventory> {
    return this.inventoryRepository.createProductInventory(inventory);
  }
}