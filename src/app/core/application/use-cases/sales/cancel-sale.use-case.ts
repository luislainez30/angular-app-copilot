import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { SALE_REPOSITORY_TOKEN } from '../../ports/sale-repository.token';
import { Sale, SaleId } from '../../../domain/models/sales/sale.interface';
import { AlertService } from '../../services/alert.service';

/**
 * Use case for cancelling an existing sale.
 */
@Injectable({
  providedIn: 'root'
})
export class CancelSaleUseCase {
  private repository = inject(SALE_REPOSITORY_TOKEN);
  private alertService = inject(AlertService);

  execute(id: SaleId): Observable<Sale> {
    return this.repository.cancel(id).pipe(
      tap((sale: Sale) => {
        this.alertService.showSuccess(
          'Sale Cancelled',
          `Sale ${sale.saleNumber} has been cancelled.`
        );
      })
    );
  }
}
