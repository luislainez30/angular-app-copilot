import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Subject, takeUntil, combineLatest, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Domain models
import { 
  InventoryLocation, 
  CreateInventoryLocation 
} from '../../../../../core/domain/models/inventory/inventory.interface';

// Repository
import { INVENTORY_LOCATION_REPOSITORY_TOKEN } from '../../../../../core/application/ports/inventory-location-repository.token';

// Use cases
import { 
  CreateInventoryLocationUseCase, 
  UpdateInventoryLocationUseCase, 
  DeleteInventoryLocationUseCase 
} from '../../../../../core/application/use-cases/inventory';

// Services
import { 
  InventoryLocationFormBuilderService 
} from '../../services/inventory-location-form-builder.service';
import { AlertService } from '../../../../../core/application/services/alert.service';

@Component({
  selector: 'app-manage-inventory-location',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './manage-inventory-location.component.html',
  styleUrls: ['./manage-inventory-location.component.scss']
})
export class ManageInventoryLocationComponent implements OnInit, OnDestroy {
  // Dependencies
  private createLocationUseCase = inject(CreateInventoryLocationUseCase);
  private updateLocationUseCase = inject(UpdateInventoryLocationUseCase);
  private deleteLocationUseCase = inject(DeleteInventoryLocationUseCase);
  private locationRepository = inject(INVENTORY_LOCATION_REPOSITORY_TOKEN);
  private formBuilder = inject(InventoryLocationFormBuilderService);
  private alertService = inject(AlertService);

  // Component state
  private destroy$ = new Subject<void>();

  // Data
  locations: InventoryLocation[] = [];
  filteredLocations: InventoryLocation[] = [];

  // UI state
  isCreating = false;
  isEditing = false;
  editingLocationId: string | null = null;
  selectedLocations: Set<string> = new Set();

  // Loading states
  loadingLocations = true;
  savingLocation = false;

  // Error states
  error: string | null = null;
  formError: string | null = null;

  // Forms
  locationForm: FormGroup;
  filterForm: FormGroup;

  constructor() {
    // Initialize forms
    this.locationForm = this.formBuilder.createLocationForm();
    this.filterForm = this.formBuilder.createLocationFilterForm();
    
    // Disable form initially
    this.locationForm.disable();
  }

