import { Customer } from './customer.interface';
import { CustomerWithComputed } from './customer-types';
import { CustomerStatus, canPerformTransactions } from './customer-status.enum';
import { isAddressComplete, formatAddress } from './address.interface';
import { CommunicationMethod } from './customer-preferences.interface';

/**
 * Customer utility functions for business logic
 */

/**
 * Calculate customer age based on date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  
  return Math.max(0, age);
}

/**
 * Calculate membership duration in days
 */
export function calculateMembershipDuration(registeredDate: Date): number {
  const today = new Date();
  const diffTime = today.getTime() - registeredDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get customer full name
 */
export function getFullName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

/**
 * Check if customer is an adult (18+ years old)
 */
export function isAdult(dateOfBirth: Date): boolean {
  return calculateAge(dateOfBirth) >= 18;
}

/**
 * Enhanced customer with computed properties
 */
export function enrichCustomer(customer: Customer): CustomerWithComputed {
  return {
    ...customer,
    fullName: getFullName(customer.firstName, customer.lastName),
    age: calculateAge(customer.dateOfBirth),
    isAdult: isAdult(customer.dateOfBirth),
    membershipDuration: calculateMembershipDuration(customer.registeredDate)
  };
}

/**
 * Validate customer data
 */
export function validateCustomer(customer: Partial<Customer>): string[] {
  const errors: string[] = [];

  if (!customer.firstName?.trim()) {
    errors.push('First name is required');
  }

  if (!customer.lastName?.trim()) {
    errors.push('Last name is required');
  }

  if (!customer.email?.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(customer.email)) {
    errors.push('Email format is invalid');
  }

  if (!customer.phone?.trim()) {
    errors.push('Phone number is required');
  }

  if (!customer.dateOfBirth) {
    errors.push('Date of birth is required');
  } else if (customer.dateOfBirth > new Date()) {
    errors.push('Date of birth cannot be in the future');
  }

  if (customer.address && !isAddressComplete(customer.address)) {
    errors.push('Complete address is required');
  }

  return errors;
}

/**
 * Simple email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Check if customer can place orders
 */
export function canPlaceOrder(customer: Customer): boolean {
  return canPerformTransactions(customer.status) && isAdult(customer.dateOfBirth);
}

/**
 * Get customer display information
 */
export function getCustomerDisplayInfo(customer: Customer): {
  displayName: string;
  contactInfo: string;
  address: string;
  memberSince: string;
} {
  return {
    displayName: getFullName(customer.firstName, customer.lastName),
    contactInfo: customer.preferences.communicationMethod === CommunicationMethod.EMAIL 
      ? customer.email 
      : customer.phone,
    address: formatAddress(customer.address),
    memberSince: customer.registeredDate.toLocaleDateString()
  };
}

/**
 * Create customer search key for filtering
 */
export function createSearchKey(customer: Customer): string {
  const fullName = getFullName(customer.firstName, customer.lastName);
  return `${fullName} ${customer.email} ${customer.phone} ${customer.address.city} ${customer.address.state}`
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Helper function to check if a customer status allows transactions
 */
export function canPerformCustomerTransactions(status: CustomerStatus): boolean {
  return status === CustomerStatus.ACTIVE;
}