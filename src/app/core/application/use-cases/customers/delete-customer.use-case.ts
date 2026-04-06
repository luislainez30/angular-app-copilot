import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { CUSTOMER_REPOSITORY_TOKEN } from '../../ports/customer-repository.port';
import { CustomerId } from '../../../domain/models/customers';
import { AlertService } from '../../services/alert.service';

/**
 * Use case for deleting a customer
 */
@Injectable({
  providedIn: 'root'
})
export class DeleteCustomerUseCase {
  private repository = inject(CUSTOMER_REPOSITORY_TOKEN);
  private alertService = inject(AlertService);

  execute(id: CustomerId): Observable<boolean> {
    return this.repository.delete(id).pipe(
      tap((success: boolean) => {
        if (success) {
          this.alertService.showSuccess(
            'Customer Deleted',
            'Customer has been successfully removed.'
          );
        } else {
          this.alertService.showError(
            'Delete Failed',
            'Customer could not be deleted.'
          );
        }
      })
    );
  }
}