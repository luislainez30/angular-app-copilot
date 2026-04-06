import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { 
  CreateCustomer, 
  Address, 
  CustomerPreferences, 
  CommunicationMethod, 
  DEFAULT_CUSTOMER_PREFERENCES 
} from '../../../../core/domain/models/customers';

/**
 * Form field configuration interface
 */
export interface FormFieldConfig {
  key: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  validators?: ValidatorFn[];
  options?: FormFieldOption[];
  placeholder?: string;
  hint?: string;
  group?: string;
  order: number;
}

/**
 * Form field option for select/radio fields
 */
export interface FormFieldOption {
  value: any;
  label: string;
  disabled?: boolean;
}

/**
 * Form field types supported by the dynamic form
 */
export enum FormFieldType {
  TEXT = 'text',
  EMAIL = 'email',
  TEL = 'tel',
  DATE = 'date',
  SELECT = 'select',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  TEXTAREA = 'textarea'
}

/**
 * Form section for organizing related fields
 */
export interface FormSection {
  key: string;
  title: string;
  description?: string;
  fields: FormFieldConfig[];
  order: number;
}

/**
 * Complete form configuration
 */
export interface CustomerFormConfig {
  sections: FormSection[];
  submitLabel: string;
  cancelLabel: string;
}

/**
 * Service responsible for building and managing customer creation forms
 * Located in presentation layer as it handles Angular-specific form logic
 */
@Injectable({
  providedIn: 'root'
})
export class CustomerFormBuilderService {

  constructor(private fb: FormBuilder) {}

  /**
   * Build the complete customer creation form
   */
  buildCustomerForm(initialData?: Partial<CreateCustomer>): FormGroup {
    const formConfig = this.getFormConfiguration();
    return this.createFormFromConfig(formConfig, initialData);
  }

  /**
   * Get the complete form configuration with all fields and sections
   */
  getFormConfiguration(): CustomerFormConfig {
    return {
      sections: [
        this.getPersonalInfoSection(),
        this.getAddressSection(),
        this.getPreferencesSection()
      ],
      submitLabel: 'Create Customer',
      cancelLabel: 'Cancel'
    };
  }

