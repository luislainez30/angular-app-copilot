import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ICustomerRepository } from '../../core/domain/repositories/customer.repository';
import { 
  Customer, 
  CreateCustomer, 
  UpdateCustomer, 
  CustomerId, 
  CustomerPageResult, 
  CustomerSearchCriteria 
} from '../../core/domain/models/customers';
import { CustomerMockService } from '../persistence/customer-mock.service';

/**
 * Implementation of customer repository using mock service
 * This can be swapped for API implementation later
 */
@Injectable({
  providedIn: 'root'
})
export class CustomerRepositoryImpl implements ICustomerRepository {
  private mockService = inject(CustomerMockService);

  getAll(criteria: CustomerSearchCriteria): Observable<CustomerPageResult> {
    // Extract pagination from criteria, provide defaults if not specified
    const page = criteria.page || 1;
    const pageSize = criteria.pageSize || 10;
    return this.mockService.getCustomers(page, pageSize, criteria);
  }

  getById(id: CustomerId): Observable<Customer | null> {
    return this.mockService.getCustomerById(id);
  }

  create(customer: CreateCustomer): Observable<Customer> {
    return this.mockService.createCustomer(customer);
  }

  update(id: CustomerId, updates: UpdateCustomer): Observable<Customer> {
    return this.mockService.updateCustomer(id, updates);
  }

  delete(id: CustomerId): Observable<boolean> {
    return this.mockService.deleteCustomer(id);
  }

  exists(id: CustomerId): Observable<boolean> {
    return this.mockService.getCustomerById(id).pipe(
      map(customer => customer !== null)
    );
  }
}