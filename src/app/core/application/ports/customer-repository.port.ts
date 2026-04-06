import { InjectionToken } from '@angular/core';
import { ICustomerRepository } from '../../domain/repositories/customer.repository';

/**
 * Injection token for customer repository
 * Use this token to inject ICustomerRepository implementations
 */
export const CUSTOMER_REPOSITORY_TOKEN = new InjectionToken<ICustomerRepository>('CustomerRepository');