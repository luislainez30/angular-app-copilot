import { InjectionToken } from '@angular/core';
import { ICategoryRepository } from '../../domain/repositories/category.repository';

/**
 * Injection token for category repository
 * This allows dependency injection of the category repository implementation
 */
export const CATEGORY_REPOSITORY_TOKEN = new InjectionToken<ICategoryRepository>('CategoryRepository');