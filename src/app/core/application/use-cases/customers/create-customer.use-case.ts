import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { CUSTOMER_REPOSITORY_TOKEN } from '../../ports/customer-repository.port';
import { Customer, CreateCustomer } from '../../../domain/models/customers';
import { AlertService } from '../../services/alert.service';

/**
 * Use case for creating new customer
 */
@Injectable({
  providedIn: 'root'
})
export class CreateCustomerUseCase {
  private repository = inject(CUSTOMER_REPOSITORY_TOKEN);
  private alertService = inject(AlertService);

  execute(customerData: CreateCustomer): Observable<Customer> {
    return this.repository.create(customerData).pipe(
      tap((customer: Customer) => {
        this.alertService.showSuccess(
          'Customer Created',
          `${customer.firstName} ${customer.lastName} has been successfully added.`
        );
      })
    );
  }
}