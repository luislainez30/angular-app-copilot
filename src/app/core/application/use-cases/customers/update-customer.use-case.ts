import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { CUSTOMER_REPOSITORY_TOKEN } from '../../ports/customer-repository.port';
import { Customer, UpdateCustomer, CustomerId } from '../../../domain/models/customers';
import { AlertService } from '../../services/alert.service';

/**
 * Use case for updating existing customer
 */
@Injectable({
  providedIn: 'root'
})
export class UpdateCustomerUseCase {
  private repository = inject(CUSTOMER_REPOSITORY_TOKEN);
  private alertService = inject(AlertService);

  execute(id: CustomerId, updates: UpdateCustomer): Observable<Customer> {
    return this.repository.update(id, updates).pipe(
      tap((customer: Customer) => {
        this.alertService.showSuccess(
          'Customer Updated',
          `${customer.firstName} ${customer.lastName} has been successfully updated.`
        );
      })
    );
  }
}