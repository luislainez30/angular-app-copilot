import {
  Injectable
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
  ValidatorFn
} from '@angular/forms';
import { CreateSale, CreateSaleItem } from '../../../../core/domain/models/sales/sale.interface';
import {
  SaleStatus,
  PaymentStatus,
  PaymentMethod,
  DiscountType
} from '../../../../core/domain/models/sales/sale-status.enum';

// ─── Shared field config types (mirroring existing form builders) ─────────────

export interface SaleFormFieldConfig {
  key: string;
  label: string;
  type: SaleFormFieldType;
  required: boolean;
  validators?: ValidatorFn[];
  options?: SaleFormFieldOption[];
  placeholder?: string;
  hint?: string;
  group?: string;
  order: number;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface SaleFormFieldOption {
  value: any;
  label: string;
  disabled?: boolean;
}

export enum SaleFormFieldType {
  TEXT     = 'text',
  NUMBER   = 'number',
  SELECT   = 'select',
  RADIO    = 'radio',
  CHECKBOX = 'checkbox',
  TEXTAREA = 'textarea',
  DATE     = 'date'
}

export interface SaleFormSection {
  key: string;
  title: string;
  description?: string;
  fields: SaleFormFieldConfig[];
  order: number;
}

export interface SaleFormConfig {
  sections: SaleFormSection[];
  submitLabel: string;
  cancelLabel: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Service responsible for building and managing sale/bill creation forms.
 * Handles a header FormGroup (customer, payment, dates, notes)
 * plus a FormArray of line-item sub-groups.
 *
 * Located in presentation layer following the same pattern as
 * CustomerFormBuilderService and ProductFormBuilderService.
 */
@Injectable({
  providedIn: 'root'
})
export class SaleFormBuilderService {

  constructor(private fb: FormBuilder) {}

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Build the complete sale form.
   * `items` is a FormArray; at least one empty item is added by default.
   */
  buildSaleForm(initialData?: Partial<CreateSale>): FormGroup {
    const items: FormArray = this.fb.array(
      initialData?.items?.length
        ? initialData.items.map(i => this.buildSaleItemGroup(i))
        : [this.buildSaleItemGroup()]
    );

    return this.fb.group(
      {
        customerId:        [initialData?.customerId        || '',  [Validators.required]],
        paymentMethod:     [initialData?.paymentMethod     || '',  []],
        dueDate:           [initialData?.dueDate ? this.toDateString(initialData.dueDate) : '', [this.dueDateValidator()]],
        shippingCost:      [initialData?.shippingCost      ?? 0,   [Validators.min(0), Validators.max(99999.99)]],
        notes:             [initialData?.notes             || '',  [Validators.maxLength(500)]],
        internalNotes:     [initialData?.internalNotes     || '',  [Validators.maxLength(500)]],
        externalReference: [initialData?.externalReference || '',  [Validators.maxLength(100), this.referenceFormatValidator()]],
        items
      }
    );
  }

  /**
   * Build a single sale line-item FormGroup.
   * Used both by buildSaleForm and by addItem().
   */
  buildSaleItemGroup(initial?: Partial<CreateSaleItem>): FormGroup {
    return this.fb.group(
      {
        productId:     [initial?.productId     || '',                 [Validators.required]],
        unitPrice:     [initial?.unitPrice     ?? '',                 [Validators.required, Validators.min(0.01), Validators.max(999999.99)]],
        quantity:      [initial?.quantity      ?? 1,                  [Validators.required, Validators.min(1),    Validators.max(9999)]],
        discountType:  [initial?.discountType  || DiscountType.NONE,  []],
        discountValue: [initial?.discountValue ?? 0,                  [Validators.min(0), this.discountValueValidator()]],
        taxRate:       [initial?.taxRate       ?? 0,                  [Validators.min(0), Validators.max(100)]],
        notes:         [initial?.notes         || '',                 [Validators.maxLength(200)]]
      }
    );
  }

  /** Append a blank item row to the items FormArray. */
  addItem(itemsArray: FormArray): void {
    itemsArray.push(this.buildSaleItemGroup());
  }

