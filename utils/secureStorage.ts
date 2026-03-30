/**
 * Secure Storage Utility
 * 
 * Abstraction layer over expo-secure-store for consistent, type-safe storage operations.
 * Provides error handling, validation, and convenient methods.
 */

import * as SecureStore from 'expo-secure-store';
import { logger } from './logger';
import { handleError } from './errorHandler';

export interface SecureStorageOptions {
  keychainAccessible?: SecureStore.KeychainAccessibilityConstant;
  keychainService?: string;
}

/**
 * Save a value to secure storage
 */
export async function secureStoreSave(
  key: string,
  value: string,
  options?: SecureStorageOptions
): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(key, value, options);
    logger.debug(`Saved to secure storage: ${key}`);
    return true;
  } catch (error) {
    handleError(error, `SecureStore.save(${key})`);
    return false;
  }
}

/**
 * Get a value from secure storage
 */
export async function secureStoreGet(
  key: string,
  options?: SecureStorageOptions
): Promise<string | null> {
  try {
    const value = await SecureStore.getItemAsync(key, options);
    logger.debug(`Retrieved from secure storage: ${key}`, { 
      data: { exists: !!value } 
    });
    return value;
  } catch (error) {
    handleError(error, `SecureStore.get(${key})`);
    return null;
  }
}

/**
 * Remove a value from secure storage
 */
export async function secureStoreRemove(
  key: string,
  options?: SecureStorageOptions
): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(key, options);
    logger.debug(`Removed from secure storage: ${key}`);
    return true;
  } catch (error) {
    handleError(error, `SecureStore.remove(${key})`);
    return false;
  }
}

/**
 * Save JSON object to secure storage
 */
export async function secureStoreSaveJSON<T>(
  key: string,
  value: T,
  options?: SecureStorageOptions
): Promise<boolean> {
  try {
    const jsonString = JSON.stringify(value);
    return await secureStoreSave(key, jsonString, options);
  } catch (error) {
    handleError(error, `SecureStore.saveJSON(${key})`);
    return false;
  }
}

/**
 * Get JSON object from secure storage
 */
export async function secureStoreGetJSON<T>(
  key: string,
  options?: SecureStorageOptions
): Promise<T | null> {
  try {
    const jsonString = await secureStoreGet(key, options);
    if (!jsonString) return null;
    
    return JSON.parse(jsonString) as T;
  } catch (error) {
    handleError(error, `SecureStore.getJSON(${key})`);
    return null;
  }
}

/**
 * Check if a key exists in secure storage
 */
export async function secureStoreHas(
  key: string,
  options?: SecureStorageOptions
): Promise<boolean> {
  const value = await secureStoreGet(key, options);
  return value !== null;
}

/**
 * Clear multiple keys from secure storage
 */
export async function secureStoreClearMany(
  keys: string[],
  options?: SecureStorageOptions
): Promise<boolean> {
  try {
    await Promise.all(keys.map((key) => secureStoreRemove(key, options)));
    logger.debug(`Cleared ${keys.length} keys from secure storage`);
    return true;
  } catch (error) {
    handleError(error, 'SecureStore.clearMany');
    return false;
  }
}

/**
 * Save with expiration time (stores timestamp)
 */
export async function secureStoreSaveWithExpiry(
  key: string,
  value: string,
  expiryMs: number,
  options?: SecureStorageOptions
): Promise<boolean> {
  try {
    const data = {
      value,
      expiry: Date.now() + expiryMs,
    };
    const jsonString = JSON.stringify(data);
    return await secureStoreSave(key, jsonString, options);
  } catch (error) {
    handleError(error, `SecureStore.saveWithExpiry(${key})`);
    return false;
  }
}

/**
 * Get value with expiration check
 */
export async function secureStoreGetWithExpiry(
  key: string,
  options?: SecureStorageOptions
): Promise<string | null> {
  try {
    const jsonString = await secureStoreGet(key, options);
    if (!jsonString) return null;

    const data = JSON.parse(jsonString);
    
    // Check if expired
    if (Date.now() > data.expiry) {
      await secureStoreRemove(key, options);
      logger.debug(`Expired value removed: ${key}`);
      return null;
    }

    return data.value;
  } catch (error) {
    handleError(error, `SecureStore.getWithExpiry(${key})`);
    return null;
  }
}

/**
 * Batch save multiple key-value pairs
 */
export async function secureStoreSaveBatch(
  items: Record<string, string>,
  options?: SecureStorageOptions
): Promise<boolean> {
  try {
    await Promise.all(
      Object.entries(items).map(([key, value]) =>
        secureStoreSave(key, value, options)
      )
    );
    logger.debug(`Batch saved ${Object.keys(items).length} items`);
    return true;
  } catch (error) {
    handleError(error, 'SecureStore.saveBatch');
    return false;
  }
}

/**
 * Batch get multiple keys
 */
export async function secureStoreGetBatch(
  keys: string[],
  options?: SecureStorageOptions
): Promise<Record<string, string | null>> {
  try {
    const values = await Promise.all(
      keys.map((key) => secureStoreGet(key, options))
    );
    
    return keys.reduce((acc, key, index) => {
      acc[key] = values[index];
      return acc;
    }, {} as Record<string, string | null>);
  } catch (error) {
    handleError(error, 'SecureStore.getBatch');
    return {};
  }
}

export default {
  save: secureStoreSave,
  get: secureStoreGet,
  remove: secureStoreRemove,
  saveJSON: secureStoreSaveJSON,
  getJSON: secureStoreGetJSON,
  has: secureStoreHas,
  clearMany: secureStoreClearMany,
  saveWithExpiry: secureStoreSaveWithExpiry,
  getWithExpiry: secureStoreGetWithExpiry,
  saveBatch: secureStoreSaveBatch,
  getBatch: secureStoreGetBatch,
};
