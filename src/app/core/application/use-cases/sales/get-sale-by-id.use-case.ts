import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SALE_REPOSITORY_TOKEN } from '../../ports/sale-repository.token';
import { Sale, SaleId } from '../../../domain/models/sales/sale.interface';

/**
 * Use case for retrieving full sale detail by ID.
 */
@Injectable({
  providedIn: 'root'
})
export class GetSaleByIdUseCase {
  private repository = inject(SALE_REPOSITORY_TOKEN);

  execute(id: SaleId): Observable<Sale | null> {
    return this.repository.getById(id);
  }
}
