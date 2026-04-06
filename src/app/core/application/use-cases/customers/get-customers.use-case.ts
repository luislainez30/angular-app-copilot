import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CUSTOMER_REPOSITORY_TOKEN } from '../../ports/customer-repository.port';
import { Customer, CustomerPageResult, CustomerSearchCriteria } from '../../../domain/models/customers';

/**
 * Use case for getting paginated customers with search and filtering
 */
@Injectable({
  providedIn: 'root'
})
export class GetCustomersUseCase {
  private repository = inject(CUSTOMER_REPOSITORY_TOKEN);

  execute(criteria: CustomerSearchCriteria): Observable<CustomerPageResult> {
    return this.repository.getAll(criteria);
  }
}