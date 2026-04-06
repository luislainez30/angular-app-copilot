import { Category } from './category.interface';
import { CategoryValidationErrors, CategoryWithComputed } from './category-types';

/**
 * Generate URL-friendly slug from category name
 */
export function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Calculate category level in hierarchy
 */
export function calculateCategoryLevel(category: Category, allCategories: Category[]): number {
  let level = 0;
  let currentCategory = category;
  
  while (currentCategory.parentCategoryId) {
    const parentCategory = allCategories.find(c => c.id === currentCategory.parentCategoryId);
    if (!parentCategory) break; // Prevent infinite loop if parent not found
    currentCategory = parentCategory;
    level++;
    if (level > 10) break; // Safety limit to prevent infinite loops
  }
  
  return level;
}

/**
 * Get full category path (breadcrumb)
 */
export function getCategoryPath(category: Category, allCategories: Category[]): string {
  const path: string[] = [];
  let currentCategory = category;
  
  // Build path in reverse order
  path.unshift(currentCategory.name);
  
  while (currentCategory.parentCategoryId) {
    const parentCategory = allCategories.find(c => c.id === currentCategory.parentCategoryId);
    if (!parentCategory) break;
    path.unshift(parentCategory.name);
    currentCategory = parentCategory;
    if (path.length > 10) break; // Safety limit
  }
  
  return path.join(' > ');
}

/**
 * Check if category has children
 */
export function categoryHasChildren(categoryId: string, allCategories: Category[]): boolean {
  return allCategories.some(c => c.parentCategoryId === categoryId);
}

/**
 * Get all subcategories (direct children only)
 */
export function getCategoryChildren(categoryId: string, allCategories: Category[]): Category[] {
  return allCategories.filter(c => c.parentCategoryId === categoryId);
}

/**
 * Get all descendants of a category (recursive)
 */
export function getCategoryDescendants(categoryId: string, allCategories: Category[]): Category[] {
  const descendants: Category[] = [];
  const directChildren = getCategoryChildren(categoryId, allCategories);
  
  for (const child of directChildren) {
    descendants.push(child);
    descendants.push(...getCategoryDescendants(child.id, allCategories));
  }
  
  return descendants;
}

/**
 * Get root categories (no parent)
 */
export function getRootCategories(allCategories: Category[]): Category[] {
  return allCategories.filter(c => !c.parentCategoryId);
}

/**
 * Build hierarchical category tree
 */
export interface CategoryTree extends Category {
  children: CategoryTree[];
  level: number;
}

export function buildCategoryTree(allCategories: Category[]): CategoryTree[] {
  const categoryMap = new Map<string, CategoryTree>();
  
  // Create map with all categories
  allCategories.forEach(category => {
    categoryMap.set(category.id, {
      ...category,
      children: [],
      level: 0
    });
  });
  
  const rootCategories: CategoryTree[] = [];
  
  // Build tree structure and calculate levels
  allCategories.forEach(category => {
    const treeNode = categoryMap.get(category.id)!;
    
    if (category.parentCategoryId) {
      const parent = categoryMap.get(category.parentCategoryId);
      if (parent) {
        parent.children.push(treeNode);
        treeNode.level = parent.level + 1;
      }
    } else {
      rootCategories.push(treeNode);
    }
  });
  
  return rootCategories;
}

/**
 * Flatten category tree to array with indentation
 */
export interface FlattenedCategory extends Category {
  level: number;
  indentedName: string;
}

export function flattenCategoryTree(tree: CategoryTree[]): FlattenedCategory[] {
  const flattened: FlattenedCategory[] = [];
  
  function flatten(nodes: CategoryTree[]) {
    nodes.forEach(node => {
      flattened.push({
        ...node,
        indentedName: '  '.repeat(node.level) + node.name
      });
      if (node.children.length > 0) {
        flatten(node.children);
      }
    });
  }
  
  flatten(tree);
  return flattened;
}

/**
 * Enrich category with computed properties
 */
export function enrichCategory(
  category: Category,
  allCategories: Category[],
  productCount: number = 0
): CategoryWithComputed {
  return {
    ...category,
    fullPath: getCategoryPath(category, allCategories),
    level: calculateCategoryLevel(category, allCategories),
    hasChildren: categoryHasChildren(category.id, allCategories),
    productCount
  };
}

/**
 * Basic category validation
 */
export function validateCategory(category: Partial<Category>): CategoryValidationErrors {
  const errors: CategoryValidationErrors = {};

  // Name validation
  if (!category.name || category.name.trim().length === 0) {
    errors.name = ['Category name is required'];
  } else if (category.name.trim().length < 2) {
    errors.name = ['Category name must be at least 2 characters'];
  } else if (category.name.trim().length > 100) {
    errors.name = ['Category name cannot exceed 100 characters'];
  }

  // Slug validation
  if (!category.slug || category.slug.trim().length === 0) {
    errors.slug = ['Slug is required'];
  } else if (!/^[a-z0-9\-]+$/.test(category.slug)) {
    errors.slug = ['Slug can only contain lowercase letters, numbers, and hyphens'];
  }

  // Sort order validation
  if (category.sortOrder !== undefined && category.sortOrder < 0) {
    errors.sortOrder = ['Sort order cannot be negative'];
  }

  return errors;
}

/**
 * Create search key for category (for client-side search)
 */
export function createCategorySearchKey(category: Category): string {
  return [
    category.name,
    category.description || '',
    category.slug
  ].filter(Boolean).join(' ').toLowerCase();
}