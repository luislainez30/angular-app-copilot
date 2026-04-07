import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SALE_REPOSITORY_TOKEN } from '../../ports/sale-repository.token';
import { PaginatedSales, SaleSearchCriteria } from '../../../domain/models/sales/sale-types';

/**
 * Use case for retrieving a paginated, filterable list of sales.
 */
@Injectable({
  providedIn: 'root'
})
export class GetSalesUseCase {
  private repository = inject(SALE_REPOSITORY_TOKEN);

  execute(criteria: SaleSearchCriteria): Observable<PaginatedSales> {
    return this.repository.getAll(criteria);
  }
}
