/**
 * usePushNotifications Hook
 * 
 * React hook for managing push notifications in your components.
 * Handles initialization, token management, permission requests, and cleanup.
 * 
 * Usage:
 * ```tsx
 * const { 
 *   fcmToken, 
 *   hasPermission, 
 *   requestPermission,
 *   isLoading,
 *   error 
 * } = usePushNotifications();
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import * as PushNotificationService from './pushNotificationService';

// Types
interface UsePushNotificationsReturn {
  fcmToken: string | null;
  apnsToken: string | null;
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  refreshToken: () => Promise<void>;
  deleteToken: () => Promise<void>;
  subscribeToTopic: (topic: string) => Promise<boolean>;
  unsubscribeFromTopic: (topic: string) => Promise<boolean>;
  clearNotifications: () => Promise<void>;
}

/**
 * Custom hook for push notification management
 * 
 * Features:
 * - Automatic initialization on mount
 * - Token refresh handling
 * - Permission management
 * - Foreground/background/quit state handling
 * - Automatic cleanup on unmount
 * - App state monitoring (foreground/background transitions)
 */
export const usePushNotifications = (): UsePushNotificationsReturn => {
  // State
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [apnsToken, setApnsToken] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup
  const unsubscribeCallbacks = useRef<Array<() => void>>([]);
  const appStateSubscription = useRef<any>(null);

  /**
   * Check and update permission status
   */
  const checkPermissionStatus = useCallback(async () => {
    try {
      const authStatus = await PushNotificationService.checkNotificationPermission();
      const granted =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      setHasPermission(granted);
      return granted;
    } catch (err) {
      console.error('Error checking permission:', err);
      setError('Failed to check notification permission');
      return false;
    }
  }, []);

  /**
   * Request notification permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const granted = await PushNotificationService.requestNotificationPermission();
      setHasPermission(granted);

      if (!granted) {
        setError('Notification permission denied');
        
        // Show settings alert if permission is blocked
        const authStatus = await PushNotificationService.checkNotificationPermission();
        if (authStatus === messaging.AuthorizationStatus.DENIED) {
          PushNotificationService.showSettingsAlert();
        }
      } else {
        // Get token after permission granted
        await refreshToken();
      }

      return granted;
    } catch (err: any) {
      console.error('Error requesting permission:', err);
      setError(err.message || 'Failed to request notification permission');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get/Refresh FCM token
   */
  const refreshToken = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get FCM token
      const token = await PushNotificationService.getFCMToken();
      setFcmToken(token);

      // Get APNs token (iOS only)
      if (Platform.OS === 'ios') {
        const apns = await PushNotificationService.getAPNsToken();
        setApnsToken(apns);
      }

      if (!token) {
        setError('Failed to get FCM token');
      }
    } catch (err: any) {
      console.error('Error refreshing token:', err);
      setError(err.message || 'Failed to refresh FCM token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete FCM token (call on logout)
   */
  const deleteToken = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const success = await PushNotificationService.deleteFCMToken();
      
      if (success) {
        setFcmToken(null);
        setApnsToken(null);
        console.log('✅ Token deleted successfully');
      } else {
        setError('Failed to delete token');
      }
    } catch (err: any) {
      console.error('Error deleting token:', err);
      setError(err.message || 'Failed to delete FCM token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Subscribe to a topic
   */
  const subscribeToTopic = useCallback(async (topic: string): Promise<boolean> => {
    try {
      return await PushNotificationService.subscribeToTopic(topic);
    } catch (err) {
      console.error('Error subscribing to topic:', err);
      return false;
    }
  }, []);

  /**
   * Unsubscribe from a topic
   */
  const unsubscribeFromTopic = useCallback(async (topic: string): Promise<boolean> => {
    try {
      return await PushNotificationService.unsubscribeFromTopic(topic);
    } catch (err) {
      console.error('Error unsubscribing from topic:', err);
      return false;
    }
  }, []);

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(async () => {
    try {
      await PushNotificationService.clearAllNotifications();
      // Badge is already cleared in clearAllNotifications
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  }, []);

  /**
   * Handle app state changes (foreground/background)
   * Useful for refreshing data when app comes to foreground
   */
  const handleAppStateChange = useCallback(async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      console.log('📱 App has come to the foreground');
      
      // Refresh permission status
      await checkPermissionStatus();
      
      // Don't clear badge - keep it persistent for user to see unread count
    } else if (nextAppState === 'background') {
      console.log('📱 App has gone to the background');
    }
  }, [checkPermissionStatus]);

  /**
   * Initialize push notifications on mount
   */
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        console.log('🚀 Initializing push notifications hook...');

        // Create notification channels first (required for local notifications on Android)
        await PushNotificationService.createNotificationChannels();

        // Check permission status
        const granted = await checkPermissionStatus();
        
        if (granted) {
          // Get stored token first (faster than fetching new one)
          const storedToken = await PushNotificationService.getStoredFCMToken();
          if (storedToken && isMounted) {
            setFcmToken(storedToken);
          }

          // Then refresh to get latest token
          await refreshToken();
        }

        // Setup listeners
        
        // 1. Token refresh listener
        const unsubscribeTokenRefresh = PushNotificationService.onTokenRefresh((token) => {
          if (isMounted) {
            console.log('🔄 Token refreshed in hook');
            setFcmToken(token);
          }
        });
        unsubscribeCallbacks.current.push(unsubscribeTokenRefresh);

        // 2. Foreground message listener
        const unsubscribeForeground = PushNotificationService.onForegroundMessage();
        unsubscribeCallbacks.current.push(unsubscribeForeground);

        // 3. Notification press listener
        const unsubscribePress = PushNotificationService.setupNotificationPressHandler();
        unsubscribeCallbacks.current.push(unsubscribePress);

        // 4. Notification opened app listener (background → foreground)
        const unsubscribeOpenedApp = PushNotificationService.onNotificationOpenedApp();
        unsubscribeCallbacks.current.push(unsubscribeOpenedApp);

        // 5. Check if app was opened from quit state
        await PushNotificationService.getInitialNotification();

        // 6. Setup app state listener
        appStateSubscription.current = AppState.addEventListener('change', handleAppStateChange);

        console.log('✅ Push notifications hook initialized');
      } catch (err: any) {
        console.error('❌ Error initializing push notifications:', err);
        if (isMounted) {
          setError(err.message || 'Failed to initialize push notifications');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      
      console.log('🧹 Cleaning up push notifications hook...');
      
      // Unsubscribe all listeners
      PushNotificationService.cleanupPushNotifications(unsubscribeCallbacks.current);
      unsubscribeCallbacks.current = [];
      
      // Remove app state listener
      if (appStateSubscription.current) {
        appStateSubscription.current.remove();
      }
    };
  }, [checkPermissionStatus, handleAppStateChange, refreshToken]);

  return {
    fcmToken,
    apnsToken,
    hasPermission,
    isLoading,
    error,
    requestPermission,
    refreshToken,
    deleteToken,
    subscribeToTopic,
    unsubscribeFromTopic,
    clearNotifications,
  };
};

export default usePushNotifications;