  /** Remove an item row by index. At least one item must remain. */
  removeItem(itemsArray: FormArray, index: number): void {
    if (itemsArray.length > 1) {
      itemsArray.removeAt(index);
    }
  }

  /** Convenience getter: extracts items FormArray from the sale form. */
  getItemsArray(form: FormGroup): FormArray {
    return form.get('items') as FormArray;
  }

  /** Return header-section configuration (no items). */
  getHeaderConfiguration(): SaleFormConfig {
    return {
      sections: [
        this.getCustomerSection(),
        this.getPaymentSection(),
        this.getAdditionalSection()
      ],
      submitLabel: 'Create Sale',
      cancelLabel: 'Cancel'
    };
  }

  /** Return item-row field configuration. */
  getItemFieldConfiguration(): SaleFormFieldConfig[] {
    return this.getItemFields();
  }

  /**
   * Validate the entire form (header + all item rows) and return
   * a flat map of { fieldKey: errorMessages[] }.
   * Item errors are keyed as `items[n].fieldKey`.
   */
  validateForm(form: FormGroup): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    // Header controls
    Object.keys(form.controls).forEach(key => {
      if (key === 'items') return;
      const control = form.get(key);
      if (control?.errors) {
        errors[key] = this.getFieldErrors(control);
      }
    });

    // Item rows
    const items = this.getItemsArray(form);
    items.controls.forEach((row, index) => {
      const rowGroup = row as FormGroup;
      Object.keys(rowGroup.controls).forEach(field => {
        const control = rowGroup.get(field);
        if (control?.errors) {
          errors[`items[${index}].${field}`] = this.getFieldErrors(control);
        }
      });
    });

    return errors;
  }

  /**
   * Map form value to CreateSale DTO, ready to pass to CreateSaleUseCase.
   */
  transformFormToCreateSale(formValue: any): CreateSale {
    const items: CreateSaleItem[] = (formValue.items ?? []).map((item: any) => ({
      productId:     item.productId,
      quantity:      parseInt(item.quantity, 10),
      unitPrice:     parseFloat(item.unitPrice),
      discountType:  item.discountType  || DiscountType.NONE,
      discountValue: parseFloat(item.discountValue) || 0,
      taxRate:       parseFloat(item.taxRate)       || 0,
      notes:         item.notes?.trim() || undefined
    }));

    return {
      customerId:        formValue.customerId,
      items,
      paymentMethod:     formValue.paymentMethod     || undefined,
      dueDate:           formValue.dueDate ? new Date(formValue.dueDate) : undefined,
      shippingCost:      parseFloat(formValue.shippingCost) || 0,
      notes:             formValue.notes?.trim()             || undefined,
      internalNotes:     formValue.internalNotes?.trim()     || undefined,
      externalReference: formValue.externalReference?.trim() || undefined
    };
  }

  // ── Static option lists ────────────────────────────────────────────────────

  getPaymentMethodOptions(): SaleFormFieldOption[] {
    return [
      { value: '',                          label: '— Select method —',  disabled: true },
      { value: PaymentMethod.CASH,          label: 'Cash'                },
      { value: PaymentMethod.CREDIT_CARD,   label: 'Credit Card'         },
      { value: PaymentMethod.DEBIT_CARD,    label: 'Debit Card'          },
      { value: PaymentMethod.BANK_TRANSFER, label: 'Bank Transfer'       },
      { value: PaymentMethod.CHECK,         label: 'Check'               },
      { value: PaymentMethod.DIGITAL_WALLET,label: 'Digital Wallet'      },
      { value: PaymentMethod.OTHER,         label: 'Other'               }
    ];
  }

  getDiscountTypeOptions(): SaleFormFieldOption[] {
    return [
      { value: DiscountType.NONE,       label: 'No Discount' },
      { value: DiscountType.PERCENTAGE, label: 'Percentage (%)' },
      { value: DiscountType.FIXED,      label: 'Fixed Amount ($)' }
    ];
  }

  // ── Private: section builders ──────────────────────────────────────────────

