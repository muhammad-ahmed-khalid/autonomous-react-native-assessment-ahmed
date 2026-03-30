/**
 * API Types
 * 
 * Type definitions for API requests and responses.
 * Provides type safety throughout the application.
 */

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  problem?: string;
  status?: number;
  originalError?: any;
}

/**
 * API Error structure
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

/**
 * Normalized Error structure
 */
export interface NormalizedError {
  message: string;
  code?: string;
  status?: number;
  context?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  skip: number;
  limit: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Auth API Types
 */
export namespace AuthAPI {
  export interface LoginRequest {
    username: string;
    password: string;
    expiresInMins?: number;
  }

  export interface LoginResponse {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    gender: string;
    image: string;
    token: string;
    refreshToken?: string;
  }

  export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }

  export interface RegisterResponse {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  }

  export interface GetCurrentUserResponse {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    gender: string;
    image: string;
  }

  export interface RefreshTokenRequest {
    refreshToken: string;
    expiresInMins?: number;
  }

  export interface RefreshTokenResponse {
    token: string;
    refreshToken: string;
  }
}

/**
 * App/Product API Types
 */
export namespace AppAPI {
  export interface App {
    id: number;
    title: string;
    description: string;
    price: number;
    discountPercentage: number;
    rating: number;
    stock: number;
    brand: string;
    category: string;
    thumbnail: string;
    images: string[];
  }

  export interface GetAppsRequest {
    limit?: number;
    skip?: number;
  }

  export interface GetAppsResponse {
    products: App[];
    total: number;
    skip: number;
    limit: number;
  }

  export interface SearchAppsRequest {
    query: string;
    limit?: number;
    skip?: number;
  }

  export interface SearchAppsResponse {
    products: App[];
    total: number;
    skip: number;
    limit: number;
  }

  export interface GetAppByIdRequest {
    id: number;
  }

  export interface GetAppByIdResponse extends App {}

  export interface CreateAppRequest {
    title: string;
    description: string;
    price?: number;
    category?: string;
    brand?: string;
    thumbnail?: string;
  }

  export interface CreateAppResponse extends App {}

  export interface UpdateAppRequest {
    id: number;
    title?: string;
    description?: string;
    price?: number;
    category?: string;
    brand?: string;
    thumbnail?: string;
  }

  export interface UpdateAppResponse extends App {}

  export interface DeleteAppRequest {
    id: number;
  }

  export interface DeleteAppResponse extends App {
    isDeleted: boolean;
    deletedOn: string;
  }
}

/**
 * Subscription API Types (for future use)
 */
export namespace SubscriptionAPI {
  export interface Plan {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: 'monthly' | 'yearly';
    features: string[];
  }

  export interface Subscription {
    id: string;
    userId: string;
    planId: string;
    status: 'active' | 'canceled' | 'past_due' | 'trialing';
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  }

  export interface GetPlansResponse {
    plans: Plan[];
  }

  export interface CreateSubscriptionRequest {
    planId: string;
    paymentMethodId: string;
  }

  export interface CreateSubscriptionResponse extends Subscription {}

  export interface CancelSubscriptionRequest {
    subscriptionId: string;
    cancelAtPeriodEnd?: boolean;
  }

  export interface CancelSubscriptionResponse extends Subscription {}
}

/**
 * Notification API Types (for future use)
 */
export namespace NotificationAPI {
  export interface Notification {
    id: string;
    userId: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    read: boolean;
    createdAt: string;
  }

  export interface GetNotificationsRequest {
    limit?: number;
    skip?: number;
    unreadOnly?: boolean;
  }

  export interface GetNotificationsResponse {
    notifications: Notification[];
    total: number;
    unreadCount: number;
  }

  export interface MarkAsReadRequest {
    notificationIds: string[];
  }

  export interface RegisterDeviceRequest {
    token: string;
    platform: 'ios' | 'android';
    deviceId: string;
  }

  export interface RegisterDeviceResponse {
    success: boolean;
  }
}

/**
 * File Upload API Types
 */
export namespace UploadAPI {
  export interface UploadRequest {
    uri: string;
    type: string;
    name: string;
    folder?: string;
  }

  export interface UploadResponse {
    url: string;
    publicId?: string;
    width?: number;
    height?: number;
    format?: string;
    bytes?: number;
  }

  export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
  }
}

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Request config
 */
export interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * API Client interface
 */
export interface ApiClient {
  get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
  setAuthToken(token: string | null): void;
}

/**
 * API Interceptors
 */
export interface RequestInterceptor {
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  onRequestError?: (error: any) => any;
}

export interface ResponseInterceptor {
  onResponse?: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
  onResponseError?: (error: any) => any;
}

/**
 * Type guards
 */
export function isApiResponse<T>(value: any): value is ApiResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'ok' in value &&
    typeof value.ok === 'boolean'
  );
}

export function isApiError(value: any): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string'
  );
}

export function isPaginatedResponse<T>(value: any): value is PaginatedResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    Array.isArray(value.data) &&
    'pagination' in value &&
    typeof value.pagination === 'object'
  );
}
