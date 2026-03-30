/**
 * Validation Utilities
 * 
 * Reusable validation functions for forms and data.
 * Complements Yup schemas with standalone validators.
 */

import { VALIDATION } from '@/constants/AppConstants';

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return VALIDATION.EMAIL_REGEX.test(email.trim());
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  if (!password || typeof password !== 'string') return false;
  return password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
}

/**
 * Get password strength level
 */
export function getPasswordStrength(password: string): {
  level: 'weak' | 'medium' | 'strong';
  score: number;
  feedback: string[];
} {
  if (!password) {
    return { level: 'weak', score: 0, feedback: ['Password is required'] };
  }

  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) {
    score += 25;
  } else {
    feedback.push('Use at least 8 characters');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 25;
  } else {
    feedback.push('Add uppercase letters');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 25;
  } else {
    feedback.push('Add lowercase letters');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 12.5;
  } else {
    feedback.push('Add numbers');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 12.5;
  } else {
    feedback.push('Add special characters');
  }

  let level: 'weak' | 'medium' | 'strong';
  if (score < 50) level = 'weak';
  else if (score < 75) level = 'medium';
  else level = 'strong';

  return { level, score, feedback };
}

/**
 * Validate username format
 */
export function isValidUsername(username: string): boolean {
  if (!username || typeof username !== 'string') return false;
  
  const trimmed = username.trim();
  return (
    trimmed.length >= VALIDATION.USERNAME_MIN_LENGTH &&
    trimmed.length <= VALIDATION.USERNAME_MAX_LENGTH &&
    /^[a-zA-Z0-9_-]+$/.test(trimmed) // Only alphanumeric, underscore, hyphen
  );
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  return VALIDATION.PHONE_REGEX.test(phone.trim());
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Sanitize user input (remove dangerous characters)
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Validate file type
 */
export function isValidFileType(
  file: { type?: string; name?: string },
  allowedTypes: string[]
): boolean {
  if (!file) return false;
  
  // Check MIME type
  if (file.type && allowedTypes.includes(file.type)) {
    return true;
  }
  
  // Check file extension as fallback
  if (file.name) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return allowedTypes.some((type) => type.includes(extension || ''));
  }
  
  return false;
}

/**
 * Validate file size
 */
export function isValidFileSize(
  file: { size?: number },
  maxSizeBytes: number
): boolean {
  if (!file || typeof file.size !== 'number') return false;
  return file.size <= maxSizeBytes;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for US numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Return original if not a standard format
  return phone;
}

/**
 * Check if string is empty or whitespace
 */
export function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

/**
 * Check if two passwords match
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword && !isEmpty(password);
}

/**
 * Validate credit card number using Luhn algorithm
 */
export function isValidCreditCard(cardNumber: string): boolean {
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  
  // Must be digits only
  if (!/^\d+$/.test(cleaned)) return false;
  
  // Must be 13-19 digits
  if (cleaned.length < 13 || cleaned.length > 19) return false;
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Validate expiry date (MM/YY format)
 */
export function isValidExpiryDate(expiry: string): boolean {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  
  const [, month, year] = match;
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  // Valid month
  if (monthNum < 1 || monthNum > 12) return false;
  
  // Not expired
  const now = new Date();
  const currentYear = now.getFullYear() % 100; // Get last 2 digits
  const currentMonth = now.getMonth() + 1;
  
  if (yearNum < currentYear) return false;
  if (yearNum === currentYear && monthNum < currentMonth) return false;
  
  return true;
}

/**
 * Validate CVV code
 */
export function isValidCVV(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Capitalize first letter of each word
 */
export function toTitleCase(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Extract domain from email
 */
export function getEmailDomain(email: string): string | null {
  if (!isValidEmail(email)) return null;
  return email.split('@')[1];
}

/**
 * Check if string contains only numbers
 */
export function isNumeric(value: string): boolean {
  return /^\d+$/.test(value);
}

/**
 * Check if string contains only letters
 */
export function isAlpha(value: string): boolean {
  return /^[a-zA-Z]+$/.test(value);
}

/**
 * Check if string is alphanumeric
 */
export function isAlphanumeric(value: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(value);
}

export default {
  isValidEmail,
  isValidPassword,
  getPasswordStrength,
  isValidUsername,
  isValidPhone,
  isValidUrl,
  sanitizeInput,
  isValidFileType,
  isValidFileSize,
  formatPhoneNumber,
  isEmpty,
  passwordsMatch,
  isValidCreditCard,
  isValidExpiryDate,
  isValidCVV,
  truncate,
  toTitleCase,
  getEmailDomain,
  isNumeric,
  isAlpha,
  isAlphanumeric,
};
