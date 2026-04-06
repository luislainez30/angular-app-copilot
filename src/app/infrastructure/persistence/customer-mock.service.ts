import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  Customer,
  CustomerStatus,
  CustomerPageResult,
  CustomerSearchCriteria,
  CustomerSortField,
  CommunicationMethod,
  DEFAULT_CUSTOMER_PREFERENCES
} from '../../core/domain/models/customers';

/**
 * Mock service for customer data persistence
 * Simulates API responses with realistic data
 */
@Injectable({
  providedIn: 'root'
})
export class CustomerMockService {
  private customers: Customer[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phone: '+1-555-0123',
      dateOfBirth: new Date('1985-03-15'),
      registeredDate: new Date('2023-01-15'),
      status: CustomerStatus.ACTIVE,
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
        isDefault: true
      },
      preferences: {
        ...DEFAULT_CUSTOMER_PREFERENCES,
        communicationMethod: CommunicationMethod.EMAIL,
        newsletter: true,
        language: 'en',
        currency: 'USD',
        timezone: 'America/New_York'
      }
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@email.com',
      phone: '+1-555-0124',
      dateOfBirth: new Date('1990-07-22'),
      registeredDate: new Date('2023-03-10'),
      status: CustomerStatus.ACTIVE,
      address: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90210',
        country: 'USA',
        isDefault: true
      },
      preferences: {
        ...DEFAULT_CUSTOMER_PREFERENCES,
        communicationMethod: CommunicationMethod.SMS,
        promotions: true,
        language: 'en',
        currency: 'USD',
        timezone: 'America/Los_Angeles'
      }
    },
    {
      id: '3',
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      email: 'carlos.rodriguez@email.com',
      phone: '+1-555-0125',
      dateOfBirth: new Date('1988-11-03'),
      registeredDate: new Date('2022-12-05'),
      status: CustomerStatus.INACTIVE,
      address: {
        street: '789 Pine Rd',
        city: 'Miami',
        state: 'FL',
        postalCode: '33101',
        country: 'USA',
        isDefault: true
      },
      preferences: {
        ...DEFAULT_CUSTOMER_PREFERENCES,
        communicationMethod: CommunicationMethod.EMAIL,
        language: 'es',
        currency: 'USD',
        timezone: 'America/New_York'
      }
    },
    {
      id: '4',
      firstName: 'Emily',
      lastName: 'Johnson',
      email: 'emily.johnson@email.com',
      phone: '+1-555-0126',
      dateOfBirth: new Date('1992-02-14'),
      registeredDate: new Date('2023-05-20'),
      status: CustomerStatus.PENDING,
      address: {
        street: '321 Elm St',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'USA',
        isDefault: true
      },
      preferences: {
        ...DEFAULT_CUSTOMER_PREFERENCES,
        communicationMethod: CommunicationMethod.PHONE,
        newsletter: true,
        promotions: true,
        language: 'en',
        currency: 'USD',
        timezone: 'America/Chicago'
      }
    },
    {
      id: '5',
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'michael.brown@email.com',
      phone: '+1-555-0127',
      dateOfBirth: new Date('1987-09-18'),
      registeredDate: new Date('2023-02-28'),
      status: CustomerStatus.SUSPENDED,
      address: {
        street: '654 Maple Drive',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98101',
        country: 'USA',
        isDefault: true
      },
      preferences: {
        ...DEFAULT_CUSTOMER_PREFERENCES,
        communicationMethod: CommunicationMethod.EMAIL,
        language: 'en',
        currency: 'USD',
        timezone: 'America/Los_Angeles'
      }
    },
    {
      id: '6',
      firstName: 'Sarah',
      lastName: 'Davis',
      email: 'sarah.davis@company.com',
      phone: '+1-555-0128',
      dateOfBirth: new Date('1995-07-22'),
      registeredDate: new Date('2023-08-15'),
      status: CustomerStatus.ACTIVE,
      address: {
        street: '789 Pine Avenue',
        city: 'Denver',
        state: 'CO',
        postalCode: '80202',
        country: 'USA',
        isDefault: true
      },
      preferences: {
        ...DEFAULT_CUSTOMER_PREFERENCES,
        communicationMethod: CommunicationMethod.SMS,
        newsletter: true,
        promotions: false,
        language: 'en',
        currency: 'USD',
        timezone: 'America/Denver'
      }
    },
    {
      id: '7',
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.wilson@tech.co',
      phone: '+1-555-0129',
      dateOfBirth: new Date('1983-11-30'),
      registeredDate: new Date('2023-01-10'),
      status: CustomerStatus.INACTIVE,
      address: {
        street: '456 Cedar Lane',
        city: 'Portland',
        state: 'OR',
        postalCode: '97201',
        country: 'USA',
        isDefault: true
      },
      preferences: {
        ...DEFAULT_CUSTOMER_PREFERENCES,
        communicationMethod: CommunicationMethod.EMAIL,
        newsletter: false,
        promotions: false,
        language: 'en',
        currency: 'USD',
        timezone: 'America/Los_Angeles'
      }
    },
    {
      id: '8',
      firstName: 'Rachel',
      lastName: 'Martinez',
      email: 'rachel.martinez@gmail.com',
      phone: '+1-555-0130',
      dateOfBirth: new Date('1991-03-08'),
      registeredDate: new Date('2023-06-25'),
      status: CustomerStatus.ACTIVE,
      address: {
        street: '987 Sunset Boulevard',
        city: 'Miami',
        state: 'FL',
        postalCode: '33101',
        country: 'USA',
        isDefault: true
      },
      preferences: {
        ...DEFAULT_CUSTOMER_PREFERENCES,
        communicationMethod: CommunicationMethod.PHONE,
        newsletter: true,
        promotions: true,
        language: 'es',
        currency: 'USD',
        timezone: 'America/New_York'
      }
    },
    {
      id: '9',
      firstName: 'Thomas',
      lastName: 'Anderson',
      email: 'thomas.anderson@matrix.net',
      phone: '+1-555-0131',
      dateOfBirth: new Date('1985-09-11'),
      registeredDate: new Date('2023-04-18'),
      status: CustomerStatus.PENDING,
      address: {
        street: '1313 Mockingbird Lane',
        city: 'Austin',
        state: 'TX',
        postalCode: '73301',
        country: 'USA',
        isDefault: true
      },
      preferences: {
        ...DEFAULT_CUSTOMER_PREFERENCES,
        communicationMethod: CommunicationMethod.EMAIL,
        newsletter: false,
        promotions: true,
        language: 'en',
        currency: 'USD',
        timezone: 'America/Chicago'
      }
    },
    {
      id: '10',
      firstName: 'Jennifer',
      lastName: 'Garcia',
      email: 'jennifer.garcia@outlook.com',
      phone: '+1-555-0132',
      dateOfBirth: new Date('1994-12-05'),
      registeredDate: new Date('2023-07-14'),
      status: CustomerStatus.ACTIVE,
      address: {
        street: '2468 Broadway',
        city: 'Phoenix',
        state: 'AZ',
        postalCode: '85001',
        country: 'USA',
        isDefault: true
      },
      preferences: {
        ...DEFAULT_CUSTOMER_PREFERENCES,
        communicationMethod: CommunicationMethod.SMS,
        newsletter: true,
        promotions: false,
        language: 'en',
        currency: 'USD',
        timezone: 'America/Phoenix'
      }
    },
    {
      id: '11',
      firstName: 'Christopher',
      lastName: 'Lee',
      email: 'christopher.lee@business.org',
      phone: '+1-555-0133',
      dateOfBirth: new Date('1988-06-17'),
      registeredDate: new Date('2023-03-22'),
      status: CustomerStatus.SUSPENDED,
      address: {
        street: '1357 Industrial Way',
        city: 'Detroit',
        state: 'MI',
        postalCode: '48201',
        country: 'USA',
        isDefault: true
      },
      preferences: {
        ...DEFAULT_CUSTOMER_PREFERENCES,
        communicationMethod: CommunicationMethod.PHONE,
        newsletter: false,
        promotions: false,
        language: 'en',
        currency: 'USD',
        timezone: 'America/Detroit'
      }
    },
    {
      id: '12',
      firstName: 'Amanda',
      lastName: 'Thompson',
      email: 'amanda.thompson@yahoo.com',
      phone: '+1-555-0134',
      dateOfBirth: new Date('1990-10-25'),
      registeredDate: new Date('2023-09-08'),
      status: CustomerStatus.ACTIVE,
      address: {
        street: '741 Royal Street',
        city: 'New Orleans',
        state: 'LA',
        postalCode: '70130',
        country: 'USA',
        isDefault: true
      },
      preferences: {
        ...DEFAULT_CUSTOMER_PREFERENCES,
        communicationMethod: CommunicationMethod.EMAIL,
        newsletter: true,
        promotions: true,
        language: 'en',
        currency: 'USD',
        timezone: 'America/Chicago'
      }
    },
    {
      id: '13',
      firstName: 'Robert',
      lastName: 'Taylor',
      email: 'robert.taylor@consulting.biz',
      phone: '+1-555-0135',
      dateOfBirth: new Date('1982-01-19'),
      registeredDate: new Date('2023-02-14'),
      status: CustomerStatus.INACTIVE,
      address: {
        street: '852 Mountain View Road',
        city: 'Salt Lake City',
        state: 'UT',
        postalCode: '84101',
        country: 'USA',
        isDefault: true
      },
      preferences: {
        ...DEFAULT_CUSTOMER_PREFERENCES,
        communicationMethod: CommunicationMethod.EMAIL,
        newsletter: false,
        promotions: true,
        language: 'en',
        currency: 'USD',
        timezone: 'America/Denver'
      }
    },
    {
      id: '14',
      firstName: 'Lisa',
      lastName: 'White',
      email: 'lisa.white@design.studio',
      phone: '+1-555-0136',
      dateOfBirth: new Date('1993-08-12'),
      registeredDate: new Date('2023-10-03'),
      status: CustomerStatus.ACTIVE,
      address: {
        street: '963 Art District Lane',
        city: 'Nashville',
        state: 'TN',
        postalCode: '37201',
        country: 'USA',
        isDefault: true
      },
      preferences: {
        ...DEFAULT_CUSTOMER_PREFERENCES,
        communicationMethod: CommunicationMethod.SMS,
        newsletter: true,
        promotions: false,
        language: 'en',
        currency: 'USD',
        timezone: 'America/Chicago'
      }
    },
    {
      id: '15',
      firstName: 'James',
      lastName: 'Harris',
      email: 'james.harris@enterprise.com',
      phone: '+1-555-0137',
      dateOfBirth: new Date('1986-04-26'),
      registeredDate: new Date('2023-01-28'),
      status: CustomerStatus.PENDING,
      address: {
        street: '159 Commerce Plaza',
        city: 'Atlanta',
        state: 'GA',
        postalCode: '30301',
        country: 'USA',
        isDefault: true
      },
      preferences: {
        ...DEFAULT_CUSTOMER_PREFERENCES,
        communicationMethod: CommunicationMethod.PHONE,
        newsletter: true,
        promotions: true,
        language: 'en',
        currency: 'USD',
        timezone: 'America/New_York'
      }
    },
    {
      id: '16',
      firstName: 'Michelle',
      lastName: 'Clark',
      email: 'michelle.clark@startup.io',
      phone: '+1-555-0138',
      dateOfBirth: new Date('1996-05-14'),
      registeredDate: new Date('2023-11-12'),
      status: CustomerStatus.ACTIVE,
      address: {
        street: '357 Innovation Drive',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94102',
        country: 'USA',
        isDefault: true
      },
      preferences: {
        ...DEFAULT_CUSTOMER_PREFERENCES,
        communicationMethod: CommunicationMethod.EMAIL,
        newsletter: false,
        promotions: false,
        language: 'en',
        currency: 'USD',
        timezone: 'America/Los_Angeles'
      }
    },
    {
      id: '17',
      firstName: 'Kevin',
      lastName: 'Rodriguez',
      email: 'kevin.rodriguez@freelance.net',
      phone: '+1-555-0139',
      dateOfBirth: new Date('1989-12-03'),
      registeredDate: new Date('2023-05-07'),
      status: CustomerStatus.SUSPENDED,
      address: {
        street: '951 Creative Commons',
        city: 'Las Vegas',
        state: 'NV',
        postalCode: '89101',
        country: 'USA',
        isDefault: true
      },
      preferences: {
        ...DEFAULT_CUSTOMER_PREFERENCES,
        communicationMethod: CommunicationMethod.SMS,
        newsletter: true,
        promotions: true,
        language: 'es',
        currency: 'USD',
        timezone: 'America/Los_Angeles'
      }
    },
    {
      id: '18',
      firstName: 'Nicole',
      lastName: 'Lewis',
      email: 'nicole.lewis@healthcare.org',
      phone: '+1-555-0140',
      dateOfBirth: new Date('1987-07-29'),
      registeredDate: new Date('2023-04-02'),
      status: CustomerStatus.ACTIVE,
      address: {
        street: '753 Medical Center Boulevard',
        city: 'Boston',
        state: 'MA',
        postalCode: '02101',
        country: 'USA',
        isDefault: true
      },
      preferences: {
        ...DEFAULT_CUSTOMER_PREFERENCES,
        communicationMethod: CommunicationMethod.PHONE,
        newsletter: false,
        promotions: false,
        language: 'en',
        currency: 'USD',
        timezone: 'America/New_York'
      }
    },
    {
      id: '19',
      firstName: 'Daniel',
      lastName: 'Walker',
      email: 'daniel.walker@education.edu',
      phone: '+1-555-0141',
      dateOfBirth: new Date('1984-11-16'),
      registeredDate: new Date('2023-08-30'),
      status: CustomerStatus.INACTIVE,
      address: {
        street: '846 University Avenue',
        city: 'Minneapolis',
        state: 'MN',
        postalCode: '55401',
        country: 'USA',
        isDefault: true
      },
      preferences: {
        ...DEFAULT_CUSTOMER_PREFERENCES,
        communicationMethod: CommunicationMethod.EMAIL,
        newsletter: true,
        promotions: false,
        language: 'en',
        currency: 'USD',
        timezone: 'America/Chicago'
      }
    },
    {
      id: '20',
      firstName: 'Stephanie',
      lastName: 'Hall',
      email: 'stephanie.hall@retail.shop',
      phone: '+1-555-0142',
      dateOfBirth: new Date('1992-09-07'),
      registeredDate: new Date('2023-12-01'),
      status: CustomerStatus.ACTIVE,
      address: {
        street: '642 Shopping District',
        city: 'Charlotte',
        state: 'NC',
        postalCode: '28201',
        country: 'USA',
        isDefault: true
      },
      preferences: {
        ...DEFAULT_CUSTOMER_PREFERENCES,
        communicationMethod: CommunicationMethod.SMS,
        newsletter: true,
        promotions: true,
        language: 'en',
        currency: 'USD',
        timezone: 'America/New_York'
      }
    }
  ];

  /**
   * Get paginated customer list
   */
  getCustomers(page = 1, pageSize = 10, criteria?: CustomerSearchCriteria): Observable<CustomerPageResult> {
    let filteredCustomers = [...this.customers];

    // Apply filters if criteria provided
    if (criteria) {
      if (criteria.query) {
        const query = criteria.query.toLowerCase();
        filteredCustomers = filteredCustomers.filter(customer => 
          customer.firstName.toLowerCase().includes(query) ||
          customer.lastName.toLowerCase().includes(query) ||
          customer.email.toLowerCase().includes(query) ||
          customer.phone.includes(query)
        );
      }

      if (criteria.status && criteria.status.length > 0) {
        filteredCustomers = filteredCustomers.filter(customer => 
          criteria.status!.includes(customer.status)
        );
      }

      if (criteria.city) {
        filteredCustomers = filteredCustomers.filter(customer => 
          customer.address.city.toLowerCase().includes(criteria.city!.toLowerCase())
        );
      }

      // Apply sorting
      if (criteria.sortBy) {
        filteredCustomers = this.sortCustomers(filteredCustomers, criteria.sortBy, criteria.sortOrder || 'desc');
      }
    } else {
      // Default sorting by ID descending
      filteredCustomers = this.sortCustomers(filteredCustomers, CustomerSortField.ID, 'desc');
    }

    const total = filteredCustomers.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const customers = filteredCustomers.slice(startIndex, startIndex + pageSize);

    const result: CustomerPageResult = {
      customers,
      total,
      page,
      pageSize,
      totalPages
    };

    // Simulate network delay
    return of(result).pipe(delay(300));
  }

  /**
   * Get customer by ID
   */
  getCustomerById(id: string): Observable<Customer | null> {
    const customer = this.customers.find(c => c.id === id) || null;
    return of(customer).pipe(delay(100));
  }

  /**
   * Create new customer
   */
  createCustomer(customerData: Partial<Customer>): Observable<Customer> {
    // Generate unique ID by finding the highest existing ID + 1
    const existingIds = this.customers.map(c => parseInt(c.id)).filter(id => !isNaN(id));
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    
    const newCustomer: Customer = {
      id: nextId.toString(),
      firstName: customerData.firstName || '',
      lastName: customerData.lastName || '',
      email: customerData.email || '',
      phone: customerData.phone || '',
      dateOfBirth: customerData.dateOfBirth || new Date(),
      registeredDate: new Date(),
      status: customerData.status || CustomerStatus.PENDING,
      address: customerData.address || {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'USA'
      },
      preferences: customerData.preferences || DEFAULT_CUSTOMER_PREFERENCES
    };

    this.customers.push(newCustomer);
    
    return of(newCustomer).pipe(delay(200));
  }

  /**
   * Update existing customer
   */
  updateCustomer(id: string, updates: Partial<Customer>): Observable<Customer> {
    const index = this.customers.findIndex(c => c.id === id);
    if (index === -1) {
      return of({} as Customer).pipe(delay(100));
    }

    this.customers[index] = { ...this.customers[index], ...updates };
    
    return of(this.customers[index]).pipe(delay(200));
  }

  /**
   * Delete customer
   */
  deleteCustomer(id: string): Observable<boolean> {
    const index = this.customers.findIndex(c => c.id === id);
    if (index === -1) {
      return of(false).pipe(delay(100));
    }

    const deletedCustomer = this.customers[index];
    this.customers.splice(index, 1);
    
    return of(true).pipe(delay(200));
  }

  /**
   * Sort customers by specified field and order
   */
  private sortCustomers(customers: Customer[], sortField: CustomerSortField, sortOrder: 'asc' | 'desc'): Customer[] {
    return customers.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortField) {
        case CustomerSortField.ID:
          valueA = parseInt(a.id) || 0;
          valueB = parseInt(b.id) || 0;
          break;
        case CustomerSortField.FIRST_NAME:
          valueA = a.firstName.toLowerCase();
          valueB = b.firstName.toLowerCase();
          break;
        case CustomerSortField.LAST_NAME:
          valueA = a.lastName.toLowerCase();
          valueB = b.lastName.toLowerCase();
          break;
        case CustomerSortField.EMAIL:
          valueA = a.email.toLowerCase();
          valueB = b.email.toLowerCase();
          break;
        case CustomerSortField.PHONE:
          valueA = a.phone;
          valueB = b.phone;
          break;
        case CustomerSortField.REGISTERED_DATE:
          valueA = new Date(a.registeredDate).getTime();
          valueB = new Date(b.registeredDate).getTime();
          break;
        case CustomerSortField.DATE_OF_BIRTH:
          valueA = new Date(a.dateOfBirth).getTime();
          valueB = new Date(b.dateOfBirth).getTime();
          break;
        case CustomerSortField.STATUS:
          valueA = a.status;
          valueB = b.status;
          break;
        case CustomerSortField.CITY:
          valueA = a.address.city.toLowerCase();
          valueB = b.address.city.toLowerCase();
          break;
        case CustomerSortField.STATE:
          valueA = a.address.state.toLowerCase();
          valueB = b.address.state.toLowerCase();
          break;
        default:
          return 0;
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
