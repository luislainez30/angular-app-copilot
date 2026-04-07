import { InjectionToken } from '@angular/core';
import { ISaleRepository } from '../../domain/repositories/sale.repository';

/**
 * Injection token for sale repository.
 * Bind this token to a concrete implementation inside appConfig providers.
 */
export const SALE_REPOSITORY_TOKEN = new InjectionToken<ISaleRepository>('SaleRepository');
