/**
 * Auth Token Utility
 * 
 * Manages authentication token storage using SecureStore.
 * Refactored to use centralized secureStorage utility for consistency.
 */

import secureStorage from './secureStorage';
import { STORAGE_KEYS } from '@/constants/AppConstants';

/**
 * Retrieves the stored authentication token from SecureStore
 * @returns {Promise<string | null>} The stored token or null if not found
 */
export const getUserToken = async (): Promise<string | null> => {
  return secureStorage.get(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Stores the authentication token in SecureStore
 * @param {string} token - The authentication token to store
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const setUserToken = async (token: string): Promise<boolean> => {
  return secureStorage.save(STORAGE_KEYS.AUTH_TOKEN, token);
};

/**
 * Removes the authentication token from SecureStore
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const clearUserToken = async (): Promise<boolean> => {
  return secureStorage.remove(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Check if auth token exists
 * @returns {Promise<boolean>} True if token exists
 */
export const hasUserToken = async (): Promise<boolean> => {
  return secureStorage.has(STORAGE_KEYS.AUTH_TOKEN);
};

