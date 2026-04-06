import { Observable } from 'rxjs';
import { 
  Customer, 
  CreateCustomer, 
  UpdateCustomer, 
  CustomerId, 
  CustomerPageResult, 
  CustomerSearchCriteria 
} from '../models/customers';

/**
 * Customer repository interface - defines data access contract
 * Infrastructure layer will implement this interface
 */
export interface ICustomerRepository {
  /**
   * Get paginated customers with search and filtering
   */
  getAll(criteria: CustomerSearchCriteria): Observable<CustomerPageResult>;

  /**
   * Get customer by ID
   */
  getById(id: CustomerId): Observable<Customer | null>;

  /**
   * Create new customer
   */
  create(customer: CreateCustomer): Observable<Customer>;

  /**
   * Update existing customer
   */
  update(id: CustomerId, updates: UpdateCustomer): Observable<Customer>;

  /**
   * Delete customer
   */
  delete(id: CustomerId): Observable<boolean>;

  /**
   * Check if customer exists
   */
  exists(id: CustomerId): Observable<boolean>;
}