  private getCustomerSection(): SaleFormSection {
    return {
      key: 'customer',
      title: 'Customer',
      description: 'Select the customer for this sale',
      order: 1,
      fields: [
        {
          key: 'customerId',
          label: 'Customer',
          type: SaleFormFieldType.SELECT,
          required: true,
          validators: [Validators.required],
          options: [],  // Populated dynamically from CustomerMockService
          placeholder: 'Select customer',
          hint: 'Choose the customer purchasing this order',
          group: 'customer',
          order: 1
        }
      ]
    };
  }

  private getPaymentSection(): SaleFormSection {
    return {
      key: 'payment',
      title: 'Payment Details',
      description: 'Payment method, due date and shipping cost',
      order: 2,
      fields: [
        {
          key: 'paymentMethod',
          label: 'Payment Method',
          type: SaleFormFieldType.SELECT,
          required: false,
          options: this.getPaymentMethodOptions(),
          placeholder: '— Select method —',
          hint: 'Leave blank if not yet determined',
          group: 'payment',
          order: 2
        },
        {
          key: 'dueDate',
          label: 'Payment Due Date',
          type: SaleFormFieldType.DATE,
          required: false,
          validators: [this.dueDateValidator()],
          placeholder: 'Select due date',
          hint: 'Applicable for invoiced / credit sales',
          group: 'payment',
          order: 3
        },
        {
          key: 'shippingCost',
          label: 'Shipping Cost',
          type: SaleFormFieldType.NUMBER,
          required: false,
          validators: [Validators.min(0), Validators.max(99999.99)],
          placeholder: '0.00',
          hint: 'Enter 0 if no shipping charge',
          suffix: '$',
          min: 0,
          max: 99999.99,
          step: 0.01,
          group: 'payment',
          order: 4
        }
      ]
    };
  }

  private getAdditionalSection(): SaleFormSection {
    return {
      key: 'additional',
      title: 'Additional Information',
      description: 'Notes and external references',
      order: 3,
      fields: [
        {
          key: 'notes',
          label: 'Customer Notes',
          type: SaleFormFieldType.TEXTAREA,
          required: false,
          validators: [Validators.maxLength(500)],
          placeholder: 'Notes visible to the customer (e.g. on the invoice)',
          hint: 'Maximum 500 characters',
          group: 'additional',
          order: 5
        },
        {
          key: 'internalNotes',
          label: 'Internal Notes',
          type: SaleFormFieldType.TEXTAREA,
          required: false,
          validators: [Validators.maxLength(500)],
          placeholder: 'Private internal notes — not printed on invoice',
          hint: 'Maximum 500 characters',
          group: 'additional',
          order: 6
        },
        {
          key: 'externalReference',
          label: 'External Reference',
          type: SaleFormFieldType.TEXT,
          required: false,
          validators: [Validators.maxLength(100), this.referenceFormatValidator()],
          placeholder: 'e.g. PO-2026-001',
          hint: 'Purchase order number or external system reference (letters, numbers, hyphens)',
          group: 'additional',
          order: 7
        }
      ]
    };
  }

