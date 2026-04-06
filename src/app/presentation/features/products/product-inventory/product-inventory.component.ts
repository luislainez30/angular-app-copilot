import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, combineLatest, of, EMPTY } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

// Domain models
import { Product } from '../../../../core/domain/models/products/product.interface';
import { ProductId } from '../../../../core/domain/models/products/product-types';
import { 
  ProductInventory, 
  InventoryLocation, 
  InventoryAggregate,
  StockStatus
} from '../../../../core/domain/models/inventory/inventory.interface';

// Use cases
import { GetProductUseCase } from '../../../../core/application/use-cases/products/get-product.use-case';
import { 
  GetProductInventoryUseCase,
  CreateProductInventoryUseCase,
  UpdateProductInventoryUseCase,
  GetInventoryLocationsUseCase
} from '../../../../core/application/use-cases/inventory';

// Services
import { AlertService } from '../../../../core/application/services/alert.service';

// Shared components
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';
import { InventoryFormBuilderService } from '../services/inventory-form-builder.service';
import { ManageInventoryLocationComponent } from './locations/manage-inventory-location.component';
import { StockMovementsComponent } from './stock-movements/stock-movements.component';
import { ManageInventoryAdjustmentsComponent } from './adjustments/manage-inventory-adjustments.component';

@Component({
  selector: 'app-product-inventory',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    FormsModule,
    PageTitleComponent,
    ManageInventoryLocationComponent,
    StockMovementsComponent,
    ManageInventoryAdjustmentsComponent
  ],
  templateUrl: './product-inventory.component.html',
  styleUrls: ['./product-inventory.component.scss']
})
export class ProductInventoryComponent implements OnInit, OnDestroy {
  // Dependencies
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private getProductUseCase = inject(GetProductUseCase);
  private getInventoryUseCase = inject(GetProductInventoryUseCase);
  private createInventoryUseCase = inject(CreateProductInventoryUseCase);
  private updateInventoryUseCase = inject(UpdateProductInventoryUseCase);
  private getLocationsUseCase = inject(GetInventoryLocationsUseCase);
  private inventoryFormBuilder = inject(InventoryFormBuilderService);
  private alertService = inject(AlertService);

  // Component state
  private destroy$ = new Subject<void>();
  
  // Core data
  product: Product | null = null;
  productId: ProductId | null = null;
  inventoryAggregate: InventoryAggregate | null = null;
  productInventories: ProductInventory[] = [];
  availableLocations: InventoryLocation[] = [];
  // Loading states
  loading = true;
  savingInventory = false;

  // Error states
  error: string | null = null;
  inventoryError: string | null = null;

  // Forms
  inventoryForm: FormGroup;
  movementForm: FormGroup;
  adjustmentForm: FormGroup;

  // UI state
  selectedLocationId: string | null = null;
  activeTab: 'overview' | 'locations' | 'movements' | 'adjustments' = 'overview';
  showAddLocationForm = false;
  isEditingInventory = false;
  currentInventoryRecord: ProductInventory | null = null;

  // Enum references for template
  StockStatus = StockStatus;

  constructor() {
    // Initialize forms with disabled state
    this.inventoryForm = this.inventoryFormBuilder.createProductInventoryForm();
    this.movementForm = this.inventoryFormBuilder.createStockMovementForm();
    this.adjustmentForm = this.inventoryFormBuilder.createInventoryAdjustmentForm();
    
    // Disable inventory form initially
    this.inventoryForm.disable();
  }

