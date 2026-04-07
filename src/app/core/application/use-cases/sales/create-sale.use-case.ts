import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { SALE_REPOSITORY_TOKEN } from '../../ports/sale-repository.token';
import { Sale, CreateSale } from '../../../domain/models/sales/sale.interface';
import { AlertService } from '../../services/alert.service';

/**
 * Use case for creating a new sale record.
 */
@Injectable({
  providedIn: 'root'
})
export class CreateSaleUseCase {
  private repository = inject(SALE_REPOSITORY_TOKEN);
  private alertService = inject(AlertService);

  execute(data: CreateSale): Observable<Sale> {
    return this.repository.create(data).pipe(
      tap((sale: Sale) => {
        this.alertService.showSuccess(
          'Sale Created',
          `Sale ${sale.saleNumber} has been successfully recorded.`
        );
      })
    );
  }
}
