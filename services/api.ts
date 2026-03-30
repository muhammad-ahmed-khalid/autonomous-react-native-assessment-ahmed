/**
 * ============================================================================
 * API Service - Refactored
 * ============================================================================
 * 
 * Modern, production-ready API service with:
 * - Type-safe requests and responses
 * - Centralized error handling
 * - Structured logging
 * - Request/Response interceptors
 * - Token management
 * 
 * Built with apisauce for reliability, enhanced with custom utilities.
 */

import { create, ApiResponse as ApisauceResponse } from 'apisauce';
import { LoginCredentials, User, RegisterCredentials } from '@/types/auth';
import { App } from '@/types/app';
import type { ApiResponse, AuthAPI, AppAPI } from '@/types/api';
import { getUserToken } from '@/utils/authToken';
import { logger } from '@/utils/logger';
import { handleError, normalizeError } from '@/utils/errorHandler';
import { API_CONFIG, DEMO_CREDENTIALS, STORAGE_KEYS } from '@/constants/AppConstants';

/**
 * ============================================================================
 * API Instance Creation
 * ============================================================================
 */

const api = create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * ============================================================================
 * Request Interceptor: Auto-inject Bearer Token
 * ============================================================================
 */
api.addRequestTransform(async (request) => {
  const token = await getUserToken();
  if (token && request.headers) {
    request.headers['Authorization'] = `Bearer ${token}`;
    logger.debug('Auth token injected into request', { context: 'API' });
  }
});

/**
 * ============================================================================
 * Response Interceptor: Logging & Error Normalization
 * ============================================================================
 */
api.addResponseTransform((response) => {
  // Log API responses
  logger.apiResponse(
    response.config?.method || 'UNKNOWN',
    response.config?.url || 'unknown',
    response.status || 0,
    response.data,
    response.ok
  );

  // Normalize error messages for failed responses
  if (!response.ok) {
    const data = response.data as any;
    const errorMessage = 
      data?.message || 
      data?.error || 
      data?.errors?.[0]?.message ||
      'An unexpected error occurred';
    
    // Attach normalized error to response
    (response as any).normalizedError = errorMessage;
  }
});

/**
 * ============================================================================
 * Helper Functions
 * ============================================================================
 */

/**
 * Extract error message from API response
 */
const getErrorMessage = (response: ApisauceResponse<any>, fallback: string): string => {
  return (response as any).normalizedError || fallback;
};

/**
 * Transform DummyJSON product to App model
 */
const transformProductToApp = (product: any, index: number = 0): App => ({
  id: product.id.toString(),
  name: product.title,
  logo: product.thumbnail || 'https://via.placeholder.com/150',
  subscriptionStatus: ['active', 'inactive', 'trial', 'expired'][index % 4] as App['subscriptionStatus'],
  lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  description: product.description || '',
});

/**
 * ============================================================================
 * Authentication Service
 * ============================================================================
 */

