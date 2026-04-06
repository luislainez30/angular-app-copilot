import { Address } from './address.interface';
import { CustomerPreferences } from './customer-preferences.interface';
import { CustomerStatus } from './customer-status.enum';

/**
 * Customer domain model representing a business customer entity
 */
export interface Customer {
  readonly id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  registeredDate: Date;
  status: CustomerStatus;
  address: Address;
  preferences: CustomerPreferences;
}

/**
 * Customer creation payload (excludes generated fields)
 */
export interface CreateCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  address: Address;
  preferences?: CustomerPreferences;
}

/**
 * Customer update payload (all fields optional except id)
 */
export interface UpdateCustomer {
  readonly id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  status?: CustomerStatus;
  address?: Address;
  preferences?: CustomerPreferences;
}

/**
 * Basic customer information for display purposes
 */
export interface CustomerSummary {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly status: CustomerStatus;
  readonly registeredDate: Date;
}