import { Customer, CreateCustomer, UpdateCustomer } from './customer.interface';
import { CustomerStatus } from './customer-status.enum';

/**
 * Utility types for customer operations
 */

/**
 * Customer ID type for type safety
 */
export type CustomerId = string;

/**
 * Customer with computed properties
 */
export interface CustomerWithComputed extends Customer {
  readonly fullName: string;
  readonly age: number;
  readonly isAdult: boolean;
  readonly membershipDuration: number; // in days
}

/**
 * Customer search criteria
 */
export interface CustomerSearchCriteria {
  query?: string;
  status?: CustomerStatus[];
  registeredAfter?: Date;
  registeredBefore?: Date;
  ageMin?: number;
  ageMax?: number;
  city?: string;
  state?: string;
  country?: string;
  sortBy?: CustomerSortField;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/**
 * Customer sort fields
 */
export enum CustomerSortField {
  ID = 'id',
  FIRST_NAME = 'firstName',
  LAST_NAME = 'lastName',
  EMAIL = 'email',
  PHONE = 'phone',
  REGISTERED_DATE = 'registeredDate',
  DATE_OF_BIRTH = 'dateOfBirth',
  STATUS = 'status',
  CITY = 'city',
  STATE = 'state'
}

/**
 * Customer pagination result
 */
export interface CustomerPageResult {
  customers: Customer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Customer validation errors
 */
export interface CustomerValidationErrors {
  firstName?: string[];
  lastName?: string[];
  email?: string[];
  phone?: string[];
  dateOfBirth?: string[];
  address?: string[];
}

/**
 * Customer activity summary
 */
export interface CustomerActivity {
  customerId: CustomerId;
  lastLoginDate?: Date;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
}