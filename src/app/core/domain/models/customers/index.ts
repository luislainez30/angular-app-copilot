// Customer core models
export * from './customer.interface';
export * from './customer-status.enum';
export * from './address.interface';
export * from './customer-preferences.interface';
export * from './customer-types';
export * from './customer.utils';

// Re-export key types for convenience
export type {
  Customer,
  CreateCustomer,
  UpdateCustomer,
  CustomerSummary
} from './customer.interface';

export type {
  Address
} from './address.interface';

export type {
  CustomerPreferences
} from './customer-preferences.interface';

export {
  CustomerStatus
} from './customer-status.enum';

export {
  CommunicationMethod,
  DEFAULT_CUSTOMER_PREFERENCES
} from './customer-preferences.interface';

export type {
  CustomerId,
  CustomerWithComputed,
  CustomerSearchCriteria,
  CustomerPageResult,
  CustomerValidationErrors,
  CustomerActivity
} from './customer-types';