  ngOnInit(): void {
    this.loadLocations();
    this.setupFilterWatcher();
    console.log('locations component');
    
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =============================================================================
  // DATA LOADING
  // =============================================================================

  /**
   * Load all inventory locations
   */
  private loadLocations(): void {
    this.loadingLocations = true;
    this.error = null;

    // Use the repository to get all locations
    this.locationRepository.getAll()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading locations:', error);
          this.error = 'Failed to load inventory locations. Please try again.';
          return of([]);
        })
      )
      .subscribe({
        next: (locations) => {
          this.locations = locations;
          this.filteredLocations = [...locations];
          this.loadingLocations = false;
        },
        error: (error) => {
          console.error('Error in location subscription:', error);
          this.error = 'Failed to load inventory locations. Please try again.';
          this.loadingLocations = false;
        }
      });
  }

  /**
   * Setup filter watching
   */
  private setupFilterWatcher(): void {
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyFilters();
      });
  }

  /**
   * Apply search and filter criteria
   */
  private applyFilters(): void {
    const { searchTerm, type, isActive, sortBy, sortOrder } = this.filterForm.value;
    
    let filtered = [...this.locations];

    // Apply search filter
    if (searchTerm?.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(location =>
        location.name.toLowerCase().includes(search) ||
        location.code.toLowerCase().includes(search) ||
        location.address?.toLowerCase().includes(search)
      );
    }

    // Apply type filter
    if (type) {
      filtered = filtered.filter(location => location.type === type);
    }

    // Apply active status filter
    if (isActive !== '') {
      const activeStatus = isActive === 'true';
      filtered = filtered.filter(location => location.isActive === activeStatus);
    }

    this.filteredLocations = filtered;
  }

  // =============================================================================
  // FORM MANAGEMENT
  // =============================================================================

  /**
   * Start creating a new location
   */
  startCreate(): void {
    this.isCreating = true;
    this.isEditing = false;
    this.editingLocationId = null;
    this.formError = null;
    
    this.formBuilder.resetLocationForm(this.locationForm);
    this.locationForm.enable();
  }

  /**
   * Start editing an existing location
   */
  startEdit(location: InventoryLocation): void {
    this.isCreating = false;
    this.isEditing = true;
    this.editingLocationId = location.id;
    this.formError = null;
    
    this.formBuilder.resetLocationForm(this.locationForm, location);
    this.locationForm.enable();
  }

  /**
   * Cancel form editing
   */
  cancelForm(): void {
    if (this.locationForm.dirty) {
      if (!confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        return;
      }
    }
    
    this.resetFormState();
  }

  /**
   * Reset form to initial state
   */
  private resetFormState(): void {
    this.isCreating = false;
    this.isEditing = false;
    this.editingLocationId = null;
    this.formError = null;
    
    this.formBuilder.resetLocationForm(this.locationForm);
    this.locationForm.disable();
  }

  /**
   * Save location (create or update)
   */
  saveLocation(): void {
    if (!this.locationForm.valid) {
      this.locationForm.markAllAsTouched();
      this.formError = 'Please fix the form errors before saving.';
      return;
    }

    this.savingLocation = true;
    this.formError = null;

    if (this.isCreating) {
      this.createLocation();
    } else if (this.isEditing && this.editingLocationId) {
      this.updateLocation();
    }
  }

  /**
   * Create new location
   */
  private createLocation(): void {
    const createData = this.formBuilder.mapToCreateLocation(this.locationForm.value);
    
    this.createLocationUseCase.execute(createData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (location) => {
          this.alertService.showSuccess(`Location "${location.name}" created successfully`);
          this.locations.push(location);
          this.applyFilters();
          this.resetFormState();
          this.savingLocation = false;
        },
        error: (err) => {
          console.error('Error creating location:', err);
          this.formError = err.message || 'Failed to create location. Please try again.';
          this.savingLocation = false;
        }
      });
  }

  /**
   * Update existing location
   */
  private updateLocation(): void {
    if (!this.editingLocationId) return;

    const updateData = this.formBuilder.mapToUpdateLocation(this.locationForm.value);
    
    this.updateLocationUseCase.execute(this.editingLocationId, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (location) => {
          this.alertService.showSuccess(`Location "${location.name}" updated successfully`);
          
          // Update location in array
          const index = this.locations.findIndex(l => l.id === location.id);
          if (index >= 0) {
            this.locations[index] = location;
            this.applyFilters();
          }
          
          this.resetFormState();
          this.savingLocation = false;
        },
        error: (err) => {
          console.error('Error updating location:', err);
          this.formError = err.message || 'Failed to update location. Please try again.';
          this.savingLocation = false;
        }
      });
  }

  // =============================================================================
  // LOCATION ACTIONS
  // =============================================================================

  /**
   * Toggle location active status
   */
  toggleLocationStatus(location: InventoryLocation): void {
    const action = location.isActive ? 'deactivate' : 'activate';
    const useCase = location.isActive 
      ? this.deleteLocationUseCase.deactivate(location.id)
      : this.deleteLocationUseCase.activate(location.id);

    if (!confirm(`Are you sure you want to ${action} "${location.name}"?`)) {
      return;
    }

    useCase.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedLocation) => {
          this.alertService.showSuccess(`Location ${action}d successfully`);
          
          // Update location in array
          const index = this.locations.findIndex(l => l.id === updatedLocation.id);
          if (index >= 0) {
            this.locations[index] = updatedLocation;
            this.applyFilters();
          }
        },
        error: (err) => {
          console.error(`Error ${action}ing location:`, err);
          this.alertService.showError(`Failed to ${action} location`);
        }
      });
  }

  /**
   * Delete location permanently
   */
  deleteLocation(location: InventoryLocation): void {
    const confirmMessage = 
      `Are you sure you want to permanently delete "${location.name}"?\n\n` +
      `Code: ${location.code}\n` +
      `This action cannot be undone and may affect inventory records.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    this.deleteLocationUseCase.execute(location.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success) => {
          if (success) {
            this.alertService.showSuccess(`Location "${location.name}" deleted successfully`);
            
            // Remove from array
            this.locations = this.locations.filter(l => l.id !== location.id);
            this.applyFilters();
            
            // Clear selection if deleted location was selected
            this.selectedLocations.delete(location.id);
            
            // Cancel editing if this location was being edited
            if (this.editingLocationId === location.id) {
              this.resetFormState();
            }
          }
        },
        error: (err) => {
          console.error('Error deleting location:', err);
          this.alertService.showError(err.message || 'Failed to delete location');
        }
      });
  }

  // =============================================================================
  // SELECTION MANAGEMENT
  // =============================================================================

  /**
   * Toggle location selection
   */
  toggleSelection(locationId: string): void {
    if (this.selectedLocations.has(locationId)) {
      this.selectedLocations.delete(locationId);
    } else {
      this.selectedLocations.add(locationId);
    }
  }

  /**
   * Select all filtered locations
   */
  selectAll(): void {
    this.filteredLocations.forEach(location => {
      this.selectedLocations.add(location.id);
    });
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    this.selectedLocations.clear();
  }

  /**
   * Check if all filtered locations are selected
   */
  isAllSelected(): boolean {
    return this.filteredLocations.length > 0 && 
           this.filteredLocations.every(location => this.selectedLocations.has(location.id));
  }

  /**
   * Check if some (but not all) locations are selected
   */
  isIndeterminate(): boolean {
    const selected = this.filteredLocations.filter(location => this.selectedLocations.has(location.id));
    return selected.length > 0 && selected.length < this.filteredLocations.length;
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Auto-generate code from name
   */
  onNameChange(): void {
    const nameControl = this.locationForm.get('name');
    const codeControl = this.locationForm.get('code');
    
    if (nameControl?.value && (!codeControl?.value || !codeControl.dirty)) {
      const generatedCode = this.formBuilder.generateCodeFromName(nameControl.value);
      codeControl?.patchValue(generatedCode);
    }
  }

  /**
   * Get location type badge class
   */
  getTypeClass(type: string): string {
    switch (type) {
      case 'warehouse':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'store':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'supplier':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  /**
   * Get status badge class
   */
  getStatusClass(isActive: boolean): string {
    return isActive
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : 'bg-red-100 text-red-800 border-red-200';
  }

  /**
   * Check if form field has error
   */
  hasError(fieldName: string): boolean {
    const field = this.locationForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Get form field error message
   */
  getFieldError(fieldName: string): string {
    const field = this.locationForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
    if (field.errors['minlength']) return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
    if (field.errors['maxlength']) return `${this.getFieldDisplayName(fieldName)} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
    if (field.errors['locationName']) return 'Contains invalid characters';
    if (field.errors['locationCode']) return 'Must contain only letters, numbers, hyphens, and underscores';
    
    return 'Invalid value';
  }

  /**
   * Get user-friendly field name
   */
  private getFieldDisplayName(fieldName: string): string {
    const names: { [key: string]: string } = {
      'name': 'Location name',
      'code': 'Location code',
      'type': 'Location type',
      'address': 'Address'
    };
    return names[fieldName] || fieldName;
  }
}