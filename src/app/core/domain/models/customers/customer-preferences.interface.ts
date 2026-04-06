/**
 * Customer preferences and settings
 */
export interface CustomerPreferences {
  communicationMethod: CommunicationMethod;
  newsletter: boolean;
  promotions: boolean;
  language: string;
  currency: string;
  timezone: string;
}

/**
 * Available communication methods
 */
export enum CommunicationMethod {
  EMAIL = 'email',
  SMS = 'sms',
  PHONE = 'phone',
  MAIL = 'mail'
}

/**
 * Default customer preferences
 */
export const DEFAULT_CUSTOMER_PREFERENCES: CustomerPreferences = {
  communicationMethod: CommunicationMethod.EMAIL,
  newsletter: false,
  promotions: false,
  language: 'en',
  currency: 'USD',
  timezone: 'UTC'
};

/**
 * Helper function to get communication method label
 */
export function getCommunicationMethodLabel(method: CommunicationMethod): string {
  const labels: Record<CommunicationMethod, string> = {
    [CommunicationMethod.EMAIL]: 'Email',
    [CommunicationMethod.SMS]: 'SMS/Text Message',
    [CommunicationMethod.PHONE]: 'Phone Call',
    [CommunicationMethod.MAIL]: 'Physical Mail'
  };
  return labels[method];
}