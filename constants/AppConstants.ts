/**
 * Application Constants
 * 
 * Centralized configuration and constants for the entire application.
 * Makes it easy to manage and update app-wide settings.
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: 'https://dummyjson.com',
  TIMEOUT: 15000, // 15 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

/**
 * Storage Keys
 * Centralized to avoid typos and ensure consistency
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH_USER: 'auth_user',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  BIOMETRIC_USER: 'biometric_user',
  BIOMETRIC_TOKEN: 'biometric_token',
  FCM_TOKEN: 'fcm_token',
  FCM_TOKEN_SENT: 'fcm_token_sent',
  THEME_MODE: 'theme_mode',
  LANGUAGE: 'language',
} as const;

/**
 * Pagination Configuration
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
  INITIAL_PAGE: 1,
  LOAD_MORE_THRESHOLD: 0.5,
} as const;

/**
 * Image Configuration
 */
export const IMAGE_CONFIG = {
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  QUALITY: 0.8,
  ASPECT_RATIO: [1, 1] as [number, number],
  PLACEHOLDER_URL: 'https://via.placeholder.com/150',
} as const;

/**
 * Form Validation
 */
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
} as const;

/**
 * Debounce Delays (in milliseconds)
 */
export const DEBOUNCE_DELAYS = {
  SEARCH: 500,
  INPUT: 300,
  SCROLL: 100,
} as const;

/**
 * Animation Durations (in milliseconds)
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

/**
 * Biometric Authentication
 */
export const BIOMETRIC_CONFIG = {
  PROMPT_MESSAGE: 'Authenticate to continue',
  FALLBACK_LABEL: 'Use Password',
  CANCEL_LABEL: 'Cancel',
  DISABLE_DEVICE_FALLBACK: false,
} as const;

/**
 * Notification Configuration
 */
export const NOTIFICATION_CONFIG = {
  CHANNELS: {
    DEFAULT: {
      id: 'default',
      name: 'Default Notifications',
      importance: 4,
    },
    CHAT: {
      id: 'chat',
      name: 'Chat Messages',
      importance: 5,
    },
    ORDERS: {
      id: 'orders',
      name: 'Order Updates',
      importance: 4,
    },
    PROMOTIONS: {
      id: 'promotions',
      name: 'Promotions',
      importance: 3,
    },
  },
  BADGE: {
    INITIAL_COUNT: 0,
    INCREMENT: 1,
  },
  AUTO_CANCEL: true,
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Session expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful',
  LOGOUT: 'Logged out successfully',
  REGISTER: 'Registration successful',
  CREATE: 'Created successfully',
  UPDATE: 'Updated successfully',
  DELETE: 'Deleted successfully',
  SAVE: 'Saved successfully',
} as const;

/**
 * Route Names
 */
export const ROUTES = {
  AUTH: {
    SIGN_IN: '/(auth)/sign-in',
    SIGN_UP: '/(auth)/sign-up',
    FORGOT_PASSWORD: '/(auth)/forgot-password',
  },
  APP: {
    DASHBOARD: '/(app)/(tabs)/index',
    APP_MANAGEMENT: '/(app)/(tabs)/AppManagementScreen',
    SUBSCRIPTION: '/(app)/(tabs)/subscription',
    SETTINGS: '/(app)/(tabs)/settings',
    APP_FORM: '/(app)/app-form',
    MODAL: '/modal',
  },
  SUBSCRIPTION: {
    INDEX: '/subscription/index',
    PLANS: '/subscription/plans',
    DETAIL: '/subscription/detail',
    PAYMENT: '/subscription/payment',
    BILLING: '/subscription/billing-history',
  },
} as const;

/**
 * Demo Credentials (for testing with DummyJSON API)
 */
export const DEMO_CREDENTIALS = {
  USERNAME: 'emilys',
  PASSWORD: 'emilyspass',
} as const;

/**
 * App Metadata
 */
export const APP_META = {
  NAME: 'App Manager',
  VERSION: '1.0.0',
  BUILD_NUMBER: 1,
} as const;

/**
 * Social Media Links (example)
 */
export const SOCIAL_LINKS = {
  SUPPORT_EMAIL: 'support@example.com',
  PRIVACY_POLICY: 'https://example.com/privacy',
  TERMS_OF_SERVICE: 'https://example.com/terms',
  WEBSITE: 'https://example.com',
} as const;

/**
 * Type exports for better TypeScript support
 */
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
export type RouteKey = typeof ROUTES[keyof typeof ROUTES][keyof typeof ROUTES[keyof typeof ROUTES]];
export type ErrorMessage = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES];
export type SuccessMessage = typeof SUCCESS_MESSAGES[keyof typeof SUCCESS_MESSAGES];
