import { Observable } from 'rxjs';
import {
  Sale,
  SaleId,
  CreateSale
} from '../models/sales/sale.interface';
import {
  SaleSearchCriteria,
  PaginatedSales
} from '../models/sales/sale-types';

/**
 * Sale repository interface — defines the data access contract.
 * Infrastructure layer will provide a concrete implementation.
 */
export interface ISaleRepository {
  /**
   * Get a paginated, filterable list of sales (summary projection).
   */
  getAll(criteria: SaleSearchCriteria): Observable<PaginatedSales>;

  /**
   * Get full sale detail by ID.
   */
  getById(id: SaleId): Observable<Sale | null>;

  /**
   * Create a new sale record.
   */
  create(data: CreateSale): Observable<Sale>;

  /**
   * Cancel an existing sale (sets status to CANCELLED).
   */
  cancel(id: SaleId): Observable<Sale>;

  /**
   * Check whether a sale with the given ID exists.
   */
  exists(id: SaleId): Observable<boolean>;
}
