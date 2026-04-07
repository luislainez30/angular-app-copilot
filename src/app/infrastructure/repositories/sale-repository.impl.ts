import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ISaleRepository } from '../../core/domain/repositories/sale.repository';
import { Sale, SaleId, CreateSale } from '../../core/domain/models/sales/sale.interface';
import { SaleSearchCriteria, PaginatedSales } from '../../core/domain/models/sales/sale-types';
import { SaleMockService } from '../persistence/sale-mock.service';

/**
 * Concrete sale repository backed by the mock service.
 * Swap SaleMockService for a real HTTP service when the API is ready.
 */
@Injectable({
  providedIn: 'root'
})
export class SaleRepositoryImpl implements ISaleRepository {
  private mockService = inject(SaleMockService);

  getAll(criteria: SaleSearchCriteria): Observable<PaginatedSales> {
    const page = criteria.page ?? 1;
    const pageSize = criteria.pageSize ?? 10;
    return this.mockService.getSales(page, pageSize, criteria);
  }

  getById(id: SaleId): Observable<Sale | null> {
    return this.mockService.getSaleById(id);
  }

  create(data: CreateSale): Observable<Sale> {
    return this.mockService.createSale(data);
  }

  cancel(id: SaleId): Observable<Sale> {
    return this.mockService.cancelSale(id);
  }

  exists(id: SaleId): Observable<boolean> {
    return this.mockService.getSaleById(id).pipe(
      map(sale => sale !== null)
    );
  }
}