  ngOnInit(): void {
    // Get product ID from route
    this.route.paramMap.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        const productIdParam = params.get('id') as ProductId | null;
        if (!productIdParam) {
          this.error = 'Product ID is required';
          return EMPTY;
        }        
        this.productId = productIdParam;
        this.loading = true;
        
        // Load product and inventory data
        return combineLatest([
          this.getProductUseCase.executeById(this.productId),
          this.getInventoryUseCase.getProductInventoryAggregate(this.productId)
        ]);
      }),
      catchError(err => {
        console.error('Error loading product inventory:', err);
        this.error = 'Failed to load product inventory data';
        this.loading = false;
        return of([null, null]);
      })
    ).subscribe(([product, aggregate]) => {
      if (product && aggregate) {
        this.product = product;
        this.inventoryAggregate = aggregate;
        this.loadInventoryData();
      }
      this.loading = false;
    });

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load inventory data for all locations
   */
  private loadInventoryData(): void {
    if (!this.productId) return;

    // Load all inventory locations from mock service
    this.getLocationsUseCase.getInventoryLocations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (locations) => {
          this.availableLocations = locations;
          
          // Set default selected location to first location
          if (this.availableLocations.length > 0 && !this.selectedLocationId) {
            this.selectedLocationId = this.availableLocations[0].id;
            this.loadLocationInventory();
          }
        },
        error: (err) => {
          console.error('Error loading inventory locations:', err);
          this.inventoryError = 'Failed to load inventory locations';
        }
      });
  }

  /**
   * Load inventory for selected location
   */
  loadLocationInventory(): void {
    if (!this.productId || !this.selectedLocationId) return;

    // Reset editing state when loading new location
    this.stopEditing();
    this.inventoryError = null;

    this.getInventoryUseCase.getProductInventory(this.productId, this.selectedLocationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (inventory) => {
          this.currentInventoryRecord = inventory;
          
          if (inventory) {
            // Update form with existing inventory data
            this.inventoryForm = this.inventoryFormBuilder.createProductInventoryForm(inventory);
          } else {
            // Create new inventory form for this location
            this.inventoryForm = this.inventoryFormBuilder.createProductInventoryForm();
            // Pre-fill productId and locationId for new records
            this.inventoryForm.patchValue({
              productId: this.productId,
              locationId: this.selectedLocationId
            });
          }
          
          // Always start in disabled/view mode
          this.inventoryForm.disable();
        },
        error: (err) => {
          console.error('Error loading location inventory:', err);
          this.inventoryError = 'Failed to load inventory for selected location';
        }
      });
  }

 
  // =============================================================================
  // FORM HANDLERS
  // =============================================================================

  /**
   * Save inventory changes
   */
  saveInventory(): void {
    if (!this.inventoryForm.valid || !this.productId || !this.selectedLocationId) {
      this.inventoryForm.markAllAsTouched();
      return;
    }

    this.savingInventory = true;
    this.inventoryError = null;

    // Check if this is create or update
    const isCreate = !this.inventoryForm.get('lastUpdated')?.value;
    
    if (isCreate) {
      // Create new inventory
      const createData = this.inventoryFormBuilder.mapToCreateProductInventory(this.inventoryForm.value);
      
      this.createInventoryUseCase.createProductInventory(createData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (inventory) => {
            this.alertService.showSuccess('Inventory created successfully');
            this.currentInventoryRecord = inventory;
            this.inventoryForm = this.inventoryFormBuilder.createProductInventoryForm(inventory);
            this.inventoryForm.disable(); // Return to view mode
            this.isEditingInventory = false;
            this.savingInventory = false;
            this.refreshData();
          },
          error: (err) => {
            console.error('Error creating inventory:', err);
            this.inventoryError = 'Failed to create inventory. Please try again.';
            this.savingInventory = false;
          }
        });
    } else {
      // Update existing inventory
      const updateData = this.inventoryFormBuilder.mapToUpdateProductInventory(this.inventoryForm.value);
      
      this.updateInventoryUseCase.updateProductInventory(this.productId, this.selectedLocationId, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (inventory) => {
            this.alertService.showSuccess('Inventory updated successfully');
            this.currentInventoryRecord = inventory;
            this.inventoryForm = this.inventoryFormBuilder.createProductInventoryForm(inventory);
            this.inventoryForm.disable(); // Return to view mode
            this.isEditingInventory = false;
            this.savingInventory = false;
            this.refreshData();
          },
          error: (err) => {
            console.error('Error updating inventory:', err);
            this.inventoryError = 'Failed to update inventory. Please try again.';
            this.savingInventory = false;
          }
        });
    }
  }

  /**
   * Handle location selection change
   */
  onLocationChange(locationId: string): void {
    // If user was editing and switches location, confirm they want to lose changes
    if (this.isEditingInventory && this.inventoryForm.dirty) {
      if (!confirm('You have unsaved changes. Are you sure you want to switch locations?')) {
        return; // Don't change location
      }
    }
    
    this.selectedLocationId = locationId;
    this.loadLocationInventory();
  }

  /**
   * Set active tab
   */
  setActiveTab(tab: 'overview' | 'locations' | 'movements' | 'adjustments'): void {
    this.activeTab = tab;
    console.log(tab);
    
  }

  /**
   * Check if a specific tab is active
   */
  isActiveTab(tab: 'overview' | 'locations' | 'movements' | 'adjustments'): boolean {
    return this.activeTab === tab;
  }

  // =============================================================================
  // EDIT MODE MANAGEMENT
  // =============================================================================

  /**
   * Enable inventory editing
   */
  startEditing(): void {
    if (!this.selectedLocationId) {
      this.alertService.showError('Please select a location first');
      return;
    }
    
    this.isEditingInventory = true;
    this.inventoryForm.enable();
    this.inventoryError = null;
  }

  /**
   * Cancel inventory editing
   */
  cancelEditing(): void {
    if (this.inventoryForm.dirty) {
      if (!confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        return;
      }
    }
    
    this.stopEditing();
    
    // Reload the original data
    if (this.currentInventoryRecord) {
      this.inventoryForm = this.inventoryFormBuilder.createProductInventoryForm(this.currentInventoryRecord);
    } else {
      this.inventoryForm = this.inventoryFormBuilder.createProductInventoryForm();
      this.inventoryForm.patchValue({
        productId: this.productId,
        locationId: this.selectedLocationId
      });
    }
    this.inventoryForm.disable();
  }

  /**
   * Stop editing mode
   */
  private stopEditing(): void {
    this.isEditingInventory = false;
    this.inventoryForm.disable();
    this.inventoryError = null;
  }

  /**
   * Refresh all data
   */
  private refreshData(): void {
    if (!this.productId) return;
    
    this.getInventoryUseCase.getProductInventoryAggregate(this.productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (aggregate) => {
          this.inventoryAggregate = aggregate;
        },
        error: (err) => {
          console.error('Error refreshing aggregate data:', err);
        }
      });
  }

  /**
   * Get stock status badge classes
   */
  getStockStatusClasses(status: StockStatus): string {
    switch (status) {
      case StockStatus.IN_STOCK:
        return 'bg-green-100 text-green-800 border-green-200';
      case StockStatus.LOW_STOCK:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case StockStatus.OUT_OF_STOCK:
        return 'bg-red-100 text-red-800 border-red-200';
      case StockStatus.ON_BACKORDER:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case StockStatus.DISCONTINUED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  /**
   * Get stock status label
   */
  getStockStatusLabel(status: StockStatus): string {
    switch (status) {
      case StockStatus.IN_STOCK:
        return 'In Stock';
      case StockStatus.LOW_STOCK:
        return 'Low Stock';
      case StockStatus.OUT_OF_STOCK:
        return 'Out of Stock';
      case StockStatus.ON_BACKORDER:
        return 'On Backorder';
      case StockStatus.DISCONTINUED:
        return 'Discontinued';
      default:
        return 'Unknown';
    }
  }

  /**
   * Go back to product list
   */
  goBack(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Navigate to product detail
   */
  viewProduct(): void {
    if (this.productId) {
      this.router.navigate(['/products', this.productId]);
    }
  }

  /**
   * Check if form field has error
   */
  hasError(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Get form field error message
   */
  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return `${fieldName} is required`;
    if (field.errors['min']) return `${fieldName} must be greater than ${field.errors['min'].min}`;
    if (field.errors['numeric']) return `${fieldName} must be a valid number`;
    if (field.errors['currency']) return `${fieldName} must be a valid currency amount`;
    
    return 'Invalid value';
  }
}