  /**
   * Get all form fields organized by sections
   */
  getFormFields(): FormFieldConfig[] {
    const config = this.getFormConfiguration();
    return config.sections.flatMap(section => section.fields)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Validate the entire form and return validation errors
   */
  validateForm(form: FormGroup): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control && control.errors) {
        errors[key] = this.getFieldErrors(control);
      }
    });

    return errors;
  }

  /**
   * Transform form data to CreateCustomer interface
   */
  transformFormToCustomer(formValue: any): CreateCustomer {
    const customer: CreateCustomer = {
      firstName: formValue.firstName?.trim(),
      lastName: formValue.lastName?.trim(),
      email: formValue.email?.trim().toLowerCase(),
      phone: formValue.phone?.trim(),
      dateOfBirth: new Date(formValue.dateOfBirth),
      address: {
        street: formValue.street?.trim(),
        city: formValue.city?.trim(),
        state: formValue.state?.trim(),
        postalCode: formValue.postalCode?.trim(),
        country: formValue.country?.trim(),
        isDefault: formValue.isDefaultAddress ?? true
      },
      preferences: {
        communicationMethod: formValue.communicationMethod || CommunicationMethod.EMAIL,
        newsletter: formValue.newsletter ?? false,
        promotions: formValue.promotions ?? false,
        language: formValue.language || 'en',
        currency: formValue.currency || 'USD',
        timezone: formValue.timezone || 'UTC'
      }
    };

    return customer;
  }

  /**
   * Get personal information section fields
   */
  private getPersonalInfoSection(): FormSection {
    return {
      key: 'personalInfo',
      title: 'Personal Information',
      description: 'Basic customer details and contact information',
      order: 1,
      fields: [
        {
          key: 'firstName',
          label: 'First Name',
          type: FormFieldType.TEXT,
          required: true,
          validators: [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
            this.nameValidator()
          ],
          placeholder: 'Enter first name',
          hint: 'Minimum 2 characters, letters only',
          group: 'personalInfo',
          order: 1
        },
        {
          key: 'lastName',
          label: 'Last Name',
          type: FormFieldType.TEXT,
          required: true,
          validators: [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
            this.nameValidator()
          ],
          placeholder: 'Enter last name',
          hint: 'Minimum 2 characters, letters only',
          group: 'personalInfo',
          order: 2
        },
        {
          key: 'email',
          label: 'Email Address',
          type: FormFieldType.EMAIL,
          required: true,
          validators: [
            Validators.required,
            Validators.email,
            Validators.maxLength(100)
          ],
          placeholder: 'Enter email address',
          hint: 'Valid email address required',
          group: 'personalInfo',
          order: 3
        },
        {
          key: 'phone',
          label: 'Phone Number',
          type: FormFieldType.TEL,
          required: true,
          validators: [
            Validators.required,
            Validators.pattern(/^\+?[\d\s\-\(\)]+$/),
            Validators.minLength(10),
            Validators.maxLength(20)
          ],
          placeholder: '+1-555-000-0000',
          hint: 'Include country code (e.g., +1 for US)',
          group: 'personalInfo',
          order: 4
        },
        {
          key: 'dateOfBirth',
          label: 'Date of Birth',
          type: FormFieldType.DATE,
          required: true,
          validators: [
            Validators.required,
            this.ageValidator(13, 120) // Minimum age 13, maximum 120
          ],
          placeholder: 'Select date of birth',
          hint: 'Must be at least 13 years old',
          group: 'personalInfo',
          order: 5
        }
      ]
    };
  }

  /**
   * Get address section fields
   */
  private getAddressSection(): FormSection {
    return {
      key: 'address',
      title: 'Address Information',
      description: 'Customer billing and shipping address',
      order: 2,
      fields: [
        {
          key: 'street',
          label: 'Street Address',
          type: FormFieldType.TEXT,
          required: true,
          validators: [
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(100)
          ],
          placeholder: 'Enter street address',
          hint: 'Include street number and name',
          group: 'address',
          order: 6
        },
        {
          key: 'city',
          label: 'City',
          type: FormFieldType.TEXT,
          required: true,
          validators: [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
            this.cityValidator()
          ],
          placeholder: 'Enter city name',
          group: 'address',
          order: 7
        },
        {
          key: 'state',
          label: 'State/Province',
          type: FormFieldType.SELECT,
          required: true,
          validators: [Validators.required],
          options: this.getStateOptions(),
          placeholder: 'Select state',
          group: 'address',
          order: 8
        },
        {
          key: 'postalCode',
          label: 'Postal Code',
          type: FormFieldType.TEXT,
          required: true,
          validators: [
            Validators.required,
            Validators.pattern(/^[A-Za-z0-9\s\-]{3,10}$/)
          ],
          placeholder: 'Enter postal code',
          hint: 'ZIP code or postal code',
          group: 'address',
          order: 9
        },
        {
          key: 'country',
          label: 'Country',
          type: FormFieldType.SELECT,
          required: true,
          validators: [Validators.required],
          options: this.getCountryOptions(),
          placeholder: 'Select country',
          group: 'address',
          order: 10
        },
        {
          key: 'isDefaultAddress',
          label: 'Set as default address',
          type: FormFieldType.CHECKBOX,
          required: false,
          hint: 'Use this address as the primary address',
          group: 'address',
          order: 11
        }
      ]
    };
  }

  /**
   * Get preferences section fields
   */
  private getPreferencesSection(): FormSection {
    return {
      key: 'preferences',
      title: 'Communication Preferences',
      description: 'Customer communication and notification preferences',
      order: 3,
      fields: [
        {
          key: 'communicationMethod',
          label: 'Preferred Communication Method',
          type: FormFieldType.RADIO,
          required: true,
          validators: [Validators.required],
          options: this.getCommunicationMethodOptions(),
          hint: 'How would you like us to contact you?',
          group: 'preferences',
          order: 12
        },
        {
          key: 'language',
          label: 'Preferred Language',
          type: FormFieldType.SELECT,
          required: true,
          validators: [Validators.required],
          options: this.getLanguageOptions(),
          group: 'preferences',
          order: 13
        },
        {
          key: 'currency',
          label: 'Preferred Currency',
          type: FormFieldType.SELECT,
          required: true,
          validators: [Validators.required],
          options: this.getCurrencyOptions(),
          group: 'preferences',
          order: 14
        },
        {
          key: 'timezone',
          label: 'Timezone',
          type: FormFieldType.SELECT,
          required: true,
          validators: [Validators.required],
          options: this.getTimezoneOptions(),
          group: 'preferences',
          order: 15
        },
        {
          key: 'newsletter',
          label: 'Subscribe to newsletter',
          type: FormFieldType.CHECKBOX,
          required: false,
          hint: 'Receive updates about new features and products',
          group: 'preferences',
          order: 16
        },
        {
          key: 'promotions',
          label: 'Receive promotional offers',
          type: FormFieldType.CHECKBOX,
          required: false,
          hint: 'Get notified about special deals and discounts',
          group: 'preferences',
          order: 17
        }
      ]
    };
  }

  /**
   * Create reactive form from configuration
   */
  private createFormFromConfig(config: CustomerFormConfig, initialData?: Partial<CreateCustomer>): FormGroup {
    const formControls: { [key: string]: any } = {};
    
    config.sections.forEach(section => {
      section.fields.forEach(field => {
        const defaultValue = this.getDefaultValue(field, initialData);
        const validators = field.validators || [];
        
        formControls[field.key] = [defaultValue, validators];
      });
    });

    return this.fb.group(formControls);
  }

  /**
   * Get default value for a field
   */
  private getDefaultValue(field: FormFieldConfig, initialData?: Partial<CreateCustomer>): any {
    if (initialData) {
      // Handle nested properties for address and preferences
      if (field.group === 'address' && initialData.address) {
        return (initialData.address as any)[field.key];
      }
      if (field.group === 'preferences' && initialData.preferences) {
        return (initialData.preferences as any)[field.key];
      }
      // Handle top-level properties
      return (initialData as any)[field.key];
    }

    // Default values based on field type
    switch (field.type) {
      case FormFieldType.CHECKBOX:
        return false;
      case FormFieldType.SELECT:
      case FormFieldType.RADIO:
        return field.options?.[0]?.value || null;
      default:
        return '';
    }
  }

  /**
   * Get field validation errors as human-readable messages
   */
  private getFieldErrors(control: AbstractControl): string[] {
    const errors: string[] = [];
    
    if (control.errors) {
      Object.keys(control.errors).forEach(errorKey => {
        switch (errorKey) {
          case 'required':
            errors.push('This field is required');
            break;
          case 'email':
            errors.push('Please enter a valid email address');
            break;
          case 'minlength':
            errors.push(`Minimum length is ${control.errors![errorKey].requiredLength} characters`);
            break;
          case 'maxlength':
            errors.push(`Maximum length is ${control.errors![errorKey].requiredLength} characters`);
            break;
          case 'pattern':
            errors.push('Please enter a valid format');
            break;
          case 'invalidName':
            errors.push('Name should contain only letters, spaces, hyphens, and apostrophes');
            break;
          case 'invalidAge':
            errors.push(control.errors![errorKey].message);
            break;
          case 'invalidCity':
            errors.push('City name should contain only letters, spaces, and hyphens');
            break;
          default:
            errors.push('Invalid value');
        }
      });
    }
    
    return errors;
  }

  /**
   * Custom validator for name fields (allows letters, spaces, hyphens, apostrophes)
   */
  private nameValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null;
      
      const namePattern = /^[a-zA-ZÀ-ÿ\s\-\']+$/;
      const isValid = namePattern.test(value.trim());
      
      return isValid ? null : { invalidName: true };
    };
  }

  /**
   * Custom validator for age based on date of birth
   */
  private ageValidator(minAge: number, maxAge: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null;
      
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        // Birthday hasn't occurred this year
      }
      
      if (age < minAge) {
        return { 
          invalidAge: { 
            message: `Must be at least ${minAge} years old` 
          } 
        };
      }
      
      if (age > maxAge) {
        return { 
          invalidAge: { 
            message: `Age cannot exceed ${maxAge} years` 
          } 
        };
      }
      
      return null;
    };
  }

  /**
   * Custom validator for city names
   */
  private cityValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null;
      
      const cityPattern = /^[a-zA-ZÀ-ÿ\s\-]+$/;
      const isValid = cityPattern.test(value.trim());
      
      return isValid ? null : { invalidCity: true };
    };
  }

  /**
   * Get communication method options
   */
  private getCommunicationMethodOptions(): FormFieldOption[] {
    return [
      { value: CommunicationMethod.EMAIL, label: 'Email', disabled: false },
      { value: CommunicationMethod.SMS, label: 'SMS/Text', disabled: false },
      { value: CommunicationMethod.PHONE, label: 'Phone Call', disabled: false },
      { value: CommunicationMethod.MAIL, label: 'Postal Mail', disabled: false }
    ];
  }

  /**
   * Get US state options (can be extended for international)
   */
  private getStateOptions(): FormFieldOption[] {
    return [
      { value: 'AL', label: 'Alabama', disabled: false },
      { value: 'AK', label: 'Alaska', disabled: false },
      { value: 'AZ', label: 'Arizona', disabled: false },
      { value: 'AR', label: 'Arkansas', disabled: false },
      { value: 'CA', label: 'California', disabled: false },
      { value: 'CO', label: 'Colorado', disabled: false },
      { value: 'CT', label: 'Connecticut', disabled: false },
      { value: 'DE', label: 'Delaware', disabled: false },
      { value: 'FL', label: 'Florida', disabled: false },
      { value: 'GA', label: 'Georgia', disabled: false },
      { value: 'HI', label: 'Hawaii', disabled: false },
      { value: 'ID', label: 'Idaho', disabled: false },
      { value: 'IL', label: 'Illinois', disabled: false },
      { value: 'IN', label: 'Indiana', disabled: false },
      { value: 'IA', label: 'Iowa', disabled: false },
      { value: 'KS', label: 'Kansas', disabled: false },
      { value: 'KY', label: 'Kentucky', disabled: false },
      { value: 'LA', label: 'Louisiana', disabled: false },
      { value: 'ME', label: 'Maine', disabled: false },
      { value: 'MD', label: 'Maryland', disabled: false },
      { value: 'MA', label: 'Massachusetts', disabled: false },
      { value: 'MI', label: 'Michigan', disabled: false },
      { value: 'MN', label: 'Minnesota', disabled: false },
      { value: 'MS', label: 'Mississippi', disabled: false },
      { value: 'MO', label: 'Missouri', disabled: false },
      { value: 'MT', label: 'Montana', disabled: false },
      { value: 'NE', label: 'Nebraska', disabled: false },
      { value: 'NV', label: 'Nevada', disabled: false },
      { value: 'NH', label: 'New Hampshire', disabled: false },
      { value: 'NJ', label: 'New Jersey', disabled: false },
      { value: 'NM', label: 'New Mexico', disabled: false },
      { value: 'NY', label: 'New York', disabled: false },
      { value: 'NC', label: 'North Carolina', disabled: false },
      { value: 'ND', label: 'North Dakota', disabled: false },
      { value: 'OH', label: 'Ohio', disabled: false },
      { value: 'OK', label: 'Oklahoma', disabled: false },
      { value: 'OR', label: 'Oregon', disabled: false },
      { value: 'PA', label: 'Pennsylvania', disabled: false },
      { value: 'RI', label: 'Rhode Island', disabled: false },
      { value: 'SC', label: 'South Carolina', disabled: false },
      { value: 'SD', label: 'South Dakota', disabled: false },
      { value: 'TN', label: 'Tennessee', disabled: false },
      { value: 'TX', label: 'Texas', disabled: false },
      { value: 'UT', label: 'Utah', disabled: false },
      { value: 'VT', label: 'Vermont', disabled: false },
      { value: 'VA', label: 'Virginia', disabled: false },
      { value: 'WA', label: 'Washington', disabled: false },
      { value: 'WV', label: 'West Virginia', disabled: false },
      { value: 'WI', label: 'Wisconsin', disabled: false },
      { value: 'WY', label: 'Wyoming', disabled: false }
    ];
  }

  /**
   * Get country options
   */
  private getCountryOptions(): FormFieldOption[] {
    return [
      { value: 'USA', label: 'United States' },
      { value: 'CAN', label: 'Canada' },
      { value: 'MEX', label: 'Mexico' },
      { value: 'GBR', label: 'United Kingdom' },
      { value: 'DEU', label: 'Germany' },
      { value: 'FRA', label: 'France' },
      { value: 'ESP', label: 'Spain' },
      { value: 'ITA', label: 'Italy' },
      { value: 'JPN', label: 'Japan' },
      { value: 'AUS', label: 'Australia' },
      { value: 'BRA', label: 'Brazil' },
      { value: 'CHN', label: 'China' },
      { value: 'IND', label: 'India' }
    ];
  }

  /**
   * Get language options
   */
  private getLanguageOptions(): FormFieldOption[] {
    return [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Spanish' },
      { value: 'fr', label: 'French' },
      { value: 'de', label: 'German' },
      { value: 'pt', label: 'Portuguese' },
      { value: 'it', label: 'Italian' },
      { value: 'ja', label: 'Japanese' },
      { value: 'zh', label: 'Chinese' },
      { value: 'hi', label: 'Hindi' }
    ];
  }

  /**
   * Get currency options
   */
  private getCurrencyOptions(): FormFieldOption[] {
    return [
      { value: 'USD', label: 'US Dollar (USD)' },
      { value: 'EUR', label: 'Euro (EUR)' },
      { value: 'GBP', label: 'British Pound (GBP)' },
      { value: 'CAD', label: 'Canadian Dollar (CAD)' },
      { value: 'JPY', label: 'Japanese Yen (JPY)' },
      { value: 'AUD', label: 'Australian Dollar (AUD)' },
      { value: 'CHF', label: 'Swiss Franc (CHF)' },
      { value: 'CNY', label: 'Chinese Yuan (CNY)' },
      { value: 'INR', label: 'Indian Rupee (INR)' }
    ];
  }

  /**
   * Get timezone options (major timezones)
   */
  private getTimezoneOptions(): FormFieldOption[] {
    return [
      { value: 'UTC', label: 'UTC - Coordinated Universal Time' },
      { value: 'America/New_York', label: 'EST - Eastern Time' },
      { value: 'America/Chicago', label: 'CST - Central Time' },
      { value: 'America/Denver', label: 'MST - Mountain Time' },
      { value: 'America/Los_Angeles', label: 'PST - Pacific Time' },
      { value: 'America/Phoenix', label: 'Arizona Time' },
      { value: 'Europe/London', label: 'GMT - London' },
      { value: 'Europe/Berlin', label: 'CET - Central European Time' },
      { value: 'Europe/Paris', label: 'Paris Time' },
      { value: 'Asia/Tokyo', label: 'JST - Japan Time' },
      { value: 'Asia/Shanghai', label: 'China Standard Time' },
      { value: 'Asia/Kolkata', label: 'IST - India Standard Time' },
      { value: 'Australia/Sydney', label: 'AEST - Australian Eastern Time' }
    ];
  }
}