  private getItemFields(): SaleFormFieldConfig[] {
    return [
      {
        key: 'productId',
        label: 'Product',
        type: SaleFormFieldType.SELECT,
        required: true,
        validators: [Validators.required],
        options: [],  // Populated dynamically from ProductMockService
        placeholder: 'Select product',
        hint: 'Choose a product from the catalog',
        group: 'item',
        order: 1
      },
      {
        key: 'quantity',
        label: 'Quantity',
        type: SaleFormFieldType.NUMBER,
        required: true,
        validators: [Validators.required, Validators.min(1), Validators.max(9999)],
        placeholder: '1',
        hint: 'Minimum 1 unit',
        min: 1,
        max: 9999,
        step: 1,
        group: 'item',
        order: 2
      },
      {
        key: 'unitPrice',
        label: 'Unit Price',
        type: SaleFormFieldType.NUMBER,
        required: true,
        validators: [Validators.required, Validators.min(0.01), Validators.max(999999.99)],
        placeholder: '0.00',
        hint: 'Price per unit in USD',
        suffix: '$',
        min: 0.01,
        max: 999999.99,
        step: 0.01,
        group: 'item',
        order: 3
      },
      {
        key: 'discountType',
        label: 'Discount Type',
        type: SaleFormFieldType.SELECT,
        required: false,
        options: this.getDiscountTypeOptions(),
        hint: 'Type of discount to apply to this line',
        group: 'item',
        order: 4
      },
      {
        key: 'discountValue',
        label: 'Discount Value',
        type: SaleFormFieldType.NUMBER,
        required: false,
        validators: [Validators.min(0), this.discountValueValidator()],
        placeholder: '0',
        hint: 'Percentage (0–100) or fixed amount',
        min: 0,
        step: 0.01,
        group: 'item',
        order: 5
      },
      {
        key: 'taxRate',
        label: 'Tax Rate (%)',
        type: SaleFormFieldType.NUMBER,
        required: false,
        validators: [Validators.min(0), Validators.max(100)],
        placeholder: '0',
        hint: 'Tax percentage applied after discount (e.g. 13)',
        suffix: '%',
        min: 0,
        max: 100,
        step: 0.1,
        group: 'item',
        order: 6
      },
      {
        key: 'notes',
        label: 'Line Notes',
        type: SaleFormFieldType.TEXT,
        required: false,
        validators: [Validators.maxLength(200)],
        placeholder: 'Optional note for this line item',
        hint: 'Maximum 200 characters',
        group: 'item',
        order: 7
      }
    ];
  }

  // ── Private: validators ────────────────────────────────────────────────────

  /**
   * Due date must be today or in the future.
   */
  private dueDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null;

      const selected = new Date(value);
      const today    = new Date();
      today.setHours(0, 0, 0, 0);

      return selected < today ? { pastDueDate: { message: 'Due date cannot be in the past' } } : null;
    };
  }

  /**
   * Discount value validation:
   * - If discountType is PERCENTAGE, value must be between 0 and 100.
   * - If discountType is FIXED, value must be ≥ 0.
   * - If discountType is NONE, value is ignored.
   */
  private discountValueValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.parent) return null;

      const discountType  = control.parent.get('discountType')?.value;
      const discountValue = parseFloat(control.value);

      if (discountType === DiscountType.PERCENTAGE) {
        if (discountValue < 0 || discountValue > 100) {
          return { invalidDiscount: { message: 'Percentage discount must be between 0 and 100' } };
        }
      }

      if (discountType === DiscountType.FIXED && discountValue < 0) {
        return { invalidDiscount: { message: 'Fixed discount cannot be negative' } };
      }

      return null;
    };
  }

  /**
   * External reference may only contain letters, digits, hyphens and underscores.
   */
  private referenceFormatValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null;

      const pattern = /^[A-Za-z0-9\-_]+$/;
      return pattern.test(value.trim())
        ? null
        : { invalidReference: { message: 'Only letters, numbers, hyphens, and underscores are allowed' } };
    };
  }

  // ── Private: error messages ────────────────────────────────────────────────

  private getFieldErrors(control: AbstractControl): string[] {
    const errors: string[] = [];

    if (!control.errors) return errors;

    Object.keys(control.errors).forEach(errorKey => {
      switch (errorKey) {
        case 'required':
          errors.push('This field is required');
          break;
        case 'min':
          errors.push(`Minimum value is ${control.errors![errorKey].min}`);
          break;
        case 'max':
          errors.push(`Maximum value is ${control.errors![errorKey].max}`);
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
        case 'pastDueDate':
          errors.push(control.errors![errorKey].message);
          break;
        case 'invalidDiscount':
          errors.push(control.errors![errorKey].message);
          break;
        case 'invalidReference':
          errors.push(control.errors![errorKey].message);
          break;
        default:
          errors.push('Invalid value');
      }
    });

    return errors;
  }

  // ── Private: helpers ───────────────────────────────────────────────────────

  private toDateString(date: Date): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    return date.toISOString().substring(0, 10); // yyyy-MM-dd for <input type="date">
  }
}
