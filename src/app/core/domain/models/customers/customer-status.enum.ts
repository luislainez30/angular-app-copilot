/**
 * Customer status enumeration
 */
export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  BLOCKED = 'blocked'
}

/**
 * Helper function to get human-readable status labels
 */
export function getCustomerStatusLabel(status: CustomerStatus): string {
  const labels: Record<CustomerStatus, string> = {
    [CustomerStatus.ACTIVE]: 'Active',
    [CustomerStatus.INACTIVE]: 'Inactive',
    [CustomerStatus.SUSPENDED]: 'Suspended',
    [CustomerStatus.PENDING]: 'Pending Verification',
    [CustomerStatus.BLOCKED]: 'Blocked'
  };
  return labels[status];
}

/**
 * Helper function to check if a customer status allows transactions
 */
export function canPerformTransactions(status: CustomerStatus): boolean {
  return status === CustomerStatus.ACTIVE;
}