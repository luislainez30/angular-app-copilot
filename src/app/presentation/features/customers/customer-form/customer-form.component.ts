import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';

import { PageTitleComponent } from '../../../shared/components';
import { 
  CustomerFormBuilderService, 
  CustomerFormConfig, 
  FormSection, 
  FormFieldConfig, 
  FormFieldType, 
  FormFieldOption
} from '../services/customer-form-builder.service';
import { CreateCustomer, Customer } from '../../../../core/domain/models/customers';
import { 
  GetCustomerByIdUseCase,
  CreateCustomerUseCase,
  UpdateCustomerUseCase
} from '../../../../core/application/use-cases/customers';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink, 
    PageTitleComponent
  ],
  templateUrl: 'customer-form.html',
  styles: []
})
export class CustomerFormComponent implements OnInit, OnDestroy {
  customerForm!: FormGroup;
  formConfig!: CustomerFormConfig;
  isEditMode = false;
  customerId: string | null = null;
  isSubmitting = false;
  showDebugInfo = false; // Set to true for development
  
  // Expose enum for template
  FormFieldType = FormFieldType;
  
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: CustomerFormBuilderService,
    private getCustomerByIdUseCase: GetCustomerByIdUseCase,
    private createCustomerUseCase: CreateCustomerUseCase,
    private updateCustomerUseCase: UpdateCustomerUseCase,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupRouteHandling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.formConfig = this.formBuilder.getFormConfiguration();
    this.customerForm = this.formBuilder.buildCustomerForm();
    
    // Update submit label based on mode
    if (this.isEditMode) {
      this.formConfig.submitLabel = 'Update Customer';
    }
  }

  private setupRouteHandling(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.customerId = params['id'] || null;
        this.isEditMode = !!this.customerId;
        
        if (this.isEditMode) {
          this.loadCustomerData();
        }
      });
  }

  private loadCustomerData(): void {
    if (!this.customerId) return;
    
    this.getCustomerByIdUseCase.execute(this.customerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (customer) => {
          if (customer) {
            this.populateFormWithCustomerData(customer);
          } else {
            // Navigate back to list if customer doesn't exist
            this.router.navigate(['/customers']);
          }
        },
        error: (error) => {
          console.error('Error loading customer:', error);
          this.router.navigate(['/customers']);
        }
      });
  }
  
  private populateFormWithCustomerData(customer: Customer): void {
    // Create form data that matches the form structure
    const formData = {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      dateOfBirth: this.formatDateForInput(customer.dateOfBirth),
      street: customer.address.street,
      city: customer.address.city,
      state: customer.address.state,
      postalCode: customer.address.postalCode,
      country: customer.address.country,
      isDefaultAddress: customer.address.isDefault ?? true,
      communicationMethod: customer.preferences.communicationMethod,
      language: customer.preferences.language,
      currency: customer.preferences.currency,
      timezone: customer.preferences.timezone,
      newsletter: customer.preferences.newsletter,
      promotions: customer.preferences.promotions
    };
    this.customerForm.patchValue(formData);
  }
  
  private formatDateForInput(date: Date): string {
    // Convert Date to YYYY-MM-DD format for HTML date input
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return new Date(date).toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isSubmitting = true;
    const customerData: CreateCustomer = this.formBuilder.transformFormToCustomer(this.customerForm.value);
    
    if (this.isEditMode && this.customerId) {
      // Update existing customer
      this.updateCustomerUseCase.execute(this.customerId, {
        ...customerData,
        id: this.customerId,
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: (updatedCustomer) => {
          if (updatedCustomer) {
            this.handleFormSubmissionSuccess('Customer updated successfully', updatedCustomer);
          } else {
            this.handleFormSubmissionError('Customer not found');
          }
        },
        error: (error) => {
          console.error('Error updating customer:', error);
          this.handleFormSubmissionError('Failed to update customer');
        }
      });
    } else {
      // Create new customer
      this.createCustomerUseCase.execute({
        ...customerData,
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: (newCustomer) => {
          this.handleFormSubmissionSuccess('Customer created successfully', newCustomer);
        },
        error: (error) => {
          console.error('Error creating customer:', error);
          this.handleFormSubmissionError('Failed to create customer');
        }
      });
    }
  }

  private handleFormSubmissionSuccess(message: string, customer: Customer): void {
    console.log(message, customer);
    
    // Optional: Show success message (you can implement a toast service)
    // this.toastService.success(message);
    
    // Navigate back to customer list
    this.router.navigate(['/customers']);
  }

  private handleFormSubmissionError(message: string): void {
    console.error(message);
    
    // Optional: Show error message (you can implement a toast service)
    // this.toastService.error(message);
    
    // Could also set a component property to show error in template
    // this.errorMessage = message;
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.customerForm.controls).forEach(key => {
      const control = this.customerForm.get(key);
      if (control) {
        control.markAsTouched();
      }      
    });
  }

  // Template Helper Methods
  trackBySection(index: number, section: FormSection): string {
    return section.key;
  }

  trackByField(index: number, field: FormFieldConfig): string {
    return field.key;
  }

  trackByOption(index: number, option: FormFieldOption): any {
    return option.value;
  }

  isTextInput(fieldType: FormFieldType): boolean {
    return [
      FormFieldType.TEXT,
      FormFieldType.EMAIL,
      FormFieldType.TEL,
      FormFieldType.DATE
    ].includes(fieldType);
  }

  getInputType(fieldType: FormFieldType): string {
    switch (fieldType) {
      case FormFieldType.EMAIL: return 'email';
      case FormFieldType.TEL: return 'tel';
      case FormFieldType.DATE: return 'date';
      default: return 'text';
    }
  }

  getFieldColumnSpan(field: FormFieldConfig): string {
    // Full width fields
    const fullWidthFields = ['street', 'communicationMethod'];
    if (fullWidthFields.includes(field.key) || field.type === FormFieldType.TEXTAREA) {
      return 'md:col-span-2';
    }
    return 'md:col-span-1';
  }

  getInputClasses(fieldKey: string): string {
    const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-colors';
    
    if (this.isFieldInvalid(fieldKey)) {
      return `${baseClasses} border-red-300 text-red-900 placeholder-red-300 focus:border-red-300 focus:ring-red-500`;
    }
    
    return `${baseClasses} border-slate-300 placeholder-slate-400 focus:border-blue-500`;
  }

  getSubmitButtonClasses(): string {
    const baseClasses = 'px-6 py-2 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors';
    
    if (this.customerForm.invalid || this.isSubmitting) {
      return `${baseClasses} bg-slate-400 cursor-not-allowed`;
    }
    
    return `${baseClasses} bg-blue-600 hover:bg-blue-700`;
  }

  isFieldInvalid(fieldKey: string): boolean {
    const control = this.customerForm.get(fieldKey);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldErrorMessages(fieldKey: string): string[] {
    const control = this.customerForm.get(fieldKey);
    if (!control || !control.errors) {
      return [];
    }
    
    const formErrors = this.formBuilder.validateForm(this.customerForm);
    return formErrors[fieldKey] || [];
  }
}