import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  Product,
  CreateProduct,
  UpdateProduct,
  ProductSummary
} from '../../core/domain/models/products/product.interface';
import {
  ProductId,
  ProductSearchCriteria,
  ProductPageResult,
  ProductSortField,
  ProductDimensions
} from '../../core/domain/models/products/product-types';
import { CategoryId } from '../../core/domain/models/products/category-types';
import { ProductStatus } from '../../core/domain/models/products/product-status.enum';
import { InventoryTrackingMethod } from '../../core/domain/models/inventory/inventory.interface';
import { DEFAULT_PRODUCT_VALUES } from '../../core/domain/models/products/product.constants';

/**
 * Mock service for product data persistence
 * Simulates API responses with realistic e-commerce product data
 */
@Injectable({
  providedIn: 'root'
})
export class ProductMockService {
  private products: Product[] = [
    {
      id: '1' as ProductId,
      name: 'iPhone 15 Pro',
      description: 'The latest iPhone with advanced Pro camera system, A17 Pro chip, and USB-C connector. Features a titanium design and Action Button for customizable shortcuts.',
      shortDescription: 'Latest iPhone with A17 Pro chip and titanium design',
      sku: 'APPLE-IP15P-128-NTC',
      barcode: '194253406952',
      categoryId: '1' as CategoryId,
      brand: 'Apple',
      manufacturer: 'Apple Inc.',
      price: 999.99,
      costPrice: 650.00,
      compareAtPrice: 1099.99,
      weight: 187,
      dimensions: {
        length: 14.67,
        width: 7.06,
        height: 0.83,
        unit: 'cm'
      },
      trackInventory: InventoryTrackingMethod.DETAILED,
      allowBackorder: false,
      requiresShipping: true,
      images: [
        'https://example.com/iphone15pro-1.jpg',
        'https://example.com/iphone15pro-2.jpg',
        'https://example.com/iphone15pro-3.jpg'
      ],
      thumbnailUrl: 'https://example.com/iphone15pro-thumb.jpg',
      metaTitle: 'iPhone 15 Pro | Latest Apple Smartphone',
      metaDescription: 'Experience the iPhone 15 Pro with titanium design, A17 Pro chip, and advanced camera system.',
      tags: ['smartphone', 'apple', 'iphone', 'premium', 'titanium', '5g'],
      status: ProductStatus.ACTIVE,
      isVisible: true,
      isFeatured: true,
      createdAt: new Date('2023-09-15'),
      updatedAt: new Date('2023-11-20'),
      publishedAt: new Date('2023-09-22'),
      notes: 'High-demand product, monitor stock levels closely'
    },
    {
      id: '2' as ProductId,
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Premium flagship smartphone with S Pen, incredible camera capabilities, and AI-powered features. Features a 6.8" Dynamic AMOLED display and versatile camera system.',
      shortDescription: 'Flagship Samsung with S Pen and AI features',
      sku: 'SAMS-GS24U-256-BLK',
      barcode: '887276705589',
      categoryId: '1' as CategoryId,
      brand: 'Samsung',
      manufacturer: 'Samsung Electronics',
      price: 1199.99,
      costPrice: 780.00,
      compareAtPrice: 1299.99,
      weight: 232,
      dimensions: {
        length: 16.26,
        width: 7.9,
        height: 0.86,
        unit: 'cm'
      },
      trackInventory: InventoryTrackingMethod.DETAILED,
      allowBackorder: true,
      requiresShipping: true,
      images: [
        'https://example.com/galaxy-s24u-1.jpg',
        'https://example.com/galaxy-s24u-2.jpg'
      ],
      thumbnailUrl: 'https://example.com/galaxy-s24u-thumb.jpg',
      metaTitle: 'Samsung Galaxy S24 Ultra | Premium Android Phone',
      metaDescription: 'Discover the Galaxy S24 Ultra with S Pen, advanced cameras, and AI capabilities.',
      tags: ['smartphone', 'samsung', 'android', 's-pen', 'flagship', '5g'],
      status: ProductStatus.ACTIVE,
      isVisible: true,
      isFeatured: true,
      createdAt: new Date('2024-01-17'),
      updatedAt: new Date('2024-01-20'),
      publishedAt: new Date('2024-01-24'),
      notes: 'Popular flagship model'
    },
    {
      id: '3' as ProductId,
      name: 'MacBook Pro 14" M3',
      description: 'Powerful laptop designed for professionals with the M3 chip, Liquid Retina XDR display, and up to 22 hours of battery life. Perfect for creative workflows.',
      shortDescription: 'Professional laptop with M3 chip',
      sku: 'APPLE-MBP14-M3-512-SG',
      barcode: '195949043065',
      categoryId: '2' as CategoryId,
      brand: 'Apple',
      manufacturer: 'Apple Inc.',
      price: 1999.99,
      costPrice: 1300.00,
      weight: 1600,
      dimensions: {
        length: 31.26,
        width: 22.12,
        height: 1.55,
        unit: 'cm'
      },
      trackInventory: InventoryTrackingMethod.SIMPLE,
      allowBackorder: true,
      requiresShipping: true,
      images: [
        'https://example.com/macbook-pro-14-1.jpg',
        'https://example.com/macbook-pro-14-2.jpg'
      ],
      thumbnailUrl: 'https://example.com/macbook-pro-14-thumb.jpg',
      metaTitle: 'MacBook Pro 14" M3 | Professional Laptop',
      metaDescription: 'MacBook Pro 14" with M3 chip delivers exceptional performance for professional workflows.',
      tags: ['laptop', 'apple', 'macbook', 'professional', 'm3', 'creative'],
      status: ProductStatus.ACTIVE,
      isVisible: true,
      isFeatured: false,
      createdAt: new Date('2023-10-30'),
      updatedAt: new Date('2023-11-15'),
      publishedAt: new Date('2023-11-07'),
      notes: 'Professional grade laptop'
    },
    {
      id: '4' as ProductId,
      name: 'Dell XPS 13 Plus',
      description: 'Ultra-premium laptop with stunning 13.4" InfinityEdge display, 12th Gen Intel processors, and modern design. Features a haptic touchpad and zero-lattice keyboard.',
      shortDescription: 'Premium ultrabook with modern design',
      sku: 'DELL-XPS13P-512-SLV',
      barcode: '884116365891',
      categoryId: '2' as CategoryId,
      brand: 'Dell',
      manufacturer: 'Dell Technologies',
      price: 1499.99,
      costPrice: 980.00,
      compareAtPrice: 1599.99,
      weight: 1235,
      dimensions: {
        length: 29.5,
        width: 19.9,
        height: 1.57,
        unit: 'cm'
      },
      trackInventory: InventoryTrackingMethod.SIMPLE,
      allowBackorder: false,
      requiresShipping: true,
      images: [
        'https://example.com/dell-xps13p-1.jpg',
        'https://example.com/dell-xps13p-2.jpg'
      ],
      thumbnailUrl: 'https://example.com/dell-xps13p-thumb.jpg',
      metaTitle: 'Dell XPS 13 Plus | Premium Ultrabook',
      metaDescription: 'Experience the Dell XPS 13 Plus with cutting-edge design and performance.',
      tags: ['laptop', 'dell', 'ultrabook', 'premium', 'intel', 'portable'],
      status: ProductStatus.ACTIVE,
      isVisible: true,
      isFeatured: false,
      createdAt: new Date('2023-08-15'),
      updatedAt: new Date('2023-09-10'),
      publishedAt: new Date('2023-08-22'),
      notes: 'Premium ultrabook line'
    },
    {
      id: '5' as ProductId,
      name: 'Sony WH-1000XM5',
      description: 'Industry-leading noise canceling wireless headphones with exceptional sound quality, 30-hour battery life, and crystal-clear call technology.',
      shortDescription: 'Premium noise-canceling headphones',
      sku: 'SONY-WH1000XM5-BLK',
      barcode: '4548736134065',
      categoryId: '3' as CategoryId,
      brand: 'Sony',
      manufacturer: 'Sony Corporation',
      price: 399.99,
      costPrice: 260.00,
      compareAtPrice: 449.99,
      weight: 250,
      dimensions: {
        length: 26.0,
        width: 21.5,
        height: 8.8,
        unit: 'cm'
      },
      trackInventory: InventoryTrackingMethod.SIMPLE,
      allowBackorder: true,
      requiresShipping: true,
      images: [
        'https://example.com/sony-wh1000xm5-1.jpg',
        'https://example.com/sony-wh1000xm5-2.jpg'
      ],
      thumbnailUrl: 'https://example.com/sony-wh1000xm5-thumb.jpg',
      metaTitle: 'Sony WH-1000XM5 | Premium Noise Canceling Headphones',
      metaDescription: 'Sony WH-1000XM5 headphones deliver industry-leading noise canceling and exceptional sound.',
      tags: ['headphones', 'sony', 'noise-canceling', 'wireless', 'audio', 'premium'],
      status: ProductStatus.ACTIVE,
      isVisible: true,
      isFeatured: true,
      createdAt: new Date('2023-07-20'),
      updatedAt: new Date('2023-10-05'),
      publishedAt: new Date('2023-08-01'),
      notes: 'Best-selling headphones'
    },
    {
      id: '6' as ProductId,
      name: 'iPad Air 11" M2',
      description: 'Versatile tablet powered by the M2 chip with stunning 11-inch Liquid Retina display. Perfect for creativity, productivity, and entertainment.',
      shortDescription: 'Versatile tablet with M2 chip',
      sku: 'APPLE-IPAD-AIR11-M2-64-GY',
      barcode: '194253495086',
      categoryId: '4' as CategoryId,
      brand: 'Apple',
      manufacturer: 'Apple Inc.',
      price: 599.99,
      costPrice: 390.00,
      weight: 462,
      dimensions: {
        length: 24.76,
        width: 17.85,
        height: 0.61,
        unit: 'cm'
      },
      trackInventory: InventoryTrackingMethod.SIMPLE,
      allowBackorder: false,
      requiresShipping: true,
      images: [
        'https://example.com/ipad-air-11-1.jpg',
        'https://example.com/ipad-air-11-2.jpg'
      ],
      thumbnailUrl: 'https://example.com/ipad-air-11-thumb.jpg',
      metaTitle: 'iPad Air 11" M2 | Versatile Tablet',
      metaDescription: 'iPad Air 11" with M2 chip combines power and portability for any task.',
      tags: ['tablet', 'apple', 'ipad', 'm2', 'creative', 'portable'],
      status: ProductStatus.ACTIVE,
      isVisible: true,
      isFeatured: false,
      createdAt: new Date('2024-05-07'),
      updatedAt: new Date('2024-05-15'),
      publishedAt: new Date('2024-05-15'),
      notes: 'New iPad Air model'
    },
    {
      id: '7' as ProductId,
      name: 'Gaming Wireless Mouse',
      description: 'High-precision wireless gaming mouse with customizable RGB lighting, 16000 DPI sensor, and programmable buttons. Designed for esports and competitive gaming.',
      shortDescription: 'High-precision wireless gaming mouse',
      sku: 'GAME-WM-RGB-16K-BLK',
      barcode: '123456789012',
      categoryId: '5' as CategoryId,
      brand: 'GameTech',
      manufacturer: 'GameTech Electronics',
      price: 89.99,
      costPrice: 35.00,
      compareAtPrice: 109.99,
      weight: 120,
      dimensions: {
        length: 12.8,
        width: 6.8,
        height: 4.2,
        unit: 'cm'
      },
      trackInventory: InventoryTrackingMethod.SIMPLE,
      allowBackorder: true,
      requiresShipping: true,
      images: [
        'https://example.com/gaming-mouse-1.jpg',
        'https://example.com/gaming-mouse-2.jpg'
      ],
      thumbnailUrl: 'https://example.com/gaming-mouse-thumb.jpg',
      metaTitle: 'Gaming Wireless Mouse | High-Precision',
      metaDescription: 'Professional gaming mouse with 16000 DPI and customizable RGB lighting.',
      tags: ['mouse', 'gaming', 'wireless', 'rgb', 'esports', 'precision'],
      status: ProductStatus.ACTIVE,
      isVisible: true,
      isFeatured: false,
      createdAt: new Date('2023-06-10'),
      updatedAt: new Date('2023-11-25'),
      publishedAt: new Date('2023-06-15'),
      notes: 'Popular gaming accessory'
    },
    {
      id: '8' as ProductId,
      name: 'USB-C Hub 7-in-1',
      description: 'Compact 7-in-1 USB-C hub with 4K HDMI output, USB 3.0 ports, SD card reader, and 100W power delivery. Perfect for laptops and tablets.',
      shortDescription: '7-in-1 USB-C hub with 4K HDMI',
      sku: 'TECH-USBC-HUB-7IN1-GY',
      barcode: '987654321098',
      categoryId: '5' as CategoryId,
      brand: 'TechConnect',
      manufacturer: 'TechConnect Ltd.',
      price: 49.99,
      costPrice: 22.00,
      weight: 180,
      dimensions: {
        length: 11.5,
        width: 5.2,
        height: 1.8,
        unit: 'cm'
      },
      trackInventory: InventoryTrackingMethod.SIMPLE,
      allowBackorder: true,
      requiresShipping: true,
      images: [
        'https://example.com/usbc-hub-1.jpg',
        'https://example.com/usbc-hub-2.jpg'
      ],
      thumbnailUrl: 'https://example.com/usbc-hub-thumb.jpg',
      metaTitle: 'USB-C Hub 7-in-1 | Compact Connectivity',
      metaDescription: '7-in-1 USB-C hub with 4K HDMI, USB 3.0, and 100W power delivery.',
      tags: ['usb-c', 'hub', 'connectivity', 'hdmi', 'laptop', 'accessories'],
      status: ProductStatus.ACTIVE,
      isVisible: true,
      isFeatured: false,
      createdAt: new Date('2023-05-20'),
      updatedAt: new Date('2023-08-14'),
      publishedAt: new Date('2023-05-25'),
      notes: 'Essential laptop accessory'
    },
    {
      id: '9' as ProductId,
      name: 'Bluetooth Keyboard',
      description: 'Sleek wireless Bluetooth keyboard with backlight, compact design, and long battery life. Compatible with multiple devices and operating systems.',
      shortDescription: 'Wireless Bluetooth keyboard with backlight',
      sku: 'TECH-KB-BT-SLIM-WHT',
      barcode: '456789012345',
      categoryId: '5' as CategoryId,
      brand: 'TechType',
      manufacturer: 'TechType Solutions',
      price: 69.99,
      costPrice: 28.00,
      compareAtPrice: 85.99,
      weight: 485,
      dimensions: {
        length: 28.5,
        width: 12.0,
        height: 2.0,
        unit: 'cm'
      },
      trackInventory: InventoryTrackingMethod.SIMPLE,
      allowBackorder: false,
      requiresShipping: true,
      images: [
        'https://example.com/bt-keyboard-1.jpg',
        'https://example.com/bt-keyboard-2.jpg'
      ],
      thumbnailUrl: 'https://example.com/bt-keyboard-thumb.jpg',
      metaTitle: 'Bluetooth Keyboard | Wireless Backlit',
      metaDescription: 'Wireless Bluetooth keyboard with backlight and multi-device compatibility.',
      tags: ['keyboard', 'bluetooth', 'wireless', 'backlight', 'productivity', 'slim'],
      status: ProductStatus.ACTIVE,
      isVisible: true,
      isFeatured: false,
      createdAt: new Date('2023-04-12'),
      updatedAt: new Date('2023-07-20'),
      publishedAt: new Date('2023-04-18'),
      notes: 'Versatile keyboard option'
    },
    {
      id: '10' as ProductId,
      name: 'Vintage Leather Notebook',
      description: 'Handcrafted vintage leather notebook with lined pages, elastic closure, and pocket for documents. Perfect for journaling, notes, and sketching.',
      shortDescription: 'Handcrafted vintage leather notebook',
      sku: 'CRAFT-NB-LEATHER-VIN-BRN',
      barcode: '321654987012',
      categoryId: '6' as CategoryId,
      brand: 'CraftBooks',
      manufacturer: 'Artisan Notebooks Co.',
      price: 34.99,
      costPrice: 12.00,
      weight: 420,
      dimensions: {
        length: 21.0,
        width: 14.0,
        height: 2.5,
        unit: 'cm'
      },
      trackInventory: InventoryTrackingMethod.NONE,
      allowBackorder: false,
      requiresShipping: true,
      images: [
        'https://example.com/leather-notebook-1.jpg',
        'https://example.com/leather-notebook-2.jpg'
      ],
      thumbnailUrl: 'https://example.com/leather-notebook-thumb.jpg',
      metaTitle: 'Vintage Leather Notebook | Handcrafted Journal',
      metaDescription: 'Handcrafted vintage leather notebook perfect for journaling and note-taking.',
      tags: ['notebook', 'leather', 'vintage', 'handcrafted', 'journal', 'writing'],
      status: ProductStatus.ACTIVE,
      isVisible: true,
      isFeatured: false,
      createdAt: new Date('2023-03-08'),
      updatedAt: new Date('2023-06-15'),
      publishedAt: new Date('2023-03-15'),
      notes: 'Artisan quality product'
    },
    {
      id: '11' as ProductId,
      name: 'Smart Fitness Tracker',
      description: 'Advanced fitness tracker with heart rate monitoring, sleep tracking, GPS, and 7-day battery life. Water-resistant design perfect for active lifestyles.',
      shortDescription: 'Advanced fitness tracker with GPS',
      sku: 'FIT-TRACK-SMART-GPS-BLK',
      barcode: '654321098765',
      categoryId: '7' as CategoryId,
      brand: 'FitTech',
      manufacturer: 'FitTech Devices',
      price: 199.99,
      costPrice: 85.00,
      compareAtPrice: 249.99,
      weight: 45,
      dimensions: {
        length: 4.2,
        width: 3.6,
        height: 1.2,
        unit: 'cm'
      },
      trackInventory: InventoryTrackingMethod.SIMPLE,
      allowBackorder: true,
      requiresShipping: true,
      images: [
        'https://example.com/fitness-tracker-1.jpg',
        'https://example.com/fitness-tracker-2.jpg'
      ],
      thumbnailUrl: 'https://example.com/fitness-tracker-thumb.jpg',
      metaTitle: 'Smart Fitness Tracker | GPS & Heart Rate',
      metaDescription: 'Advanced fitness tracker with GPS, heart rate monitoring, and 7-day battery.',
      tags: ['fitness', 'tracker', 'gps', 'heart-rate', 'health', 'wearable'],
      status: ProductStatus.ACTIVE,
      isVisible: true,
      isFeatured: true,
      createdAt: new Date('2023-09-05'),
      updatedAt: new Date('2023-11-10'),
      publishedAt: new Date('2023-09-12'),
      notes: 'Popular fitness device'
    },
    {
      id: '12' as ProductId,
      name: 'Retro Gaming Console',
      description: 'Classic retro gaming console with 500+ built-in games, wireless controllers, and HD output. Relive the golden age of gaming.',
      shortDescription: 'Retro console with 500+ games',
      sku: 'GAME-RETRO-500G-HDMI',
      barcode: '789012345678',
      categoryId: '8' as CategoryId,
      brand: 'RetroPlay',
      manufacturer: 'Nostalgia Gaming',
      price: 79.99,
      costPrice: 32.00,
      weight: 650,
      dimensions: {
        length: 18.0,
        width: 12.5,
        height: 4.0,
        unit: 'cm'
      },
      trackInventory: InventoryTrackingMethod.SIMPLE,
      allowBackorder: false,
      requiresShipping: true,
      images: [
        'https://example.com/retro-console-1.jpg',
        'https://example.com/retro-console-2.jpg'
      ],
      thumbnailUrl: 'https://example.com/retro-console-thumb.jpg',
      metaTitle: 'Retro Gaming Console | 500+ Classic Games',
      metaDescription: 'Retro gaming console with 500+ built-in games and wireless controllers.',
      tags: ['gaming', 'retro', 'console', 'classic', 'nostalgia', 'entertainment'],
      status: ProductStatus.DISCONTINUED,
      isVisible: false,
      isFeatured: false,
      createdAt: new Date('2023-02-14'),
      updatedAt: new Date('2023-10-01'),
      publishedAt: new Date('2023-02-20'),
      notes: 'Discontinued due to licensing issues'
    }
  ];

