// ===== PRODUCT INVENTORY USE CASES =====
export { GetProductInventoryUseCase } from './inventory/get-product-inventory.use-case';
export { CreateProductInventoryUseCase } from './inventory/create-product-inventory.use-case';
export { UpdateProductInventoryUseCase } from './inventory/update-product-inventory.use-case';
export { TransferStockUseCase } from './inventory/transfer-stock.use-case';
export { ReserveStockUseCase } from './inventory/reserve-stock.use-case';
export { GetStockMovementsUseCase } from './inventory/get-stock-movements.use-case';

// ===== INVENTORY LOCATION USE CASES =====
export { GetInventoryLocationsUseCase } from './locations/get-inventory-locations.use-case';
export { GetInventoryLocationUseCase } from './locations/get-inventory-location.use-case';
export { CreateInventoryLocationUseCase } from './locations/create-inventory-location.use-case';
export { UpdateInventoryLocationUseCase } from './locations/update-inventory-location.use-case';
export { DeleteInventoryLocationUseCase } from './locations/delete-inventory-location.use-case';

// ===== STOCK ADJUSTMENT USE CASES =====
export { CreateStockAdjustmentUseCase } from './adjustments/create-stock-adjustment.use-case';
export { GetStockAdjustmentsUseCase } from './adjustments/get-stock-adjustments.use-case';
export { ApproveStockAdjustmentUseCase } from './adjustments/approve-stock-adjustment.use-case';

// ===== LEGACY USE CASES (to be migrated) =====
// These are existing use cases that haven't been moved yet
export { GetStockMovementsByProductUseCase } from './movements/get-stock-movements-by-product.use-case';