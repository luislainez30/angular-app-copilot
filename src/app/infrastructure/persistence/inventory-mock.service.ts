import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, switchMap, map } from 'rxjs/operators';
import { 
  ProductInventory,
  CreateProductInventory,
  UpdateProductInventory,
  StockMovement,
  InventoryAggregate,
  InventoryLocation,
  StockStatus,
  StockAdjustment,
  CreateStockAdjustment,
  StockAdjustmentReason
} from '../../core/domain/models/inventory/inventory.interface';
import { ProductId } from '../../core/domain/models/products/product-types';
// Simple create interfaces for this mock service
interface CreateInventoryLocation {
  name: string;
  code: string;
  type: 'warehouse' | 'store' | 'supplier';
  address?: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryMockService {
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
    }
  ];

  private inventory: ProductInventory[] = [
    // Product 1 - High-demand item across all locations
    {
      productId: '1' as ProductId,
      locationId: 'loc-1',
      quantityAvailable: 150,
      quantityReserved: 25,
      quantityOnOrder: 0,
      reorderLevel: 20,
      maxStockLevel: 500,
      costPerUnit: 45.50,
      lastUpdated: new Date('2024-03-18'),
      lastStockMovement: new Date('2024-03-18')
    },
    {
      productId: '1' as ProductId,
      locationId: 'loc-2',
      quantityAvailable: 45,
      quantityReserved: 8,
      quantityOnOrder: 50,
      reorderLevel: 10,
      maxStockLevel: 100,
      costPerUnit: 45.50,
      lastUpdated: new Date('2024-03-17'),
      lastStockMovement: new Date('2024-03-17')
    },
    {
      productId: '1' as ProductId,
      locationId: 'loc-3',
      quantityAvailable: 75,
      quantityReserved: 12,
      quantityOnOrder: 25,
      reorderLevel: 15,
      maxStockLevel: 200,
      costPerUnit: 45.50,
      lastUpdated: new Date('2024-03-16'),
      lastStockMovement: new Date('2024-03-16')
    },
    
    // Product 2 - Low stock item
    {
      productId: '2' as ProductId,
      locationId: 'loc-1',
      quantityAvailable: 5,
      quantityReserved: 2,
      quantityOnOrder: 100,
      reorderLevel: 15,
      maxStockLevel: 200,
      costPerUnit: 12.99,
      lastUpdated: new Date('2024-03-16'),
      lastStockMovement: new Date('2024-03-16')
    },
    {
      productId: '2' as ProductId,
      locationId: 'loc-2',
      quantityAvailable: 8,
      quantityReserved: 0,
      quantityOnOrder: 50,
      reorderLevel: 10,
      maxStockLevel: 150,
      costPerUnit: 12.99,
      lastUpdated: new Date('2024-03-15'),
      lastStockMovement: new Date('2024-03-15')
    },
    {
      productId: '2' as ProductId,
      locationId: 'loc-3',
      quantityAvailable: 0,
      quantityReserved: 0,
      quantityOnOrder: 75,
      reorderLevel: 12,
      maxStockLevel: 180,
      costPerUnit: 12.99,
      lastUpdated: new Date('2024-03-14'),
      lastStockMovement: new Date('2024-03-14')
    },

    // Product 3 - Seasonal item
    {
      productId: '3' as ProductId,
      locationId: 'loc-1',
      quantityAvailable: 200,
      quantityReserved: 45,
      quantityOnOrder: 0,
      reorderLevel: 30,
      maxStockLevel: 800,
      costPerUnit: 8.75,
      lastUpdated: new Date('2024-03-19'),
      lastStockMovement: new Date('2024-03-19')
    },
    {
      productId: '3' as ProductId,
      locationId: 'loc-2',
      quantityAvailable: 89,
      quantityReserved: 15,
      quantityOnOrder: 0,
      reorderLevel: 25,
      maxStockLevel: 300,
      costPerUnit: 8.75,
      lastUpdated: new Date('2024-03-18'),
      lastStockMovement: new Date('2024-03-18')
    },

    // Product 4 - Premium item (store only)
    {
      productId: '4' as ProductId,
      locationId: 'loc-2',
      quantityAvailable: 15,
      quantityReserved: 3,
      quantityOnOrder: 10,
      reorderLevel: 5,
      maxStockLevel: 50,
      costPerUnit: 125.00,
      lastUpdated: new Date('2024-03-17'),
      lastStockMovement: new Date('2024-03-17')
    },

    // Product 5 - Bulk warehouse item
    {
      productId: '5' as ProductId,
      locationId: 'loc-1',
      quantityAvailable: 500,
      quantityReserved: 80,
      quantityOnOrder: 200,
      reorderLevel: 100,
      maxStockLevel: 1000,
      costPerUnit: 3.25,
      lastUpdated: new Date('2024-03-18'),
      lastStockMovement: new Date('2024-03-18')
    },
    {
      productId: '5' as ProductId,
      locationId: 'loc-3',
      quantityAvailable: 300,
      quantityReserved: 50,
      quantityOnOrder: 150,
      reorderLevel: 75,
      maxStockLevel: 750,
      costPerUnit: 3.25,
      lastUpdated: new Date('2024-03-16'),
      lastStockMovement: new Date('2024-03-16')
    },

    // Product 6 - Regular inventory
    {
      productId: '6' as ProductId,
      locationId: 'loc-1',
      quantityAvailable: 85,
      quantityReserved: 15,
      quantityOnOrder: 0,
      reorderLevel: 25,
      maxStockLevel: 300,
      costPerUnit: 22.50,
      lastUpdated: new Date('2024-03-17'),
      lastStockMovement: new Date('2024-03-17')
    },
    {
      productId: '6' as ProductId,
      locationId: 'loc-2',
      quantityAvailable: 32,
      quantityReserved: 8,
      quantityOnOrder: 30,
      reorderLevel: 15,
      maxStockLevel: 120,
      costPerUnit: 22.50,
      lastUpdated: new Date('2024-03-16'),
      lastStockMovement: new Date('2024-03-16')
    },
    {
      productId: '6' as ProductId,
      locationId: 'loc-3',
      quantityAvailable: 65,
      quantityReserved: 10,
      quantityOnOrder: 20,
      reorderLevel: 20,
      maxStockLevel: 250,
      costPerUnit: 22.50,
      lastUpdated: new Date('2024-03-15'),
      lastStockMovement: new Date('2024-03-15')
    },

    // Product 7 - Fast moving consumer good
    {
      productId: '7' as ProductId,
      locationId: 'loc-1',
      quantityAvailable: 320,
      quantityReserved: 60,
      quantityOnOrder: 0,
      reorderLevel: 50,
      maxStockLevel: 600,
      costPerUnit: 15.99,
      lastUpdated: new Date('2024-03-19'),
      lastStockMovement: new Date('2024-03-19')
    },
    {
      productId: '7' as ProductId,
      locationId: 'loc-2',
      quantityAvailable: 125,
      quantityReserved: 25,
      quantityOnOrder: 75,
      reorderLevel: 30,
      maxStockLevel: 400,
      costPerUnit: 15.99,
      lastUpdated: new Date('2024-03-18'),
      lastStockMovement: new Date('2024-03-18')
    },

    // Product 8 - Discontinued item
    {
      productId: '8' as ProductId,
      locationId: 'loc-1',
      quantityAvailable: 12,
      quantityReserved: 0,
      quantityOnOrder: 0,
      reorderLevel: 0,
      maxStockLevel: 0,
      costPerUnit: 35.00,
      lastUpdated: new Date('2024-02-15'),
      lastStockMovement: new Date('2024-02-15')
    },
    {
      productId: '8' as ProductId,
      locationId: 'loc-2',
      quantityAvailable: 3,
      quantityReserved: 0,
      quantityOnOrder: 0,
      reorderLevel: 0,
      maxStockLevel: 0,
      costPerUnit: 35.00,
      lastUpdated: new Date('2024-02-10'),
      lastStockMovement: new Date('2024-02-10')
    },

    // Product 9 - New product launch
    {
      productId: '9' as ProductId,
      locationId: 'loc-1',
      quantityAvailable: 180,
      quantityReserved: 35,
      quantityOnOrder: 300,
      reorderLevel: 40,
      maxStockLevel: 500,
      costPerUnit: 28.75,
      lastUpdated: new Date('2024-03-20'),
      lastStockMovement: new Date('2024-03-20')
    },
    {
      productId: '9' as ProductId,
      locationId: 'loc-2',
      quantityAvailable: 95,
      quantityReserved: 18,
      quantityOnOrder: 150,
      reorderLevel: 25,
      maxStockLevel: 300,
      costPerUnit: 28.75,
      lastUpdated: new Date('2024-03-19'),
      lastStockMovement: new Date('2024-03-19')
    },
    {
      productId: '9' as ProductId,
      locationId: 'loc-3',
      quantityAvailable: 120,
      quantityReserved: 22,
      quantityOnOrder: 200,
      reorderLevel: 35,
      maxStockLevel: 400,
      costPerUnit: 28.75,
      lastUpdated: new Date('2024-03-18'),
      lastStockMovement: new Date('2024-03-18')
    },

    // Product 10 - Electronics component
    {
      productId: '10' as ProductId,
      locationId: 'loc-1',
      quantityAvailable: 450,
      quantityReserved: 90,
      quantityOnOrder: 0,
      reorderLevel: 100,
      maxStockLevel: 1200,
      costPerUnit: 5.50,
      lastUpdated: new Date('2024-03-17'),
      lastStockMovement: new Date('2024-03-17')
    },
    {
      productId: '10' as ProductId,
      locationId: 'loc-3',
      quantityAvailable: 280,
      quantityReserved: 45,
      quantityOnOrder: 200,
      reorderLevel: 75,
      maxStockLevel: 800,
      costPerUnit: 5.50,
      lastUpdated: new Date('2024-03-16'),
      lastStockMovement: new Date('2024-03-16')
    },

    // Product 11 - Office supplies
    {
      productId: '11' as ProductId,
      locationId: 'loc-1',
      quantityAvailable: 250,
      quantityReserved: 40,
      quantityOnOrder: 100,
      reorderLevel: 60,
      maxStockLevel: 600,
      costPerUnit: 7.25,
      lastUpdated: new Date('2024-03-18'),
      lastStockMovement: new Date('2024-03-18')
    },
    {
      productId: '11' as ProductId,
      locationId: 'loc-2',
      quantityAvailable: 85,
      quantityReserved: 15,
      quantityOnOrder: 50,
      reorderLevel: 30,
      maxStockLevel: 200,
      costPerUnit: 7.25,
      lastUpdated: new Date('2024-03-16'),
      lastStockMovement: new Date('2024-03-16')
    },

    // Product 12 - Seasonal clearance
    {
      productId: '12' as ProductId,
      locationId: 'loc-2',
      quantityAvailable: 25,
      quantityReserved: 5,
      quantityOnOrder: 0,
      reorderLevel: 5,
      maxStockLevel: 100,
      costPerUnit: 18.90,
      lastUpdated: new Date('2024-03-10'),
      lastStockMovement: new Date('2024-03-10')
    },
    {
      productId: '12' as ProductId,
      locationId: 'loc-3',
      quantityAvailable: 40,
      quantityReserved: 8,
      quantityOnOrder: 0,
      reorderLevel: 10,
      maxStockLevel: 150,
      costPerUnit: 18.90,
      lastUpdated: new Date('2024-03-12'),
      lastStockMovement: new Date('2024-03-12')
    },

    // Product 13 - Heavy machinery part
    {
      productId: '13' as ProductId,
      locationId: 'loc-1',
      quantityAvailable: 15,
      quantityReserved: 3,
      quantityOnOrder: 20,
      reorderLevel: 5,
      maxStockLevel: 50,
      costPerUnit: 250.00,
      lastUpdated: new Date('2024-03-15'),
      lastStockMovement: new Date('2024-03-15')
    },

    // Product 14 - Consumables
    {
      productId: '14' as ProductId,
      locationId: 'loc-1',
      quantityAvailable: 680,
      quantityReserved: 120,
      quantityOnOrder: 500,
      reorderLevel: 200,
      maxStockLevel: 2000,
      costPerUnit: 2.15,
      lastUpdated: new Date('2024-03-19'),
      lastStockMovement: new Date('2024-03-19')
    },
    {
      productId: '14' as ProductId,
      locationId: 'loc-2',
      quantityAvailable: 195,
      quantityReserved: 35,
      quantityOnOrder: 150,
      reorderLevel: 80,
      maxStockLevel: 500,
      costPerUnit: 2.15,
      lastUpdated: new Date('2024-03-17'),
      lastStockMovement: new Date('2024-03-17')
    },
    {
      productId: '14' as ProductId,
      locationId: 'loc-3',
      quantityAvailable: 420,
      quantityReserved: 75,
      quantityOnOrder: 300,
      reorderLevel: 150,
      maxStockLevel: 1200,
      costPerUnit: 2.15,
      lastUpdated: new Date('2024-03-18'),
      lastStockMovement: new Date('2024-03-18')
    },

    // Product 15 - Specialty item
    {
      productId: '15' as ProductId,
      locationId: 'loc-2',
      quantityAvailable: 8,
      quantityReserved: 2,
      quantityOnOrder: 15,
      reorderLevel: 3,
      maxStockLevel: 30,
      costPerUnit: 89.99,
      lastUpdated: new Date('2024-03-14'),
      lastStockMovement: new Date('2024-03-14')
    },
    {
      productId: '15' as ProductId,
      locationId: 'loc-3',
      quantityAvailable: 12,
      quantityReserved: 1,
      quantityOnOrder: 10,
      reorderLevel: 4,
      maxStockLevel: 40,
      costPerUnit: 89.99,
      lastUpdated: new Date('2024-03-13'),
      lastStockMovement: new Date('2024-03-13')
    },

    // Product 16 - Standard inventory
    {
      productId: '16' as ProductId,
      locationId: 'loc-1',
      quantityAvailable: 165,
      quantityReserved: 30,
      quantityOnOrder: 75,
      reorderLevel: 40,
      maxStockLevel: 400,
      costPerUnit: 19.50,
      lastUpdated: new Date('2024-03-16'),
      lastStockMovement: new Date('2024-03-16')
    },
    {
      productId: '16' as ProductId,
      locationId: 'loc-2',
      quantityAvailable: 95,
      quantityReserved: 18,
      quantityOnOrder: 50,
      reorderLevel: 25,
      maxStockLevel: 250,
      costPerUnit: 19.50,
      lastUpdated: new Date('2024-03-15'),
      lastStockMovement: new Date('2024-03-15')
    },

    // Product 17 - Luxury item
    {
      productId: '17' as ProductId,
      locationId: 'loc-2',
      quantityAvailable: 6,
      quantityReserved: 1,
      quantityOnOrder: 5,
      reorderLevel: 2,
      maxStockLevel: 20,
      costPerUnit: 350.00,
      lastUpdated: new Date('2024-03-12'),
      lastStockMovement: new Date('2024-03-12')
    },

    // Product 18 - Industrial supply
    {
      productId: '18' as ProductId,
      locationId: 'loc-1',
      quantityAvailable: 275,
      quantityReserved: 55,
      quantityOnOrder: 150,
      reorderLevel: 70,
      maxStockLevel: 700,
      costPerUnit: 11.75,
      lastUpdated: new Date('2024-03-17'),
      lastStockMovement: new Date('2024-03-17')
    },
    {
      productId: '18' as ProductId,
      locationId: 'loc-3',
      quantityAvailable: 185,
      quantityReserved: 35,
      quantityOnOrder: 100,
      reorderLevel: 50,
      maxStockLevel: 500,
      costPerUnit: 11.75,
      lastUpdated: new Date('2024-03-16'),
      lastStockMovement: new Date('2024-03-16')
    },

    // Product 19 - Out of stock item
    {
      productId: '19' as ProductId,
      locationId: 'loc-1',
      quantityAvailable: 0,
      quantityReserved: 0,
      quantityOnOrder: 200,
      reorderLevel: 25,
      maxStockLevel: 300,
      costPerUnit: 33.25,
      lastUpdated: new Date('2024-03-10'),
      lastStockMovement: new Date('2024-03-05')
    },
    {
      productId: '19' as ProductId,
      locationId: 'loc-2',
      quantityAvailable: 0,
      quantityReserved: 0,
      quantityOnOrder: 100,
      reorderLevel: 15,
      maxStockLevel: 180,
      costPerUnit: 33.25,
      lastUpdated: new Date('2024-03-08'),
      lastStockMovement: new Date('2024-03-03')
    },
    {
      productId: '19' as ProductId,
      locationId: 'loc-3',
      quantityAvailable: 2,
      quantityReserved: 2,
      quantityOnOrder: 150,
      reorderLevel: 20,
      maxStockLevel: 250,
      costPerUnit: 33.25,
      lastUpdated: new Date('2024-03-09'),
      lastStockMovement: new Date('2024-03-04')
    },

    // Product 20 - Overstocked item
    {
      productId: '20' as ProductId,
      locationId: 'loc-1',
      quantityAvailable: 850,
      quantityReserved: 120,
      quantityOnOrder: 0,
      reorderLevel: 100,
      maxStockLevel: 600,
      costPerUnit: 6.75,
      lastUpdated: new Date('2024-03-19'),
      lastStockMovement: new Date('2024-03-19')
    },
    {
      productId: '20' as ProductId,
      locationId: 'loc-2',
      quantityAvailable: 320,
      quantityReserved: 45,
      quantityOnOrder: 0,
      reorderLevel: 50,
      maxStockLevel: 300,
      costPerUnit: 6.75,
      lastUpdated: new Date('2024-03-18'),
      lastStockMovement: new Date('2024-03-18')
    },
    {
      productId: '20' as ProductId,
      locationId: 'loc-3',
      quantityAvailable: 480,
      quantityReserved: 65,
      quantityOnOrder: 0,
      reorderLevel: 80,
      maxStockLevel: 450,
      costPerUnit: 6.75,
      lastUpdated: new Date('2024-03-17'),
      lastStockMovement: new Date('2024-03-17')
    }
  ];

  // Stock Movements Mock Data - 2-3 movements per product (1-20)
  private stockMovements: StockMovement[] = [
    // Product 1 movements
    {
      id: 'mov-1-001',
      productId: '1' as ProductId,
      locationId: 'loc-1',
      movementType: 'purchase',
      quantity: 200,
      unitCost: 44.50,
      reference: 'PO-2024-001',
      notes: 'Initial stock purchase',
      createdAt: new Date('2024-02-15'),
      createdBy: 'admin@company.com'
    },
    {
      id: 'mov-1-002',
      productId: '1' as ProductId,
      locationId: 'loc-1',
      movementType: 'sale',
      quantity: -25,
      unitCost: 45.50,
      reference: 'SO-2024-045',
      notes: 'Bulk order shipment',
      createdAt: new Date('2024-03-10'),
      createdBy: 'sales@company.com'
    },
    {
      id: 'mov-1-003',
      productId: '1' as ProductId,
      locationId: 'loc-2',
      movementType: 'transfer',
      quantity: 50,
      unitCost: 45.50,
      reference: 'TR-2024-012',
      notes: 'Transfer from main warehouse',
      createdAt: new Date('2024-03-12'),
      createdBy: 'warehouse@company.com'
    },

    // Product 2 movements
    {
      id: 'mov-2-001',
      productId: '2' as ProductId,
      locationId: 'loc-1',
      movementType: 'purchase',
      quantity: 150,
      unitCost: 12.50,
      reference: 'PO-2024-008',
      notes: 'Supplier delivery',
      createdAt: new Date('2024-02-20'),
      createdBy: 'purchasing@company.com'
    },
    {
      id: 'mov-2-002',
      productId: '2' as ProductId,
      locationId: 'loc-1',
      movementType: 'sale',
      quantity: -120,
      unitCost: 12.99,
      reference: 'SO-2024-067',
      notes: 'Large customer order',
      createdAt: new Date('2024-03-08'),
      createdBy: 'sales@company.com'
    },
    {
      id: 'mov-2-003',
      productId: '2' as ProductId,
      locationId: 'loc-2',
      movementType: 'adjustment',
      quantity: -5,
      unitCost: 12.99,
      reference: 'ADJ-2024-003',
      notes: 'Inventory count correction',
      createdAt: new Date('2024-03-15'),
      createdBy: 'warehouse@company.com'
    },

    // Product 3 movements
    {
      id: 'mov-3-001',
      productId: '3' as ProductId,
      locationId: 'loc-1',
      movementType: 'purchase',
      quantity: 400,
      unitCost: 8.25,
      reference: 'PO-2024-015',
      notes: 'Seasonal stock preparation',
      createdAt: new Date('2024-02-28'),
      createdBy: 'purchasing@company.com'
    },
    {
      id: 'mov-3-002',
      productId: '3' as ProductId,
      locationId: 'loc-1',
      movementType: 'sale',
      quantity: -155,
      unitCost: 8.75,
      reference: 'SO-2024-089',
      notes: 'Retail chain order',
      createdAt: new Date('2024-03-16'),
      createdBy: 'sales@company.com'
    },

    // Product 4 movements
    {
      id: 'mov-4-001',
      productId: '4' as ProductId,
      locationId: 'loc-2',
      movementType: 'purchase',
      quantity: 25,
      unitCost: 120.00,
      reference: 'PO-2024-022',
      notes: 'Premium item restock',
      createdAt: new Date('2024-02-25'),
      createdBy: 'purchasing@company.com'
    },
    {
      id: 'mov-4-002',
      productId: '4' as ProductId,
      locationId: 'loc-2',
      movementType: 'sale',
      quantity: -7,
      unitCost: 125.00,
      reference: 'SO-2024-034',
      notes: 'Premium customer purchase',
      createdAt: new Date('2024-03-14'),
      createdBy: 'sales@company.com'
    },
    {
      id: 'mov-4-003',
      productId: '4' as ProductId,
      locationId: 'loc-2',
      movementType: 'return',
      quantity: 2,
      unitCost: 125.00,
      reference: 'RT-2024-005',
      notes: 'Customer return - unused',
      createdAt: new Date('2024-03-18'),
      createdBy: 'customer-service@company.com'
    },

    // Product 5 movements
    {
      id: 'mov-5-001',
      productId: '5' as ProductId,
      locationId: 'loc-1',
      movementType: 'purchase',
      quantity: 1000,
      unitCost: 3.00,
      reference: 'PO-2024-011',
      notes: 'Bulk commodity purchase',
      createdAt: new Date('2024-02-18'),
      createdBy: 'purchasing@company.com'
    },
    {
      id: 'mov-5-002',
      productId: '5' as ProductId,
      locationId: 'loc-1',
      movementType: 'sale',
      quantity: -420,
      unitCost: 3.25,
      reference: 'SO-2024-078',
      notes: 'Distributor bulk order',
      createdAt: new Date('2024-03-11'),
      createdBy: 'sales@company.com'
    },

    // Product 6 movements
    {
      id: 'mov-6-001',
      productId: '6' as ProductId,
      locationId: 'loc-1',
      movementType: 'purchase',
      quantity: 75,
      unitCost: 28.50,
      reference: 'PO-2024-019',
      notes: 'Regular restock',
      createdAt: new Date('2024-03-01'),
      createdBy: 'purchasing@company.com'
    },
    {
      id: 'mov-6-002',
      productId: '6' as ProductId,
      locationId: 'loc-2',
      movementType: 'transfer',
      quantity: 25,
      unitCost: 29.99,
      reference: 'TR-2024-008',
      notes: 'Store replenishment',
      createdAt: new Date('2024-03-13'),
      createdBy: 'warehouse@company.com'
    },
    {
      id: 'mov-6-003',
      productId: '6' as ProductId,
      locationId: 'loc-2',
      movementType: 'sale',
      quantity: -18,
      unitCost: 29.99,
      reference: 'SO-2024-055',
      notes: 'Store sales',
      createdAt: new Date('2024-03-17'),
      createdBy: 'sales@company.com'
    },

    // Product 7 movements
    {
      id: 'mov-7-001',
      productId: '7' as ProductId,
      locationId: 'loc-1',
      movementType: 'adjustment',
      quantity: -3,
      unitCost: 15.75,
      reference: 'ADJ-2024-007',
      notes: 'Damaged items write-off',
      createdAt: new Date('2024-03-09'),
      createdBy: 'warehouse@company.com'
    },
    {
      id: 'mov-7-002',
      productId: '7' as ProductId,
      locationId: 'loc-3',
      movementType: 'purchase',
      quantity: 100,
      unitCost: 15.25,
      reference: 'PO-2024-025',
      notes: 'Secondary warehouse stock',
      createdAt: new Date('2024-03-05'),
      createdBy: 'purchasing@company.com'
    },

    // Product 8 movements
    {
      id: 'mov-8-001',
      productId: '8' as ProductId,
      locationId: 'loc-2',
      movementType: 'purchase',
      quantity: 40,
      unitCost: 67.50,
      reference: 'PO-2024-028',
      notes: 'Specialty store stock',
      createdAt: new Date('2024-02-22'),
      createdBy: 'purchasing@company.com'
    },
    {
      id: 'mov-8-002',
      productId: '8' as ProductId,
      locationId: 'loc-2',
      movementType: 'sale',
      quantity: -12,
      unitCost: 69.99,
      reference: 'SO-2024-041',
      notes: 'Specialty customer order',
      createdAt: new Date('2024-03-12'),
      createdBy: 'sales@company.com'
    },
    {
      id: 'mov-8-003',
      productId: '8' as ProductId,
      locationId: 'loc-2',
      movementType: 'return',
      quantity: 1,
      unitCost: 69.99,
      reference: 'RT-2024-002',
      notes: 'Defective item return',
      createdAt: new Date('2024-03-16'),
      createdBy: 'customer-service@company.com'
    },

    // Product 9 movements
    {
      id: 'mov-9-001',
      productId: '9' as ProductId,
      locationId: 'loc-1',
      movementType: 'purchase',
      quantity: 200,
      unitCost: 22.00,
      reference: 'PO-2024-032',
      notes: 'Regular inventory replenishment',
      createdAt: new Date('2024-03-02'),
      createdBy: 'purchasing@company.com'
    },
    {
      id: 'mov-9-002',
      productId: '9' as ProductId,
      locationId: 'loc-1',
      movementType: 'sale',
      quantity: -85,
      unitCost: 24.99,
      reference: 'SO-2024-063',
      notes: 'B2B customer order',
      createdAt: new Date('2024-03-14'),
      createdBy: 'sales@company.com'
    },

    // Product 10 movements
    {
      id: 'mov-10-001',
      productId: '10' as ProductId,
      locationId: 'loc-3',
      movementType: 'purchase',
      quantity: 150,
      unitCost: 18.75,
      reference: 'PO-2024-035',
      notes: 'Direct supplier delivery',
      createdAt: new Date('2024-02-27'),
      createdBy: 'purchasing@company.com'
    },
    {
      id: 'mov-10-002',
      productId: '10' as ProductId,
      locationId: 'loc-3',
      movementType: 'transfer',
      quantity: -50,
      unitCost: 19.99,
      reference: 'TR-2024-015',
      notes: 'Transfer to main warehouse',
      createdAt: new Date('2024-03-08'),
      createdBy: 'warehouse@company.com'
    },
    {
      id: 'mov-10-003',
      productId: '10' as ProductId,
      locationId: 'loc-3',
      movementType: 'adjustment',
      quantity: 5,
      unitCost: 19.99,
      reference: 'ADJ-2024-009',
      notes: 'Found inventory correction',
      createdAt: new Date('2024-03-16'),
      createdBy: 'warehouse@company.com'
    },

    // Product 11 movements
    {
      id: 'mov-11-001',
      productId: '11' as ProductId,
      locationId: 'loc-1',
      movementType: 'purchase',
      quantity: 80,
      unitCost: 55.00,
      reference: 'PO-2024-038',
      notes: 'High-value item purchase',
      createdAt: new Date('2024-03-03'),
      createdBy: 'purchasing@company.com'
    },
    {
      id: 'mov-11-002',
      productId: '11' as ProductId,
      locationId: 'loc-1',
      movementType: 'sale',
      quantity: -22,
      unitCost: 59.99,
      reference: 'SO-2024-072',
      notes: 'Premium segment sales',
      createdAt: new Date('2024-03-15'),
      createdBy: 'sales@company.com'
    },

    // Product 12 movements
    {
      id: 'mov-12-001',
      productId: '12' as ProductId,
      locationId: 'loc-2',
      movementType: 'purchase',
      quantity: 60,
      unitCost: 33.50,
      reference: 'PO-2024-041',
      notes: 'Store-specific item',
      createdAt: new Date('2024-02-24'),
      createdBy: 'purchasing@company.com'
    },
    {
      id: 'mov-12-002',
      productId: '12' as ProductId,
      locationId: 'loc-2',
      movementType: 'sale',
      quantity: -28,
      unitCost: 36.99,
      reference: 'SO-2024-056',
      notes: 'Walk-in customer sales',
      createdAt: new Date('2024-03-11'),
      createdBy: 'sales@company.com'
    },
    {
      id: 'mov-12-003',
      productId: '12' as ProductId,
      locationId: 'loc-2',
      movementType: 'return',
      quantity: 3,
      unitCost: 36.99,
      reference: 'RT-2024-007',
      notes: 'Exchange for different size',
      createdAt: new Date('2024-03-13'),
      createdBy: 'customer-service@company.com'
    },

    // Product 13 movements
    {
      id: 'mov-13-001',
      productId: '13' as ProductId,
      locationId: 'loc-1',
      movementType: 'purchase',
      quantity: 300,
      unitCost: 11.25,
      reference: 'PO-2024-044',
      notes: 'Bulk consumable order',
      createdAt: new Date('2024-03-01'),
      createdBy: 'purchasing@company.com'
    },
    {
      id: 'mov-13-002',
      productId: '13' as ProductId,
      locationId: 'loc-1',
      movementType: 'sale',
      quantity: -145,
      unitCost: 12.99,
      reference: 'SO-2024-081',
      notes: 'Distributor order',
      createdAt: new Date('2024-03-18'),
      createdBy: 'sales@company.com'
    },

    // Product 14 movements
    {
      id: 'mov-14-001',
      productId: '14' as ProductId,
      locationId: 'loc-3',
      movementType: 'purchase',
      quantity: 120,
      unitCost: 27.50,
      reference: 'PO-2024-047',
      notes: 'Regional supplier delivery',
      createdAt: new Date('2024-02-29'),
      createdBy: 'purchasing@company.com'
    },
    {
      id: 'mov-14-002',
      productId: '14' as ProductId,
      locationId: 'loc-3',
      movementType: 'transfer',
      quantity: -40,
      unitCost: 29.99,
      reference: 'TR-2024-018',
      notes: 'Store distribution',
      createdAt: new Date('2024-03-12'),
      createdBy: 'warehouse@company.com'
    },
    {
      id: 'mov-14-003',
      productId: '14' as ProductId,
      locationId: 'loc-2',
      movementType: 'sale',
      quantity: -15,
      unitCost: 29.99,
      reference: 'SO-2024-048',
      notes: 'Local customer orders',
      createdAt: new Date('2024-03-17'),
      createdBy: 'sales@company.com'
    },

    // Product 15 movements
    {
      id: 'mov-15-001',
      productId: '15' as ProductId,
      locationId: 'loc-2',
      movementType: 'purchase',
      quantity: 35,
      unitCost: 85.00,
      reference: 'PO-2024-050',
      notes: 'Luxury item import',
      createdAt: new Date('2024-02-26'),
      createdBy: 'purchasing@company.com'
    },
    {
      id: 'mov-15-002',
      productId: '15' as ProductId,
      locationId: 'loc-2',
      movementType: 'sale',
      quantity: -8,
      unitCost: 89.99,
      reference: 'SO-2024-039',
      notes: 'High-end customer sale',
      createdAt: new Date('2024-03-10'),
      createdBy: 'sales@company.com'
    },

    // Product 16 movements
    {
      id: 'mov-16-001',
      productId: '16' as ProductId,
      locationId: 'loc-1',
      movementType: 'purchase',
      quantity: 250,
      unitCost: 16.75,
      reference: 'PO-2024-053',
      notes: 'Standard replenishment',
      createdAt: new Date('2024-03-04'),
      createdBy: 'purchasing@company.com'
    },
    {
      id: 'mov-16-002',
      productId: '16' as ProductId,
      locationId: 'loc-1',
      movementType: 'sale',
      quantity: -95,
      unitCost: 18.99,
      reference: 'SO-2024-064',
      notes: 'Enterprise customer order',
      createdAt: new Date('2024-03-16'),
      createdBy: 'sales@company.com'
    },
    {
      id: 'mov-16-003',
      productId: '16' as ProductId,
      locationId: 'loc-3',
      movementType: 'transfer',
      quantity: 75,
      unitCost: 18.99,
      reference: 'TR-2024-021',
      notes: 'Warehouse redistribution',
      createdAt: new Date('2024-03-18'),
      createdBy: 'warehouse@company.com'
    },

    // Product 17 movements
    {
      id: 'mov-17-001',
      productId: '17' as ProductId,
      locationId: 'loc-2',
      movementType: 'purchase',
      quantity: 45,
      unitCost: 42.50,
      reference: 'PO-2024-056',
      notes: 'Boutique item restock',
      createdAt: new Date('2024-02-28'),
      createdBy: 'purchasing@company.com'
    },
    {
      id: 'mov-17-002',
      productId: '17' as ProductId,
      locationId: 'loc-2',
      movementType: 'sale',
      quantity: -19,
      unitCost: 45.99,
      reference: 'SO-2024-051',
      notes: 'Boutique sales',
      createdAt: new Date('2024-03-13'),
      createdBy: 'sales@company.com'
    },
    {
      id: 'mov-17-003',
      productId: '17' as ProductId,
      locationId: 'loc-2',
      movementType: 'adjustment',
      quantity: -2,
      unitCost: 45.99,
      reference: 'ADJ-2024-012',
      notes: 'Display damage write-off',
      createdAt: new Date('2024-03-19'),
      createdBy: 'store-manager@company.com'
    },

    // Product 18 movements
    {
      id: 'mov-18-001',
      productId: '18' as ProductId,
      locationId: 'loc-1',
      movementType: 'purchase',
      quantity: 180,
      unitCost: 31.25,
      reference: 'PO-2024-059',
      notes: 'Mid-range product stock',
      createdAt: new Date('2024-03-06'),
      createdBy: 'purchasing@company.com'
    },
    {
      id: 'mov-18-002',
      productId: '18' as ProductId,
      locationId: 'loc-1',
      movementType: 'sale',
      quantity: -67,
      unitCost: 34.99,
      reference: 'SO-2024-075',
      notes: 'Multi-channel sales',
      createdAt: new Date('2024-03-15'),
      createdBy: 'sales@company.com'
    },

    // Product 19 movements
    {
      id: 'mov-19-001',
      productId: '19' as ProductId,
      locationId: 'loc-3',
      movementType: 'purchase',
      quantity: 90,
      unitCost: 21.50,
      reference: 'PO-2024-062',
      notes: 'Regional distribution stock',
      createdAt: new Date('2024-03-07'),
      createdBy: 'purchasing@company.com'
    },
    {
      id: 'mov-19-002',
      productId: '19' as ProductId,
      locationId: 'loc-3',
      movementType: 'sale',
      quantity: -35,
      unitCost: 23.99,
      reference: 'SO-2024-068',
      notes: 'Regional customer orders',
      createdAt: new Date('2024-03-14'),
      createdBy: 'sales@company.com'
    },
    {
      id: 'mov-19-003',
      productId: '19' as ProductId,
      locationId: 'loc-1',
      movementType: 'transfer',
      quantity: 25,
      unitCost: 23.99,
      reference: 'TR-2024-024',
      notes: 'Inventory rebalancing',
      createdAt: new Date('2024-03-19'),
      createdBy: 'warehouse@company.com'
    },

    // Product 20 movements
    {
      id: 'mov-20-001',
      productId: '20' as ProductId,
      locationId: 'loc-1',
      movementType: 'purchase',
      quantity: 500,
      unitCost: 6.25,
      reference: 'PO-2024-065',
      notes: 'High-volume commodity purchase',
      createdAt: new Date('2024-03-08'),
      createdBy: 'purchasing@company.com'
    },
    {
      id: 'mov-20-002',
      productId: '20' as ProductId,
      locationId: 'loc-1',
      movementType: 'sale',
      quantity: -280,
      unitCost: 6.75,
      reference: 'SO-2024-083',
      notes: 'Bulk distributor order',
      createdAt: new Date('2024-03-17'),
      createdBy: 'sales@company.com'
    },
    {
      id: 'mov-20-003',
      productId: '20' as ProductId,
      locationId: 'loc-2',
      movementType: 'transfer',
      quantity: 100,
      unitCost: 6.75,
      reference: 'TR-2024-027',
      notes: 'Store supply transfer',
      createdAt: new Date('2024-03-19'),
      createdBy: 'warehouse@company.com'
    }
  ];

  private getNextLocationId(): string {
    const maxId = Math.max(...this.locations.map(l => parseInt(l.id.replace('loc-', ''))));
    return `loc-${maxId + 1}`;
  }

  private generateUniqueCode(name: string): string {
    // Generate code from name (first letters of each word)
    let baseCode = name.split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('');
    
    if (baseCode.length < 2) {
      baseCode = name.substring(0, 3).toUpperCase();
    }

    let code = baseCode;
    let counter = 1;

    // Ensure code uniqueness
    while (this.locations.some(l => l.code === code)) {
      code = `${baseCode}${counter}`;
      counter++;
    }

    return code;
  }

  createLocation(locationData: CreateInventoryLocation): Observable<InventoryLocation> {
    return of(null).pipe(
      delay(250),
      switchMap(() => {
        // Validate location name uniqueness
        const nameExists = this.locations.some(l => 
          l.name.toLowerCase() === locationData.name.toLowerCase()
        );
        if (nameExists) {
          throw new Error(`Location with name '${locationData.name}' already exists`);
        }

        // Generate unique code if not provided
        const code = locationData.code || this.generateUniqueCode(locationData.name);
        
        // Validate code uniqueness
        const codeExists = this.locations.some(l => l.code === code);
        if (codeExists) {
          throw new Error(`Location code '${code}' already exists`);
        }

        const newLocation: InventoryLocation = {
          id: this.getNextLocationId(),
          name: locationData.name.trim(),
          code: code.toUpperCase(),
          address: locationData.address?.trim() || '',
          type: locationData.type || 'warehouse',
          isActive: locationData.isActive ?? true
        };

        this.locations.push(newLocation);
        return of(newLocation);
      })
    );
  }

  deleteLocation(locationId: string): Observable<boolean> {
    return of(null).pipe(
      delay(200),
      switchMap(() => {
        // Check if location exists
        const locationIndex = this.locations.findIndex(l => l.id === locationId);
        if (locationIndex === -1) {
          throw new Error(`Location with ID ${locationId} not found`);
        }

        const location = this.locations[locationIndex];

        // Check if location has inventory records
        const hasInventory = this.inventory.some(i => i.locationId === locationId);
        if (hasInventory) {
          throw new Error(`Cannot delete location '${location.name}' because it contains inventory records. Move or remove inventory first.`);
        }

        // Delete the location
        this.locations.splice(locationIndex, 1);
        return of(true);
      })
    );
  }

  createInventoryRecord(productId: ProductId, locationId: string, initialData: Partial<ProductInventory> = {}): Observable<ProductInventory> {
    return of(null).pipe(
      delay(200),
      switchMap(() => {
        // Check if location exists
        const locationExists = this.locations.some(l => l.id === locationId);
        if (!locationExists) {
          throw new Error(`Location with ID ${locationId} not found`);
        }

        // Check if inventory record already exists for this product/location
        const existingRecord = this.inventory.find(i => 
          i.productId === productId && i.locationId === locationId
        );
        if (existingRecord) {
          throw new Error(`Inventory record already exists for product ${productId} at location ${locationId}`);
        }

        const newInventoryRecord: ProductInventory = {
          productId,
          locationId,
          quantityAvailable: initialData.quantityAvailable || 0,
          quantityReserved: initialData.quantityReserved || 0,
          quantityOnOrder: initialData.quantityOnOrder || 0,
          reorderLevel: initialData.reorderLevel || 10,
          maxStockLevel: initialData.maxStockLevel || 1000,
          costPerUnit: initialData.costPerUnit || 0,
          lastUpdated: new Date(),
          lastStockMovement: new Date()
        };

        this.inventory.push(newInventoryRecord);
        return of(newInventoryRecord);
      })
    );
  }

  deleteInventoryRecord(productId: ProductId, locationId: string): Observable<boolean> {
    return of(null).pipe(
      delay(150),
      switchMap(() => {
        // Find inventory record
        const recordIndex = this.inventory.findIndex(i => 
          i.productId === productId && i.locationId === locationId
        );
        if (recordIndex === -1) {
          throw new Error(`Inventory record not found for product ${productId} at location ${locationId}`);
        }

        const record = this.inventory[recordIndex];

        // Check if there are reserved quantities
        if (record.quantityReserved > 0) {
          throw new Error(`Cannot delete inventory record with ${record.quantityReserved} reserved quantity. Release reservations first.`);
        }

        // Check if there's available stock
        if (record.quantityAvailable > 0) {
          throw new Error(`Cannot delete inventory record with ${record.quantityAvailable} available quantity. Adjust stock to zero first.`);
        }

        // Delete the inventory record
        this.inventory.splice(recordIndex, 1);
        return of(true);
      })
    );
  }

  // Read-only helper methods for other operations
  getLocations(): Observable<InventoryLocation[]> {
    return of([...this.locations]).pipe(delay(100));
  }

  getLocationById(id: string): Observable<InventoryLocation | null> {
    const location = this.locations.find(l => l.id === id);
    return of(location || null).pipe(delay(100));
  }

  getInventoryByLocation(locationId: string): Observable<ProductInventory[]> {
    const locationInventory = this.inventory.filter(i => i.locationId === locationId);
    return of(locationInventory).pipe(delay(120));
  }

  

  // =============================================================================
  // STOCK MOVEMENTS METHODS
  // =============================================================================

  /**
   * Get all stock movements for a specific product
   */
  getStockMovementsByProduct(productId: ProductId): Observable<StockMovement[]> {
    const movements = this.stockMovements
      .filter(movement => movement.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Latest first
    
    return of(movements).pipe(delay(150));
  }


  /**
   * Get stock movements by location
   */
  getStockMovementsByLocation(locationId: string): Observable<StockMovement[]> {
    const movements = this.stockMovements
      .filter(movement => movement.locationId === locationId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return of(movements).pipe(delay(150));
  }

  // =============================================================================
  // INVENTORY REPOSITORY INTERFACE IMPLEMENTATION
  // =============================================================================

  /**
   * Get inventory for a specific product at a specific location
   */
  getProductInventory(productId: ProductId, locationId: string): Observable<ProductInventory | null> {
    const inventory = this.inventory.find(i => 
      i.productId === productId && i.locationId === locationId
    );
    return of(inventory || null).pipe(delay(120));
  }

  /**
   * Get all inventory records for a product across all locations
   */
  getProductInventoryByLocation(productId: ProductId): Observable<ProductInventory[]> {
    const productInventories = this.inventory.filter(i => i.productId === productId);
    return of(productInventories).pipe(delay(120));
  }

  /**
   * Get aggregated inventory summary for a product
   */
  getProductInventoryAggregate(productId: ProductId): Observable<InventoryAggregate> {
    return this.getProductInventoryByLocation(productId).pipe(
      map(inventories => {
        const totalQuantityAvailable = inventories.reduce((sum, inv) => sum + inv.quantityAvailable, 0);
        const totalQuantityReserved = inventories.reduce((sum, inv) => sum + inv.quantityReserved, 0);
        const totalQuantityOnOrder = inventories.reduce((sum, inv) => sum + inv.quantityOnOrder, 0);
        
        // Determine stock status
        let stockStatus: StockStatus;
        const totalReorderLevel = inventories.reduce((sum, inv) => sum + inv.reorderLevel, 0);
        
        if (totalQuantityAvailable === 0) {
          stockStatus = StockStatus.OUT_OF_STOCK;
        } else if (totalQuantityAvailable <= totalReorderLevel) {
          stockStatus = StockStatus.LOW_STOCK;
        } else {
          stockStatus = StockStatus.IN_STOCK;
        }

        // Check if needs reorder
        const needsReorder = totalQuantityAvailable <= totalReorderLevel;

        // Get latest movement date
        const movements = this.stockMovements.filter(m => m.productId === productId);
        const lastMovementDate = movements.length > 0 
          ? new Date(Math.max(...movements.map(m => m.createdAt.getTime())))
          : undefined;

        return {
          productId,
          totalQuantityAvailable,
          totalQuantityReserved,
          totalQuantityOnOrder,
          stockStatus,
          needsReorder,
          lastMovementDate
        };
      })
    );
  }

  /**
   * Get inventory for multiple products
   */
  getProductsInventoryAggregate(productIds: ProductId[]): Observable<InventoryAggregate[]> {
    const aggregates = productIds.map(productId => this.getProductInventoryAggregate(productId));
    return of(aggregates).pipe(
      switchMap(aggregateObservables => {
        // Simulate async processing
        return new Observable<InventoryAggregate[]>(subscriber => {
          Promise.all(aggregateObservables.map(obs => obs.toPromise()))
            .then(results => {
              subscriber.next(results as InventoryAggregate[]);
              subscriber.complete();
            })
            .catch(error => subscriber.error(error));
        });
      }),
      delay(200)
    );
  }

  /**
   * Create inventory record for a product at a location
   */
  createProductInventory(inventory: CreateProductInventory): Observable<ProductInventory> {
    return of(null).pipe(
      delay(200),
      switchMap(() => {
        // Check if location exists
        const locationExists = this.locations.some(l => l.id === inventory.locationId);
        if (!locationExists) {
          throw new Error(`Location with ID ${inventory.locationId} not found`);
        }

        // Check if inventory record already exists
        const existingRecord = this.inventory.find(i => 
          i.productId === inventory.productId && i.locationId === inventory.locationId
        );
        if (existingRecord) {
          throw new Error(`Inventory record already exists for product ${inventory.productId} at location ${inventory.locationId}`);
        }

        const newInventory: ProductInventory = {
          productId: inventory.productId,
          locationId: inventory.locationId,
          quantityAvailable: inventory.quantityAvailable,
          quantityReserved: inventory.quantityReserved || 0,
          quantityOnOrder: inventory.quantityOnOrder || 0,
          reorderLevel: inventory.reorderLevel,
          maxStockLevel: inventory.maxStockLevel,
          costPerUnit: inventory.costPerUnit,
          lastUpdated: new Date(),
          lastStockMovement: new Date()
        };

        this.inventory.push(newInventory);
        return of(newInventory);
      })
    );
  }

  /**
   * Update inventory levels
   */
  updateProductInventory(
    productId: ProductId, 
    locationId: string, 
    updates: UpdateProductInventory
  ): Observable<ProductInventory> {
    return of(null).pipe(
      delay(150),
      switchMap(() => {
        const inventory = this.inventory.find(i => 
          i.productId === productId && i.locationId === locationId
        );
        
        if (!inventory) {
          throw new Error(`Inventory record not found for product ${productId} at location ${locationId}`);
        }

        // Apply updates
        if (updates.quantityAvailable !== undefined) inventory.quantityAvailable = updates.quantityAvailable;
        if (updates.quantityReserved !== undefined) inventory.quantityReserved = updates.quantityReserved;
        if (updates.quantityOnOrder !== undefined) inventory.quantityOnOrder = updates.quantityOnOrder;
        if (updates.reorderLevel !== undefined) inventory.reorderLevel = updates.reorderLevel;
        if (updates.maxStockLevel !== undefined) inventory.maxStockLevel = updates.maxStockLevel;
        if (updates.costPerUnit !== undefined) inventory.costPerUnit = updates.costPerUnit;
        
        inventory.lastUpdated = new Date();

        return of(inventory);
      })
    );
  }

  /**
   * Delete inventory record
   */
  deleteProductInventory(productId: ProductId, locationId: string): Observable<boolean> {
    return this.deleteInventoryRecord(productId, locationId);
  }

  /**
   * Adjust stock levels with movement tracking
   */
  adjustStock(
    productId: ProductId,
    locationId: string,
    quantity: number,
    movementType: 'adjustment' | 'purchase' | 'sale' | 'transfer' | 'return',
    reference?: string,
    notes?: string
  ): Observable<StockMovement> {
    return of(null).pipe(
      delay(250),
      switchMap(() => {
        const inventory = this.inventory.find(i => 
          i.productId === productId && i.locationId === locationId
        );
        
        if (!inventory) {
          throw new Error(`Inventory record not found for product ${productId} at location ${locationId}`);
        }

        // Check if we have enough stock for negative adjustments
        if (quantity < 0 && inventory.quantityAvailable < Math.abs(quantity)) {
          throw new Error(`Insufficient stock. Available: ${inventory.quantityAvailable}, Requested: ${Math.abs(quantity)}`);
        }

        // Adjust quantity
        inventory.quantityAvailable += quantity;
        inventory.lastUpdated = new Date();
        inventory.lastStockMovement = new Date();

        // Create movement record
        const movement: StockMovement = {
          id: `movement-${Date.now()}`,
          productId,
          locationId,
          movementType,
          quantity,
          unitCost: inventory.costPerUnit,
          reference,
          notes,
          createdAt: new Date(),
          createdBy: 'system'
        };

        this.stockMovements.push(movement);
        return of(movement);
      })
    );
  }

  /**
   * Transfer stock between locations
   */
  transferStock(
    productId: ProductId,
    fromLocationId: string,
    toLocationId: string,
    quantity: number,
    reference?: string,
    notes?: string
  ): Observable<StockMovement[]> {
    return of(null).pipe(
      delay(300),
      switchMap(() => {
        if (fromLocationId === toLocationId) {
          throw new Error('Cannot transfer to the same location');
        }

        const fromInventory = this.inventory.find(i => 
          i.productId === productId && i.locationId === fromLocationId
        );
        let toInventory = this.inventory.find(i => 
          i.productId === productId && i.locationId === toLocationId
        );

        if (!fromInventory) {
          throw new Error(`Source inventory not found for product ${productId} at location ${fromLocationId}`);
        }

        if (fromInventory.quantityAvailable < quantity) {
          throw new Error(`Insufficient stock in source location. Available: ${fromInventory.quantityAvailable}`);
        }

        // Create destination inventory if it doesn't exist
        if (!toInventory) {
          toInventory = {
            productId,
            locationId: toLocationId,
            quantityAvailable: 0,
            quantityReserved: 0,
            quantityOnOrder: 0,
            reorderLevel: fromInventory.reorderLevel,
            maxStockLevel: fromInventory.maxStockLevel,
            costPerUnit: fromInventory.costPerUnit,
            lastUpdated: new Date(),
            lastStockMovement: new Date()
          };
          this.inventory.push(toInventory);
        }

        // Perform transfer
        fromInventory.quantityAvailable -= quantity;
        toInventory.quantityAvailable += quantity;
        
        const now = new Date();
        fromInventory.lastUpdated = now;
        fromInventory.lastStockMovement = now;
        toInventory.lastUpdated = now;
        toInventory.lastStockMovement = now;

        // Create movement records
        const outgoingMovement: StockMovement = {
          id: `transfer-out-${Date.now()}`,
          productId,
          locationId: fromLocationId,
          movementType: 'transfer',
          quantity: -quantity,
          unitCost: fromInventory.costPerUnit,
          reference,
          notes: `Transfer to ${toLocationId}: ${notes || ''}`.trim(),
          createdAt: now,
          createdBy: 'system'
        };

        const incomingMovement: StockMovement = {
          id: `transfer-in-${Date.now()}`,
          productId,
          locationId: toLocationId,
          movementType: 'transfer',
          quantity: quantity,
          unitCost: toInventory.costPerUnit,
          reference,
          notes: `Transfer from ${fromLocationId}: ${notes || ''}`.trim(),
          createdAt: now,
          createdBy: 'system'
        };

        this.stockMovements.push(outgoingMovement, incomingMovement);
        return of([outgoingMovement, incomingMovement]);
      })
    );
  }

  /**
   * Reserve stock for an order
   */
  reserveStock(productId: ProductId, locationId: string, quantity: number): Observable<boolean> {
    return of(null).pipe(
      delay(150),
      switchMap(() => {
        const inventory = this.inventory.find(i => 
          i.productId === productId && i.locationId === locationId
        );
        
        if (!inventory) {
          return of(false);
        }

        const availableQuantity = inventory.quantityAvailable - inventory.quantityReserved;
        if (availableQuantity < quantity) {
          return of(false);
        }

        inventory.quantityReserved += quantity;
        inventory.lastUpdated = new Date();
        return of(true);
      })
    );
  }

  /**
   * Release reserved stock
   */
  releaseReservedStock(productId: ProductId, locationId: string, quantity: number): Observable<boolean> {
    return of(null).pipe(
      delay(100),
      switchMap(() => {
        const inventory = this.inventory.find(i => 
          i.productId === productId && i.locationId === locationId
        );
        
        if (!inventory) {
          return of(false);
        }

        if (inventory.quantityReserved < quantity) {
          return of(false);
        }

        inventory.quantityReserved -= quantity;
        inventory.lastUpdated = new Date();
        return of(true);
      })
    );
  }

  /**
   * Get stock movements history
   */
  getStockMovements(
    productId: ProductId,
    locationId?: string,
    fromDate?: Date,
    toDate?: Date
  ): Observable<StockMovement[]> {
    return of(null).pipe(
      delay(120),
      map(() => {
        let filteredMovements = this.stockMovements.filter(m => m.productId === productId);
        
        if (locationId) {
          filteredMovements = filteredMovements.filter(m => m.locationId === locationId);
        }
        
        if (fromDate) {
          filteredMovements = filteredMovements.filter(m => m.createdAt >= fromDate);
        }
        
        if (toDate) {
          filteredMovements = filteredMovements.filter(m => m.createdAt <= toDate);
        }
        
        // Sort by date, most recent first
        return filteredMovements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      })
    );
  }

  /**
   * Get products needing reorder
   */
  getProductsNeedingReorder(locationId?: string): Observable<ProductInventory[]> {
    return of(null).pipe(
      delay(150),
      map(() => {
        let inventories = this.inventory;
        if (locationId) {
          inventories = inventories.filter(i => i.locationId === locationId);
        }
        
        return inventories.filter(i => i.quantityAvailable <= i.reorderLevel);
      })
    );
  }

  /**
   * Get out of stock products
   */
  getOutOfStockProducts(locationId?: string): Observable<ProductInventory[]> {
    return of(null).pipe(
      delay(100),
      map(() => {
        let inventories = this.inventory;
        if (locationId) {
          inventories = inventories.filter(i => i.locationId === locationId);
        }
        
        return inventories.filter(i => i.quantityAvailable === 0);
      })
    );
  }

  /**
   * Get low stock products
   */
  getLowStockProducts(locationId?: string): Observable<ProductInventory[]> {
    return of(null).pipe(
      delay(100),
      map(() => {
        let inventories = this.inventory;
        if (locationId) {
          inventories = inventories.filter(i => i.locationId === locationId);
        }
        
        return inventories.filter(i => 
          i.quantityAvailable > 0 && i.quantityAvailable <= i.reorderLevel
        );
      })
    );
  }

  /**
   * Get available quantity for a product
   */
  getAvailableQuantity(productId: ProductId, locationId?: string): Observable<number> {
    return of(null).pipe(
      delay(80),
      map(() => {
        let inventories = this.inventory.filter(i => i.productId === productId);
        if (locationId) {
          inventories = inventories.filter(i => i.locationId === locationId);
        }
        
        return inventories.reduce((sum, inv) => sum + (inv.quantityAvailable - inv.quantityReserved), 0);
      })
    );
  }

  /**
   * Check if product is in stock
   */
  isInStock(productId: ProductId, quantity: number = 1, locationId?: string): Observable<boolean> {
    return this.getAvailableQuantity(productId, locationId).pipe(
      map(available => available >= quantity)
    );
  }

  /**
   * Get stock status for a product
   */
  getStockStatus(productId: ProductId, locationId?: string): Observable<StockStatus> {
    return of(null).pipe(
      delay(100),
      map(() => {
        let inventories = this.inventory.filter(i => i.productId === productId);
        if (locationId) {
          inventories = inventories.filter(i => i.locationId === locationId);
        }
        
        const totalAvailable = inventories.reduce((sum, inv) => sum + inv.quantityAvailable, 0);
        const totalReorderLevel = inventories.reduce((sum, inv) => sum + inv.reorderLevel, 0);
        
        if (totalAvailable === 0) {
          return StockStatus.OUT_OF_STOCK;
        } else if (totalAvailable <= totalReorderLevel) {
          return StockStatus.LOW_STOCK;
        } else {
          return StockStatus.IN_STOCK;
        }
      })
    );
  }

  /**
   * Get all inventory locations
   */
  getInventoryLocations(): Observable<InventoryLocation[]> {
    return of([...this.locations]).pipe(delay(100));
  }

  /**
   * Get active inventory locations
   */
  getActiveInventoryLocations(): Observable<InventoryLocation[]> {
    return of(this.locations.filter(l => l.isActive)).pipe(delay(100));
  }

  // =============================================================================
  // STOCK ADJUSTMENTS MOCK DATA AND METHODS
  // =============================================================================

  private stockAdjustments: StockAdjustment[] = [
    // Product 1 adjustments
    {
      id: 'adj-001',
      productId: '1' as ProductId,
      locationId: 'loc-1',
      reason: StockAdjustmentReason.PHYSICAL_COUNT,
      quantityBefore: 155,
      quantityAfter: 150,
      quantityAdjusted: -5,
      unitCost: 45.50,
      reference: 'COUNT-2024-001',
      notes: 'Physical count discrepancy found during monthly inventory',
      createdAt: new Date('2024-03-18T10:00:00Z'),
      createdBy: 'john.doe',
      approvedAt: new Date('2024-03-18T14:00:00Z'),
      approvedBy: 'jane.manager',
      status: 'approved'
    },
    {
      id: 'adj-002',
      productId: '1' as ProductId,
      locationId: 'loc-2',
      reason: StockAdjustmentReason.DAMAGED_GOODS,
      quantityBefore: 48,
      quantityAfter: 45,
      quantityAdjusted: -3,
      unitCost: 45.50,
      reference: 'DMG-2024-003',
      notes: 'Items damaged during delivery',
      createdAt: new Date('2024-03-17T09:30:00Z'),
      createdBy: 'mike.warehouse',
      approvedAt: new Date('2024-03-17T11:00:00Z'),
      approvedBy: 'jane.manager',
      status: 'approved'
    },
    // Product 2 adjustments
    {
      id: 'adj-003',
      productId: '2' as ProductId,
      locationId: 'loc-1',
      reason: StockAdjustmentReason.SYSTEM_CORRECTION,
      quantityBefore: 8,
      quantityAfter: 5,
      quantityAdjusted: -3,
      unitCost: 12.99,
      reference: 'SYS-CORR-001',
      notes: 'Correcting system error from previous import',
      createdAt: new Date('2024-03-16T15:20:00Z'),
      createdBy: 'admin.system',
      status: 'pending'
    },
    // Product 3 adjustments
    {
      id: 'adj-004',
      productId: '3' as ProductId,
      locationId: 'loc-1',
      reason: StockAdjustmentReason.EXPIRED_GOODS,
      quantityBefore: 205,
      quantityAfter: 200,
      quantityAdjusted: -5,
      unitCost: 8.75,
      reference: 'EXP-2024-001',
      notes: 'Expired items removed from inventory',
      createdAt: new Date('2024-03-19T08:00:00Z'),
      createdBy: 'sarah.qa',
      approvedAt: new Date('2024-03-19T09:00:00Z'),
      approvedBy: 'jane.manager',
      status: 'approved'
    },
    // Product 5 adjustments  
    {
      id: 'adj-005',
      productId: '5' as ProductId,
      locationId: 'loc-1',
      reason: StockAdjustmentReason.PROMOTION_SAMPLE,
      quantityBefore: 520,
      quantityAfter: 500,
      quantityAdjusted: -20,
      unitCost: 3.25,
      notes: 'Samples taken for trade show promotion',
      createdAt: new Date('2024-03-18T12:00:00Z'),
      createdBy: 'mark.sales',
      status: 'pending'
    },
    // Product 7 adjustments
    {
      id: 'adj-006',
      productId: '7' as ProductId,
      locationId: 'loc-1',
      reason: StockAdjustmentReason.THEFT_LOSS,
      quantityBefore: 325,
      quantityAfter: 320,
      quantityAdjusted: -5,
      unitCost: 15.99,
      reference: 'THEFT-2024-001',
      notes: 'Items reported missing during security audit',
      createdAt: new Date('2024-03-19T16:00:00Z'),
      createdBy: 'security.team',
      status: 'pending'
    },
    // Product 4 adjustments
    {
      id: 'adj-007',
      productId: '4' as ProductId,
      locationId: 'loc-1',
      reason: StockAdjustmentReason.RETURNED_DEFECTIVE,
      quantityBefore: 85,
      quantityAfter: 80,
      quantityAdjusted: -5,
      unitCost: 22.50,
      reference: 'RET-SUP-2024-001',
      notes: 'Defective units returned to supplier',
      createdAt: new Date('2024-03-20T10:30:00Z'),
      createdBy: 'purchase.manager',
      approvedAt: new Date('2024-03-20T11:15:00Z'),
      approvedBy: 'jane.manager',
      status: 'approved'
    },
    {
      id: 'adj-008',
      productId: '4' as ProductId,
      locationId: 'loc-2',
      reason: StockAdjustmentReason.PHYSICAL_COUNT,
      quantityBefore: 52,
      quantityAfter: 55,
      quantityAdjusted: 3,
      unitCost: 22.50,
      reference: 'COUNT-2024-002',
      notes: 'Extra units found during physical count - probably missed in last shipment',
      createdAt: new Date('2024-03-21T14:00:00Z'),
      createdBy: 'warehouse.team',
      approvedAt: new Date('2024-03-21T15:30:00Z'),
      approvedBy: 'jane.manager',
      status: 'approved'
    },
    // Product 6 adjustments
    {
      id: 'adj-009',
      productId: '6' as ProductId,
      locationId: 'loc-1',
      reason: StockAdjustmentReason.DAMAGED_GOODS,
      quantityBefore: 180,
      quantityAfter: 175,
      quantityAdjusted: -5,
      unitCost: 18.75,
      reference: 'DMG-2024-004',
      notes: 'Water damage from roof leak in warehouse section A',
      createdAt: new Date('2024-03-22T08:45:00Z'),
      createdBy: 'facilities.manager',
      status: 'pending'
    },
    {
      id: 'adj-010',
      productId: '6' as ProductId,
      locationId: 'loc-2',
      reason: StockAdjustmentReason.SYSTEM_CORRECTION,
      quantityBefore: 65,
      quantityAfter: 62,
      quantityAdjusted: -3,
      unitCost: 18.75,
      reference: 'SYS-CORR-002',
      notes: 'Correcting duplicate entry from data migration',
      createdAt: new Date('2024-03-15T16:20:00Z'),
      createdBy: 'it.admin',
      approvedAt: new Date('2024-03-15T17:00:00Z'),
      approvedBy: 'system.admin',
      status: 'approved'
    },
    // Product 8 adjustments
    {
      id: 'adj-011',
      productId: '8' as ProductId,
      locationId: 'loc-1',
      reason: StockAdjustmentReason.EXPIRED_GOODS,
      quantityBefore: 35,
      quantityAfter: 30,
      quantityAdjusted: -5,
      unitCost: 28.99,
      reference: 'EXP-2024-002',
      notes: 'Expired perishable items removed as per safety protocol',
      createdAt: new Date('2024-03-23T09:00:00Z'),
      createdBy: 'qa.inspector',
      status: 'pending'
    },
    // Product 1 additional adjustments (different locations/times)
    {
      id: 'adj-012',
      productId: '1' as ProductId,
      locationId: 'loc-3',
      reason: StockAdjustmentReason.PROMOTION_SAMPLE,
      quantityBefore: 75,
      quantityAfter: 70,
      quantityAdjusted: -5,
      unitCost: 45.50,
      notes: 'Samples for retail partner demo',
      createdAt: new Date('2024-03-14T11:30:00Z'),
      createdBy: 'sales.rep',
      approvedAt: new Date('2024-03-14T12:00:00Z'),
      approvedBy: 'sales.manager',
      status: 'approved'
    },
    {
      id: 'adj-013',
      productId: '1' as ProductId,
      locationId: 'loc-1',
      reason: StockAdjustmentReason.OTHER,
      quantityBefore: 145,
      quantityAfter: 148,
      quantityAdjusted: 3,
      unitCost: 45.50,
      reference: 'RET-CUST-2024-005',
      notes: 'Customer returned unused items in original packaging',
      createdAt: new Date('2024-03-22T13:15:00Z'),
      createdBy: 'returns.processor',
      status: 'pending'
    },
    // Product 9 adjustments
    {
      id: 'adj-014',
      productId: '9' as ProductId,
      locationId: 'loc-1',
      reason: StockAdjustmentReason.WRITE_OFF,
      quantityBefore: 95,
      quantityAfter: 90,
      quantityAdjusted: -5,
      unitCost: 31.25,
      reference: 'MFG-DEF-2024-001',
      notes: 'Manufacturing defect discovered during quality inspection',
      createdAt: new Date('2024-03-19T10:45:00Z'),
      createdBy: 'qa.supervisor',
      approvedAt: new Date('2024-03-19T14:30:00Z'),
      approvedBy: 'production.manager',
      status: 'approved'
    },
    // Product 10 adjustments
    {
      id: 'adj-015',
      productId: '10' as ProductId,
      locationId: 'loc-2',
      reason: StockAdjustmentReason.EXPIRED_GOODS,
      quantityBefore: 42,
      quantityAfter: 45,
      quantityAdjusted: 3,
      unitCost: 9.99,
      reference: 'EXP-2024-001',
      notes: 'Correcting transfer that was incorrectly recorded as outbound',
      createdAt: new Date('2024-03-21T09:20:00Z'),
      createdBy: 'logistics.coordinator',
      status: 'pending'
    },
    // Product 2 additional adjustments
    {
      id: 'adj-016',
      productId: '2' as ProductId,
      locationId: 'loc-2',
      reason: StockAdjustmentReason.DAMAGED_GOODS,
      quantityBefore: 25,
      quantityAfter: 20,
      quantityAdjusted: -5,
      unitCost: 12.99,
      reference: 'DMG-2024-005',
      notes: 'Packaging damaged during forklift operation',
      createdAt: new Date('2024-03-20T15:45:00Z'),
      createdBy: 'warehouse.operator',
      status: 'rejected',
      approvedAt: new Date('2024-03-20T16:30:00Z'),
      approvedBy: 'warehouse.supervisor'
    },
    // Product 3 additional adjustments
    {
      id: 'adj-017',
      productId: '3' as ProductId,
      locationId: 'loc-2',
      reason: StockAdjustmentReason.PHYSICAL_COUNT,
      quantityBefore: 88,
      quantityAfter: 85,
      quantityAdjusted: -3,
      unitCost: 8.75,
      reference: 'CYCLE-2024-003',
      notes: 'Discrepancy found during weekly cycle count',
      createdAt: new Date('2024-03-23T12:00:00Z'),
      createdBy: 'inventory.analyst',
      status: 'pending'
    },
    // Product 5 additional adjustments
    {
      id: 'adj-018',
      productId: '5' as ProductId,
      locationId: 'loc-2',
      reason: StockAdjustmentReason.PHYSICAL_COUNT,
      quantityBefore: 145,
      quantityAfter: 142,
      quantityAdjusted: -3,
      unitCost: 3.25,
      reference: 'COUNT-2024-003',
      notes: 'Minor discrepancy in monthly physical count',
      createdAt: new Date('2024-03-18T16:30:00Z'),
      createdBy: 'count.team',
      approvedAt: new Date('2024-03-18T17:00:00Z'),
      approvedBy: 'inventory.manager',
      status: 'approved'
    },
    // Cross-location transfer correction
    {
      id: 'adj-019',
      productId: '7' as ProductId,
      locationId: 'loc-2',
      reason: StockAdjustmentReason.EXPIRED_GOODS,
      quantityBefore: 95,
      quantityAfter: 100,
      quantityAdjusted: 5,
      unitCost: 15.99,
      reference: 'TRANS-ERR-2024-002',
      notes: 'Correcting missed transfer from loc-1 that was not recorded properly',
      createdAt: new Date('2024-03-22T10:15:00Z'),
      createdBy: 'transfer.coordinator',
      status: 'pending'
    },
    // Seasonal adjustment
    {
      id: 'adj-020',
      productId: '8' as ProductId,
      locationId: 'loc-2',
      reason: StockAdjustmentReason.PROMOTION_SAMPLE,
      quantityBefore: 28,
      quantityAfter: 25,
      quantityAdjusted: -3,
      unitCost: 28.99,
      notes: 'Seasonal promotion samples for spring campaign',
      createdAt: new Date('2024-03-21T08:30:00Z'),
      createdBy: 'marketing.coordinator',
      approvedAt: new Date('2024-03-21T10:00:00Z'),
      approvedBy: 'marketing.manager',
      status: 'approved'
    }
  ];

  /**
   * Create a stock adjustment
   */
  createStockAdjustment(adjustment: CreateStockAdjustment): Observable<StockAdjustment> {
    return of(null).pipe(
      delay(300),
      switchMap(() => {
        // Generate new ID
        const newId = `adj-${String(this.stockAdjustments.length + 1).padStart(3, '0')}`;
        
        // Get current inventory to calculate before/after quantities
        const inventory = this.inventory.find(i => 
          i.productId === adjustment.productId && i.locationId === adjustment.locationId
        );
        
        if (!inventory) {
          return throwError(() => new Error('Product inventory not found for this location'));
        }

        const quantityBefore = inventory.quantityAvailable;
        const quantityAfter = quantityBefore + adjustment.quantityAdjusted;

        if (quantityAfter < 0) {
          return throwError(() => new Error('Adjustment would result in negative inventory'));
        }

        // Create new adjustment
        const newAdjustment: StockAdjustment = {
          id: newId,
          productId: adjustment.productId,
          locationId: adjustment.locationId,
          reason: adjustment.reason,
          quantityBefore,
          quantityAfter,
          quantityAdjusted: adjustment.quantityAdjusted,
          unitCost: adjustment.unitCost,
          reference: adjustment.reference,
          notes: adjustment.notes,
          createdAt: new Date(),
          createdBy: 'current.user', // In real app, get from auth service
          status: adjustment.requiresApproval ? 'pending' : 'approved'
        };

        // If auto-approved, also update the inventory
        if (!adjustment.requiresApproval) {
          inventory.quantityAvailable = quantityAfter;
          inventory.lastUpdated = new Date();
          newAdjustment.approvedAt = new Date();
          newAdjustment.approvedBy = 'system.auto';
        }

        this.stockAdjustments.push(newAdjustment);
        
        return of(newAdjustment);
      })
    );
  }

  /**
   * Get stock adjustments for a product
   */
  getStockAdjustmentsByProduct(
    productId: ProductId, 
    locationId?: string,
    fromDate?: Date,
    toDate?: Date
  ): Observable<StockAdjustment[]> {
    return of(this.stockAdjustments).pipe(
      delay(200),
      map(adjustments => {
        let filtered = adjustments.filter(adj => adj.productId === productId);
        
        if (locationId) {
          filtered = filtered.filter(adj => adj.locationId === locationId);
        }
        
        if (fromDate) {
          filtered = filtered.filter(adj => new Date(adj.createdAt) >= fromDate);
        }
        
        if (toDate) {
          filtered = filtered.filter(adj => new Date(adj.createdAt) <= toDate);
        }
        
        // Sort by creation date, newest first
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      })
    );
  }

  /**
   * Get a specific stock adjustment by ID
   */
  getStockAdjustmentById(adjustmentId: string): Observable<StockAdjustment | null> {
    return of(this.stockAdjustments.find(adj => adj.id === adjustmentId) || null).pipe(delay(150));
  }

  /**
   * Cancel/reject a pending stock adjustment
   */
  cancelStockAdjustment(adjustmentId: string, reason?: string): Observable<StockAdjustment> {
    return of(null).pipe(
      delay(250),
      switchMap(() => {
        const adjustment = this.stockAdjustments.find(adj => adj.id === adjustmentId);
        
        if (!adjustment) {
          return throwError(() => new Error('Stock adjustment not found'));
        }
        
        if (adjustment.status !== 'pending') {
          return throwError(() => new Error('Only pending adjustments can be cancelled'));
        }
        
        // Update adjustment status
        adjustment.status = 'rejected';
        adjustment.approvedAt = new Date();
        adjustment.approvedBy = 'current.user'; // In real app, get from auth service
        adjustment.notes = adjustment.notes ? 
          `${adjustment.notes}\n\nRejection reason: ${reason || 'No reason provided'}` :
          `Rejection reason: ${reason || 'No reason provided'}`;
        
        return of(adjustment);
      })
    );
  }

  /**
   * Approve a pending stock adjustment
   */
  approveStockAdjustment(adjustmentId: string, approvedBy: string): Observable<StockAdjustment> {
    return of(null).pipe(
      delay(250),
      switchMap(() => {
        const adjustment = this.stockAdjustments.find(adj => adj.id === adjustmentId);
        
        if (!adjustment) {
          return throwError(() => new Error('Stock adjustment not found'));
        }
        
        if (adjustment.status !== 'pending') {
          return throwError(() => new Error('Only pending adjustments can be approved'));
        }
        
        // Find and update the inventory
        const inventory = this.inventory.find(i => 
          i.productId === adjustment.productId && i.locationId === adjustment.locationId
        );
        
        if (!inventory) {
          return throwError(() => new Error('Product inventory not found'));
        }
        
        // Apply the adjustment
        inventory.quantityAvailable = adjustment.quantityAfter;
        inventory.lastUpdated = new Date();
        
        // Update adjustment status
        adjustment.status = 'approved';
        adjustment.approvedAt = new Date();
        adjustment.approvedBy = approvedBy;
        
        return of(adjustment);
      })
    );
  }

  /**
   * Get pending stock adjustments requiring approval
   */
  getPendingStockAdjustments(locationId?: string): Observable<StockAdjustment[]> {
    return of(this.stockAdjustments).pipe(
      delay(200),
      map(adjustments => {
        let filtered = adjustments.filter(adj => adj.status === 'pending');
        
        if (locationId) {
          filtered = filtered.filter(adj => adj.locationId === locationId);
        }
        
        // Sort by creation date, oldest first for approval queue
        return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      })
    );
  }

  // =============================================================================
  // LEGACY HELPER METHODS (for compatibility)
  // =============================================================================
  getInventoryByProduct(productId: ProductId): Observable<ProductInventory[]> {
    return this.getProductInventoryByLocation(productId);
  }
}