  /**
   * Get paginated product list with search and filtering
   */
  getProducts(page = 1, pageSize = 10, criteria?: ProductSearchCriteria): Observable<ProductPageResult> {
    let filteredProducts = [...this.products];

    // Apply filters if criteria provided
    if (criteria) {
      if (criteria.query) {
        const query = criteria.query.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query) ||
          product.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      if (criteria.categoryId) {
        filteredProducts = filteredProducts.filter(product => 
          product.categoryId === criteria.categoryId
        );
      }

      if (criteria.categoryIds && criteria.categoryIds.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          criteria.categoryIds!.includes(product.categoryId)
        );
      }

      if (criteria.status) {
        filteredProducts = filteredProducts.filter(product => 
          product.status === criteria.status
        );
      }

      if (criteria.statuses && criteria.statuses.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          criteria.statuses!.includes(product.status)
        );
      }

      if (criteria.isVisible !== undefined) {
        filteredProducts = filteredProducts.filter(product => 
          product.isVisible === criteria.isVisible
        );
      }

      if (criteria.isFeatured !== undefined) {
        filteredProducts = filteredProducts.filter(product => 
          product.isFeatured === criteria.isFeatured
        );
      }

      if (criteria.brand) {
        filteredProducts = filteredProducts.filter(product => 
          product.brand?.toLowerCase() === criteria.brand!.toLowerCase()
        );
      }