export const authService = {
  /**
   * Authenticate user with credentials
   */
  login: async (credentials: LoginCredentials): Promise<User> => {
    try {
      logger.info('Attempting login', { context: 'Auth', data: { username: credentials.username } });
      
      const response = await api.post<User>('/auth/login', credentials);
      
      if (!response.ok) {
        const errorMsg = getErrorMessage(response, 'Login failed');
        throw new Error(errorMsg);
      }
      
      logger.success('Login successful', { context: 'Auth' });
      return response.data as User;
    } catch (error) {
      const errorMsg = handleError(error, 'authService.login');
      throw new Error(errorMsg);
    }
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (token?: string): Promise<User> => {
    try {
      logger.debug('Fetching current user', { context: 'Auth' });
      
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const response = await api.get<User>('/auth/me', {}, { headers });
      
      if (!response.ok) {
        const errorMsg = getErrorMessage(response, 'Failed to get user');
        throw new Error(errorMsg);
      }
      
      logger.success('User data retrieved', { context: 'Auth' });
      return response.data as User;
    } catch (error) {
      const errorMsg = handleError(error, 'authService.getCurrentUser');
      throw new Error(errorMsg);
    }
  },

  /**
   * Register new user
   * 
   * NOTE: DummyJSON doesn't have real registration.
   * Using default test credentials for demo purposes.
   */
  register: async (userData: RegisterCredentials): Promise<User> => {
    try {
      logger.info('Attempting registration', { 
        context: 'Auth', 
        data: { email: userData.email } 
      });
      
      // Simulate registration - replace with real endpoint when available
      const response = await api.post<User>('/auth/login', {
        username: DEMO_CREDENTIALS.USERNAME,
        password: DEMO_CREDENTIALS.PASSWORD,
      });
      
      if (!response.ok) {
        const errorMsg = getErrorMessage(response, 'Registration failed');
        throw new Error(errorMsg);
      }
      
      logger.success('Registration successful', { context: 'Auth' });
      return response.data as User;
    } catch (error) {
      const errorMsg = handleError(error, 'authService.register');
      throw new Error(errorMsg);
    }
  },
};

/**
 * ============================================================================
 * App Service
 * ============================================================================
 */

export const appService = {
  /**
   * Get paginated list of apps
   */
  getApps: async (page: number = 1, limit: number = 10): Promise<App[]> => {
    try {
      const skip = (page - 1) * limit;
      logger.debug('Fetching apps', { 
        context: 'AppService', 
        data: { page, limit, skip } 
      });
      
      const response = await api.get(`/products?limit=${limit}&skip=${skip}`);
      
      if (!response.ok) {
        const errorMsg = getErrorMessage(response, 'Failed to fetch apps');
        throw new Error(errorMsg);
      }
      
      const products = (response.data as any)?.products || [];
      logger.success(`Fetched ${products.length} apps`, { context: 'AppService' });
      
      return products.map(transformProductToApp);
    } catch (error) {
      const errorMsg = handleError(error, 'appService.getApps');
      throw new Error(errorMsg);
    }
  },

  /**
   * Search apps by query
   */
  searchApps: async (query: string, page: number = 1, limit: number = 10): Promise<App[]> => {
    try {
      logger.debug('Searching apps', { 
        context: 'AppService', 
        data: { query, page, limit } 
      });
      
      const response = await api.get(`/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      
      if (!response.ok) {
        const errorMsg = getErrorMessage(response, 'Failed to search apps');
        throw new Error(errorMsg);
      }
      
      const products = (response.data as any)?.products || [];
      logger.success(`Found ${products.length} apps matching "${query}"`, { context: 'AppService' });
      
      return products.map(transformProductToApp);
    } catch (error) {
      const errorMsg = handleError(error, 'appService.searchApps');
      throw new Error(errorMsg);
    }
  },

  /**
   * Get single app by ID
   */
  getAppById: async (id: string): Promise<App> => {
    try {
      logger.debug('Fetching app by ID', { context: 'AppService', data: { id } });
      
      const response = await api.get(`/products/${id}`);
      
      if (!response.ok) {
        const errorMsg = getErrorMessage(response, 'Failed to fetch app');
        throw new Error(errorMsg);
      }
      
      logger.success('App retrieved', { context: 'AppService' });
      return transformProductToApp(response.data, 0);
    } catch (error) {
      const errorMsg = handleError(error, 'appService.getAppById');
      throw new Error(errorMsg);
    }
  },

  /**
   * Create new app
   */
  createApp: async (appData: Partial<App>): Promise<App> => {
    try {
      logger.info('Creating new app', { context: 'AppService', data: { name: appData.name } });
      
      const response = await api.post('/products/add', {
        title: appData.name,
        description: appData.description,
        thumbnail: appData.logo,
      });
      
      if (!response.ok) {
        const errorMsg = getErrorMessage(response, 'Failed to create app');
        throw new Error(errorMsg);
      }
      
      const product = response.data as any;
      const newApp: App = {
        id: product.id.toString(),
        name: product.title,
        logo: product.thumbnail || appData.logo || 'https://via.placeholder.com/150',
        subscriptionStatus: appData.subscriptionStatus || 'active',
        lastUpdated: new Date().toISOString(),
        description: product.description || '',
      };
      
      logger.success('App created successfully', { context: 'AppService' });
      return newApp;
    } catch (error) {
      const errorMsg = handleError(error, 'appService.createApp');
      throw new Error(errorMsg);
    }
  },

  /**
   * Update existing app
   */
  updateApp: async (id: string, appData: Partial<App>): Promise<App> => {
    try {
      logger.info('Updating app', { context: 'AppService', data: { id, name: appData.name } });
      
      const response = await api.put(`/products/${id}`, {
        title: appData.name,
        description: appData.description,
        thumbnail: appData.logo,
      });
      
      if (!response.ok) {
        const errorMsg = getErrorMessage(response, 'Failed to update app');
        throw new Error(errorMsg);
      }
      
      const product = response.data as any;
      const updatedApp: App = {
        id: product.id.toString(),
        name: product.title || appData.name || '',
        logo: product.thumbnail || appData.logo || 'https://via.placeholder.com/150',
        subscriptionStatus: appData.subscriptionStatus || 'active',
        lastUpdated: new Date().toISOString(),
        description: product.description || appData.description || '',
      };
      
      logger.success('App updated successfully', { context: 'AppService' });
      return updatedApp;
    } catch (error) {
      const errorMsg = handleError(error, 'appService.updateApp');
      throw new Error(errorMsg);
    }
  },

  /**
   * Delete app
   */
  deleteApp: async (id: string): Promise<void> => {
    try {
      logger.info('Deleting app', { context: 'AppService', data: { id } });
      
      const response = await api.delete(`/products/${id}`);
      
      if (!response.ok) {
        const errorMsg = getErrorMessage(response, 'Failed to delete app');
        throw new Error(errorMsg);
      }
      
      logger.success('App deleted successfully', { context: 'AppService' });
    } catch (error) {
      const errorMsg = handleError(error, 'appService.deleteApp');
      throw new Error(errorMsg);
    }
  },
};

/**
 * ============================================================================
 * Exports
 * ============================================================================
 */

export default api;
