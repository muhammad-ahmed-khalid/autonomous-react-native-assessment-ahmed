/**
 * Logger Utility
 * 
 * Centralized logging with environment-based control.
 * Provides structured, type-safe logging throughout the application.
 * 
 * Features:
 * - Automatic __DEV__ check
 * - Colored output for different log levels
 * - Structured log format
 * - Easy to disable in production
 * - Type-safe methods
 */

type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'debug';

interface LogOptions {
  context?: string;
  data?: any;
}

class Logger {
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = __DEV__;
  }

  /**
   * Enable or disable logging
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * General information logging
   */
  info(message: string, options?: LogOptions): void {
    this.log('info', message, options);
  }

  /**
   * Success logging (green)
   */
  success(message: string, options?: LogOptions): void {
    this.log('success', message, options);
  }

  /**
   * Warning logging (yellow)
   */  warning(message: string, options?: LogOptions): void {
    this.log('warning', message, options);
  }

  /**
   * Error logging (red)
   */
  error(message: string, error?: Error | unknown, options?: LogOptions): void {
    if (!this.isEnabled) return;

      const emoji = '❌';
    const timestamp = new Date().toISOString();
    
    console.error(
      `${emoji} [${timestamp}]${options?.context ? ` [${options.context}]` : ''}: ${message}`
    );

    if (error) {
      console.error('Error details:', error);
    }

    if (options?.data) {
      console.error('Additional data:', options.data);
    }
  }

  /**
   * Debug logging (only in development)
   */
  debug(message: string, options?: LogOptions): void {
    if (!__DEV__) return;
    this.log('debug', message, options);
  }

  /**
   * API request logging
   */
  apiRequest(method: string, url: string, data?: any): void {
    if (!this.isEnabled) return;
    
    console.log('📡 API Request:', {
      method: method.toUpperCase(),
      url,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * API response logging
   */
  apiResponse(method: string, url: string, status: number, data?: any, ok?: boolean): void {
    if (!this.isEnabled) return;
    
    const emoji = ok ? '✅' : '❌';
    console.log(`${emoji} API Response:`, {
      method: method.toUpperCase(),
      url,
      status,
      ok,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Navigation logging
   */
  navigation(from: string, to: string): void {
    this.info(`Navigation: ${from} → ${to}`, { context: 'Navigation' });
  }

  /**
   * Store action logging
   */
  storeAction(action: string, payload?: any): void {
    this.debug(`Redux Action: ${action}`, { 
      context: 'Redux',
      data: payload 
    });
  }

  /**
   * Generic logging method
   */
  private log(level: LogLevel, message: string, options?: LogOptions): void {
    if (!this.isEnabled) return;

    const emojis: Record<LogLevel, string> = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      debug: '🔍',
    };

    const emoji = emojis[level];
    const timestamp = new Date().toISOString();
    const contextStr = options?.context ? ` [${options.context}]` : '';
    
    const logMethod = level === 'error' ? console.error : 
                      level === 'warning' ? console.warn : 
                      console.log;

    logMethod(
      `${emoji} [${timestamp}]${contextStr}: ${message}`
    );

    if (options?.data) {
      logMethod('Data:', options.data);
    }
  }

  /**
   * Group related logs
   */
  group(label: string, callback: () => void): void {
    if (!this.isEnabled) {
      callback();
      return;
    }

    console.group(`📁 ${label}`);
    try {
      callback();
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Table logging for arrays of objects
   */
  table(data: any[], label?: string): void {
    if (!this.isEnabled) return;

    if (label) {
      console.log(`📊 ${label}`);
    }
    console.table(data);
  }
}

// Export singleton instance
export const logger = new Logger();

// Named exports for convenience
export const {
  info,
  success,
  warning,
  error,
  debug,
  apiRequest,
  apiResponse,
  navigation,
  storeAction,
  group,
  table,
} = logger;

export default logger;