      if (criteria.brands && criteria.brands.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          criteria.brands!.some(brand => 
            product.brand?.toLowerCase() === brand.toLowerCase()
          )
        );
      }

      if (criteria.priceMin !== undefined) {
        filteredProducts = filteredProducts.filter(product => 
          product.price >= criteria.priceMin!
        );
      }

      if (criteria.priceMax !== undefined) {
        filteredProducts = filteredProducts.filter(product => 
          product.price <= criteria.priceMax!
        );
      }

      if (criteria.tags && criteria.tags.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          criteria.tags!.some(tag => 
            product.tags.some(productTag => 
              productTag.toLowerCase().includes(tag.toLowerCase())
            )
          )
        );
      }

      // Apply sorting
      if (criteria.sortBy) {
        filteredProducts = this.sortProducts(filteredProducts, criteria.sortBy, criteria.sortOrder || 'desc');
      }
    } else {
      // Default sorting by updated date descending
      filteredProducts = this.sortProducts(filteredProducts, ProductSortField.UPDATED_AT, 'desc');
    }

    const total = filteredProducts.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const products = filteredProducts.slice(startIndex, startIndex + pageSize);

    // Generate filter metadata
    const filters = {
      categories: Array.from(new Set(this.products.map(p => p.categoryId))),
      brands: Array.from(new Set(this.products.map(p => p.brand).filter(Boolean) as string[])),
      priceRange: {
        min: Math.min(...this.products.map(p => p.price)),
        max: Math.max(...this.products.map(p => p.price))
      },
      statuses: Object.values(ProductStatus)
    };

    const result: ProductPageResult = {
      products,
      total,
      page,
      pageSize,
      totalPages,
      filters
    };

    // Simulate network delay
    return of(result).pipe(delay(300));
  }

  /**
   * Get product by ID
   */
  getProductById(id: ProductId): Observable<Product | null> {
    const product = this.products.find(p => p.id === id) || null;
    return of(product).pipe(delay(100));
  }

  /**
   * Get product summaries for quick listings
   */
  getProductSummaries(categoryId?: CategoryId): Observable<ProductSummary[]> {
    let filteredProducts = this.products.filter(p => p.isVisible);
    
    if (categoryId) {
      filteredProducts = filteredProducts.filter(p => p.categoryId === categoryId);
    }

    const summaries: ProductSummary[] = filteredProducts.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      thumbnailUrl: product.thumbnailUrl,
      status: product.status,
      isVisible: product.isVisible,
      categoryId: product.categoryId
    }));

    return of(summaries).pipe(delay(150));
  }

  /**
   * Create new product
   */
  createProduct(productData: CreateProduct): Observable<Product> {
    // Generate unique ID by finding the highest existing ID + 1
    const existingIds = this.products.map(p => parseInt(p.id)).filter(id => !isNaN(id));
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    
    const now = new Date();
    const newProduct: Product = {
      id: nextId.toString() as ProductId,
      name: productData.name,
      description: productData.description,
      shortDescription: productData.shortDescription,
      sku: productData.sku,
      barcode: productData.barcode,
      categoryId: productData.categoryId,
      brand: productData.brand,
      manufacturer: productData.manufacturer,
      price: productData.price,
      costPrice: productData.costPrice,
      compareAtPrice: productData.compareAtPrice,
      weight: productData.weight,
      dimensions: productData.dimensions,
      trackInventory: productData.trackInventory || DEFAULT_PRODUCT_VALUES.trackInventory!,
      allowBackorder: productData.allowBackorder ?? DEFAULT_PRODUCT_VALUES.allowBackorder!,
      requiresShipping: productData.requiresShipping ?? DEFAULT_PRODUCT_VALUES.requiresShipping!,
      images: productData.images || DEFAULT_PRODUCT_VALUES.images!,
      thumbnailUrl: productData.thumbnailUrl,
      metaTitle: productData.metaTitle,
      metaDescription: productData.metaDescription,
      tags: productData.tags || DEFAULT_PRODUCT_VALUES.tags!,
      status: productData.status || DEFAULT_PRODUCT_VALUES.status!,
      isVisible: productData.isVisible ?? DEFAULT_PRODUCT_VALUES.isVisible!,
      isFeatured: productData.isFeatured ?? DEFAULT_PRODUCT_VALUES.isFeatured!,
      createdAt: now,
      updatedAt: now,
      publishedAt: productData.status === ProductStatus.ACTIVE ? now : undefined,
      notes: productData.notes,
      externalId: productData.externalId
    };

    this.products.push(newProduct);
    
    return of(newProduct).pipe(delay(250));
  }

  /**
   * Update existing product
   */
  updateProduct(id: ProductId, updates: Partial<UpdateProduct>): Observable<Product | null> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      return of(null).pipe(delay(100));
    }

    const updatedProduct = { 
      ...this.products[index], 
      ...updates, 
      updatedAt: new Date()
    };

    // Update publishedAt if status changes to ACTIVE
    if (updates.status === ProductStatus.ACTIVE && this.products[index].status !== ProductStatus.ACTIVE) {
      updatedProduct.publishedAt = new Date();
    }

    this.products[index] = updatedProduct;
    
    return of(this.products[index]).pipe(delay(200));
  }

  /**
   * Delete product
   */
  deleteProduct(id: ProductId): Observable<boolean> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      return of(false).pipe(delay(100));
    }

    this.products.splice(index, 1);
    
    return of(true).pipe(delay(200));
  }

  /**
   * Check if SKU is available (not used by another product)
   */
  isSkuAvailable(sku: string, excludeProductId?: ProductId): Observable<boolean> {
    const existingProduct = this.products.find(p => 
      p.sku.toLowerCase() === sku.toLowerCase() && 
      (!excludeProductId || p.id !== excludeProductId)
    );
    
    return of(!existingProduct).pipe(delay(100));
  }

  /**
   * Get products by category
   */
  getProductsByCategory(categoryId: CategoryId, onlyVisible = true): Observable<Product[]> {
    let filteredProducts = this.products.filter(p => p.categoryId === categoryId);
    
    if (onlyVisible) {
      filteredProducts = filteredProducts.filter(p => p.isVisible);
    }

    return of(filteredProducts).pipe(delay(150));
  }

  /**
   * Search products by tags
   */
  getProductsByTags(tags: string[]): Observable<Product[]> {
    const filtered = this.products.filter(product =>
      tags.some(tag =>
        product.tags.some(productTag =>
          productTag.toLowerCase().includes(tag.toLowerCase())
        )
      )
    );

    return of(filtered).pipe(delay(150));
  }

  /**
   * Get featured products
   */
  getFeaturedProducts(limit?: number): Observable<Product[]> {
    let featured = this.products.filter(p => p.isFeatured && p.isVisible);
    
    if (limit) {
      featured = featured.slice(0, limit);
    }

    return of(featured).pipe(delay(100));
  }

  /**
   * Sort products by specified field and order
   */
  private sortProducts(products: Product[], sortField: ProductSortField, sortOrder: 'asc' | 'desc'): Product[] {
    return products.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortField) {
        case ProductSortField.NAME:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case ProductSortField.PRICE:
          valueA = a.price;
          valueB = b.price;
          break;
        case ProductSortField.SKU:
          valueA = a.sku.toLowerCase();
          valueB = b.sku.toLowerCase();
          break;
        case ProductSortField.CREATED_AT:
          valueA = a.createdAt.getTime();
          valueB = b.createdAt.getTime();
          break;
        case ProductSortField.UPDATED_AT:
          valueA = a.updatedAt.getTime();
          valueB = b.updatedAt.getTime();
          break;
        case ProductSortField.PUBLISHED_AT:
          valueA = a.publishedAt?.getTime() || 0;
          valueB = b.publishedAt?.getTime() || 0;
          break;
        case ProductSortField.CATEGORY:
          valueA = a.categoryId;
          valueB = b.categoryId;
          break;
        case ProductSortField.BRAND:
          valueA = a.brand?.toLowerCase() || '';
          valueB = b.brand?.toLowerCase() || '';
          break;
        case ProductSortField.STATUS:
          valueA = a.status;
          valueB = b.status;
          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
      }

      if (valueA < valueB) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
}