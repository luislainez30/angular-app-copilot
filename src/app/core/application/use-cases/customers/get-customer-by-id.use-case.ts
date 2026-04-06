import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CUSTOMER_REPOSITORY_TOKEN } from '../../ports/customer-repository.port';
import { Customer, CustomerId } from '../../../domain/models/customers';

/**
 * Use case for getting a single customer by ID
 */
@Injectable({
  providedIn: 'root'
})
export class GetCustomerByIdUseCase {
  private repository = inject(CUSTOMER_REPOSITORY_TOKEN);

  execute(id: CustomerId): Observable<Customer | null> {
    return this.repository.getById(id);
  }
}