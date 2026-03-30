/**
 * Error Handler Utility
 * 
 * Centralized error handling and normalization across the application.
 * Provides consistent error messages and logging.
 */

import { logger } from './logger';
import { ERROR_MESSAGES } from '@/constants/AppConstants';
import { ApiError, NormalizedError } from '@/types/api';

/**
 * Normalize any error into a consistent format
 */
export function normalizeError(error: unknown, context?: string): NormalizedError {
  // Handle API errors
  if (isApiError(error)) {
    return {
      message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      code: error.code,
      status: error.status,
      context,
    };
  }

  // Handle Error instances
  if (error instanceof Error) {
    return {
      message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      context,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
      context,
    };
  }

  // Handle objects with message property
  if (error && typeof error === 'object' && 'message' in error) {
    const errorObj = error as { message?: string };
    return {
      message: errorObj.message ? String(errorObj.message) : ERROR_MESSAGES.UNKNOWN_ERROR,
      context,
    };
  }

  // Fallback
  return {
    message: ERROR_MESSAGES.UNKNOWN_ERROR,
    context,
  };
}

/**
 * Check if error is an API error
 */
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as any).status === 'number'
  );
}

/**
 * Get user-friendly error message based on error type
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  const normalized = normalizeError(error);

  // Map status codes to friendly messages
  if (normalized.status) {
    switch (normalized.status) {
      case 400:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 408:
        return ERROR_MESSAGES.TIMEOUT_ERROR;
      case 500:
      case 502:
      case 503:
      case 504:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return normalized.message;
    }
  }

  // Check for network errors
  if (
    normalized.message.toLowerCase().includes('network') ||
    normalized.message.toLowerCase().includes('connection') ||
    normalized.code === 'NETWORK_ERROR'
  ) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Check for timeout errors
  if (
    normalized.message.toLowerCase().includes('timeout') ||
    normalized.code === 'TIMEOUT_ERROR'
  ) {
    return ERROR_MESSAGES.TIMEOUT_ERROR;
  }

  return normalized.message || ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Log error with context
 */
export function logError(error: unknown, context?: string, additionalData?: any): void {
  const normalized = normalizeError(error, context);
  
  logger.error(
    normalized.message,
    error instanceof Error ? error : undefined,
    {
      context: normalized.context,
      data: {
        ...additionalData,
        code: normalized.code,
        status: normalized.status,
      },
    }
  );
}

/**
 * Handle error and return user-friendly message
 * Combines normalization, logging, and message extraction
 */
export function handleError(
  error: unknown,
  context?: string,
  additionalData?: any
): string {
  logError(error, context, additionalData);
  return getUserFriendlyErrorMessage(error);
}

/**
 * Retry utility for failed operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    context?: string;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    context = 'Operation',
    shouldRetry = () => true,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      logger.debug(`${context} attempt ${attempt}/${maxAttempts}`);
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts || !shouldRetry(error)) {
        break;
      }

      logger.warning(
        `${context} attempt ${attempt} failed, retrying...`,
        { data: { attemptsRemaining: maxAttempts - attempt } }
      );

      // Wait before retrying (exponential backoff)
      await delay(delayMs * attempt);
    }
  }

  throw lastError;
}

/**
 * Delay utility
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safe async wrapper that catches errors
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallbackValue: T,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logError(error, context);
    return fallbackValue;
  }
}

/**
 * Create an error with additional context
 */
export function createError(
  message: string,
  options?: {
    code?: string;
    status?: number;
    context?: string;
    cause?: Error;
  }
): Error {
  const error = new Error(message) as any;
  
  if (options?.code) error.code = options.code;
  if (options?.status) error.status = options.status;
  if (options?.context) error.context = options.context;
  if (options?.cause) error.cause = options.cause;
  
  return error;
}

/**
 * Assert that a condition is true, throw error otherwise
 */
export function assert(
  condition: boolean,
  message: string,
  context?: string
): asserts condition {
  if (!condition) {
    throw createError(message, { context, code: 'ASSERTION_ERROR' });
  }
}

/**
 * Type guard for checking if value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export default {
  normalizeError,
  getUserFriendlyErrorMessage,
  logError,
  handleError,
  withRetry,
  safeAsync,
  createError,
  assert,
  isDefined,
};
