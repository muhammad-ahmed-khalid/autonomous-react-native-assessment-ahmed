/**
 * Push Notification Service
 * 
 * Complete FCM push notification service using @react-native-firebase/messaging
 * and @notifee/react-native for advanced notification handling.
 * 
 * Features:
 * - FCM token management and refresh
 * - Foreground, background, and quit state notification handling
 * - Deep linking / navigation support
 * - Token storage and backend sync
 * - Android notification channels
 * - iOS APNs token support
 * - Error handling and logging
 */

import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import * as SecureStore from 'expo-secure-store';
import { Platform, Alert, Linking } from 'react-native';

// Types
export interface NotificationData {
  type?: string;
  screen?: string;
  orderId?: string;
  chatId?: string;
  postId?: string;
  [key: string]: any;
}

export interface PushNotification {
  title?: string;
  body?: string;
  imageUrl?: string;
  data?: NotificationData;
}

// Constants
const FCM_TOKEN_KEY = 'fcm_token';
const APNS_TOKEN_KEY = 'apns_token';
const DEFAULT_CHANNEL_ID = 'default_channel';
const HIGH_PRIORITY_CHANNEL_ID = 'high_priority_channel';

/**
 * Navigation reference for deep linking
 * This will be set from your navigation container
 */
let navigationRef: any = null;

export const setNavigationRef = (ref: any) => {
  navigationRef = ref;
};

/**
 * Backend API endpoint for token management
 * Replace with your actual API endpoint
 */
const API_BASE_URL = 'https://your-api.com'; // TODO: Replace with your API URL

/**
 * Send FCM token to backend
 */
const sendTokenToBackend = async (token: string, platform: string) => {
  try {
    // TODO: Replace with your actual API call
    const response = await fetch(`${API_BASE_URL}/api/devices/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add your auth token here if needed
        // 'Authorization': `Bearer ${yourAuthToken}`,
      },
      body: JSON.stringify({
        fcmToken: token,
        platform,
        deviceId: Platform.OS === 'ios' ? 'ios-device-id' : 'android-device-id',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to register device token');
    }

    console.log('✅ FCM Token sent to backend successfully');
  } catch (error) {
    console.error('❌ Error sending token to backend:', error);
    // Optionally retry or queue for later
  }
};

/**
 * Create default notification channels for Android
 * Required for Android 8.0 (API 26) and above
 */
export const createNotificationChannels = async () => {
  if (Platform.OS === 'android') {
    try {
      // Default channel
      await notifee.createChannel({
        id: DEFAULT_CHANNEL_ID,
        name: 'Default Notifications',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
        vibrationPattern: [300, 500],
        badge: true, // Enable badge counts
      });

      // High priority channel (for urgent notifications)
      await notifee.createChannel({
        id: HIGH_PRIORITY_CHANNEL_ID,
        name: 'High Priority',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
        vibrationPattern: [300, 500, 300, 500],
        badge: true, // Enable badge counts
      });

      console.log('✅ Notification channels created');
    } catch (error) {
      console.error('❌ Error creating notification channels:', error);
    }
  }
};

/**
 * Request notification permissions
 * Handles both iOS and Android (13+) permission requests
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ Notification permission granted:', authStatus);
      return true;
    } else {
      console.log('❌ Notification permission denied:', authStatus);
      return false;
    }
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Check current notification permission status
 */
export const checkNotificationPermission = async (): Promise<number> => {
  try {
    const authStatus = await messaging().hasPermission();
    return authStatus;
  } catch (error) {
    console.error('❌ Error checking notification permission:', error);
    return messaging.AuthorizationStatus.NOT_DETERMINED;
  }
};

/**
 * Show alert to open app settings
 * Use when permission is permanently denied
 */
export const showSettingsAlert = () => {
  Alert.alert(
    'Notifications Disabled',
    'Please enable notifications in your device settings to receive updates.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open Settings',
        onPress: () => {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            Linking.openSettings();
          }
        },
      },
    ]
  );
};

/**
 * Get FCM token
 * Returns the device's unique Firebase Cloud Messaging token
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    // Check permission first
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('⚠️ Cannot get FCM token: Permission not granted');
      return null;
    }

    // Get FCM token
    const fcmToken = await messaging().getToken();
    
    if (fcmToken) {
      console.log('✅ FCM Token:', fcmToken);
      
      // Store token locally
      await SecureStore.setItemAsync(FCM_TOKEN_KEY, fcmToken);
      
      // Send to backend
      await sendTokenToBackend(fcmToken, Platform.OS);
      
      return fcmToken;
    } else {
      console.log('⚠️ No FCM token available');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
    return null;
  }
};

/**
 * Get APNs token (iOS only)
 * Returns the Apple Push Notification service token
 */
export const getAPNsToken = async (): Promise<string | null> => {
  if (Platform.OS !== 'ios') {
    return null;
  }

  try {
    const apnsToken = await messaging().getAPNSToken();
    
    if (apnsToken) {
      console.log('✅ APNs Token:', apnsToken);
      await SecureStore.setItemAsync(APNS_TOKEN_KEY, apnsToken);
      return apnsToken;
    } else {
      console.log('⚠️ No APNs token available yet');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting APNs token:', error);
    return null;
  }
};

/**
 * Get stored FCM token from AsyncStorage
 */
export const getStoredFCMToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(FCM_TOKEN_KEY);
  } catch (error) {
    console.error('❌ Error getting stored FCM token:', error);
    return null;
  }
};

/**
 * Delete FCM token
 * Call when user logs out
 */
export const deleteFCMToken = async (): Promise<boolean> => {
  try {
    await messaging().deleteToken();
    await SecureStore.deleteItemAsync(FCM_TOKEN_KEY);
    await SecureStore.deleteItemAsync(APNS_TOKEN_KEY);
    
    // TODO: Notify backend to remove token
    // await fetch(`${API_BASE_URL}/api/devices/unregister`, { ... });
    
    console.log('✅ FCM token deleted');
    return true;
  } catch (error) {
    console.error('❌ Error deleting FCM token:', error);
    return false;
  }
};

/**
 * Handle token refresh
 * Firebase automatically refreshes tokens periodically
 */
export const onTokenRefresh = (callback?: (token: string) => void) => {
  return messaging().onTokenRefresh(async (token: string) => {
    console.log('🔄 FCM Token refreshed:', token);
    
    // Store new token
    await SecureStore.setItemAsync(FCM_TOKEN_KEY, token);
    
    // Send to backend
    await sendTokenToBackend(token, Platform.OS);
    
    // Call custom callback if provided
    if (callback) {
      callback(token);
    }
  });
};

/**
 * Display notification in foreground using Notifee
 * Shows a custom local notification when app is open
 */
export const displayForegroundNotification = async (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
) => {
  try {
    const { notification, data } = remoteMessage;

    // Determine channel based on notification priority or type
    const channelId = data?.priority === 'high' 
      ? HIGH_PRIORITY_CHANNEL_ID 
      : DEFAULT_CHANNEL_ID;

    // Get image URL if available
    const imageUrl = notification?.android?.imageUrl || data?.imageUrl;
    
    // Ensure imageUrl is a string if present
    const validImageUrl = typeof imageUrl === 'string' ? imageUrl : undefined;
    
    // Get current badge count and increment it (persistent badge)
    let currentBadgeCount = await notifee.getBadgeCount();
    const newBadgeCount = currentBadgeCount + 1;
    
    // Get badge count from data (if sent from backend), otherwise use incremented count
    const badgeCount = data?.badge ? parseInt(data.badge as string, 10) : newBadgeCount;

    // Build notification config based on platform
    const notificationConfig: any = {
      title: notification?.title || 'New Notification',
      body: notification?.body || '',
      data: data as Record<string, string>,
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        // Only include largeIcon if imageUrl exists
        ...(validImageUrl && { largeIcon: validImageUrl }),
        // Only include bigPicture if imageUrl exists
        ...(validImageUrl && {
          bigPicture: {
            picture: validImageUrl,
          },
        }),
        badgeCount,
        number: badgeCount, // For app icon badge on supported launchers
        showBadge: true, // Enable badge display
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        sound: 'default',
        vibrationPattern: [300, 500],
        importance: AndroidImportance.HIGH,
      },
    };

    // Only add iOS config on iOS platform
    if (Platform.OS === 'ios') {
      notificationConfig.ios = {
        sound: 'default',
        badgeCount, // iOS badge count
        ...(validImageUrl && { attachments: [{ url: validImageUrl }] }),
      };
    }

    await notifee.displayNotification(notificationConfig);
    
    // Update badge count on app icon (persistent - don't reset)
    await notifee.setBadgeCount(badgeCount);

    console.log('✅ Foreground notification displayed successfully');
    console.log('📊 Notification details:', {
      title: notificationConfig.title,
      body: notificationConfig.body,
      channelId,
      badgeCount,
      hasImage: !!validImageUrl,
    });
  } catch (error) {
    console.error('❌ Error displaying foreground notification:', error);
    // Try to display a simple notification as fallback
    try {
      await notifee.displayNotification({
        title: 'New Notification',
        body: 'Tap to view',
        android: {
          channelId: DEFAULT_CHANNEL_ID,
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
      });
      console.log('✅ Fallback notification displayed');
    } catch (fallbackError) {
      console.error('❌ Fallback notification also failed:', fallbackError);
    }
  }
};

/**
 * Handle notification press / tap
 * Navigate to appropriate screen based on notification data
 */
export const handleNotificationPress = async (data: NotificationData) => {
  try {
    console.log('📲 Notification pressed with data:', data);

    // TODO: Mark notification as read on backend
    // await markNotificationAsRead(data.notificationId);

    // Navigate based on data payload
    if (navigationRef && data) {
      // Wait a bit to ensure navigation is ready
      setTimeout(() => {
        if (data.screen) {
          // Navigate to specific screen
          switch (data.screen) {
            case 'OrderDetails':
              navigationRef.navigate('OrderDetails', { orderId: data.orderId });
              break;
            
            case 'ChatScreen':
              navigationRef.navigate('ChatScreen', { chatId: data.chatId });
              break;
            
            case 'PostDetails':
              navigationRef.navigate('PostDetails', { postId: data.postId });
              break;
            
            // Add more cases based on your app's screens
            default:
              navigationRef.navigate(data.screen, data);
          }
        } else {
          // Default navigation (e.g., home or notifications screen)
          navigationRef.navigate('Notifications');
        }
      }, 500);
    }
  } catch (error) {
    console.error('❌ Error handling notification press:', error);
  }
};

/**
 * Setup foreground notification handler
 * Listens for notifications when app is open and visible
 */
export const onForegroundMessage = () => {
  return messaging().onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    console.log('📱 Foreground notification received:', remoteMessage);

    // Display notification using Notifee
    await displayForegroundNotification(remoteMessage);

    // Handle custom logic based on notification type
    const { data } = remoteMessage;
    if (data?.type === 'chat') {
      // Update chat badge, play sound, etc.
      console.log('💬 Chat notification received');
    } else if (data?.type === 'order') {
      // Update order status, refresh list, etc.
      console.log('📦 Order notification received');
    }
  });
};

/**
 * Setup notification press handler
 * Handles when user taps on notification
 */
export const setupNotificationPressHandler = () => {
  // Notifee foreground press handler
  return notifee.onForegroundEvent(async ({ type, detail }: any) => {
    if (type === EventType.PRESS) {
      console.log('🖱️ Notification pressed (foreground):', detail.notification);
      await handleNotificationPress(detail.notification?.data as NotificationData);
    }
  });
};

/**
 * Get initial notification
 * Called when app opens from completely quit state via notification tap
 */
export const getInitialNotification = async () => {
  try {
    const remoteMessage = await messaging().getInitialNotification();
    
    if (remoteMessage) {
      console.log('🚀 App opened from quit state via notification:', remoteMessage);
      
      // Handle navigation after a delay to ensure app is ready
      setTimeout(() => {
        handleNotificationPress(remoteMessage.data as NotificationData);
      }, 1000);
      
      return remoteMessage;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error getting initial notification:', error);
    return null;
  }
};

/**
 * Setup notification opened app handler
 * Called when app transitions from background to foreground via notification tap
 */
export const onNotificationOpenedApp = () => {
  return messaging().onNotificationOpenedApp((remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    console.log('📲 App opened from background via notification:', remoteMessage);
    handleNotificationPress(remoteMessage.data as NotificationData);
  });
};

/**
 * Subscribe to a topic
 * Useful for sending notifications to groups of users
 */
export const subscribeToTopic = async (topic: string): Promise<boolean> => {
  try {
    await messaging().subscribeToTopic(topic);
    console.log(`✅ Subscribed to topic: ${topic}`);
    return true;
  } catch (error) {
    console.error(`❌ Error subscribing to topic ${topic}:`, error);
    return false;
  }
};

/**
 * Unsubscribe from a topic
 */
export const unsubscribeFromTopic = async (topic: string): Promise<boolean> => {
  try {
    await messaging().unsubscribeFromTopic(topic);
    console.log(`✅ Unsubscribed from topic: ${topic}`);
    return true;
  } catch (error) {
    console.error(`❌ Error unsubscribing from topic ${topic}:`, error);
    return false;
  }
};

/**
 * Get notification badge count
 * Works on both iOS and Android (Android requires launcher support)
 */
export const getBadgeCount = async (): Promise<number> => {
  try {
    return await notifee.getBadgeCount();
  } catch (error) {
    console.error('❌ Error getting badge count:', error);
    return 0;
  }
};

/**
 * Set notification badge count
 * Works on both iOS and Android (Android requires launcher support)
 */
export const setBadgeCount = async (count: number): Promise<void> => {
  try {
    await notifee.setBadgeCount(count);
    console.log(`✅ Badge count set to: ${count}`);
  } catch (error) {
    console.error('❌ Error setting badge count:', error);
  }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async (): Promise<void> => {
  try {
    await notifee.cancelAllNotifications();
    await notifee.setBadgeCount(0); // Also clear badge
    console.log('✅ All notifications cleared');
  } catch (error) {
    console.error('❌ Error clearing notifications:', error);
  }
};

/**
 * Show local notification for app management operations
 * Displays an immediate notification for create, edit, or delete operations
 */
export const showAppManagementNotification = async (
  operation: 'created' | 'updated' | 'deleted',
  appName: string
): Promise<void> => {
  try {
    // Ensure notification channels are created (Android)
    if (Platform.OS === 'android') {
      await createNotificationChannels();
    }

    // Check if we have notification permission (required for Android 13+)
    const authStatus = await checkNotificationPermission();
    const hasPermission = 
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    // If no permission, request it
    if (!hasPermission) {
      console.log('⚠️ No notification permission, requesting...');
      const granted = await requestNotificationPermission();
      if (!granted) {
        console.log('❌ Notification permission denied, cannot show notification');
        return;
      }
    }

    const notificationTitles = {
      created: '✨ App Created',
      updated: '✏️ App Updated',
      deleted: '🗑️ App Deleted',
    };

    const notificationBodies = {
      created: `"${appName}" has been successfully created`,
      updated: `"${appName}" has been successfully updated`,
      deleted: `"${appName}" has been successfully deleted`,
    };

    // Get current badge count and increment it
    const currentBadgeCount = await notifee.getBadgeCount();
    const newBadgeCount = currentBadgeCount + 1;

    const notificationConfig: any = {
      title: notificationTitles[operation],
      body: notificationBodies[operation],
      data: {
        type: 'app_management',
        operation,
        appName,
      },
      android: {
        channelId: DEFAULT_CHANNEL_ID,
        smallIcon: 'ic_launcher',
        badgeCount: newBadgeCount,
        number: newBadgeCount,
        showBadge: true,
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        sound: 'default',
        vibrationPattern: [300, 500],
        importance: AndroidImportance.HIGH,
      },
    };

    // Add iOS config if on iOS
    if (Platform.OS === 'ios') {
      notificationConfig.ios = {
        sound: 'default',
        badgeCount: newBadgeCount,
      };
    }

    await notifee.displayNotification(notificationConfig);
    await notifee.setBadgeCount(newBadgeCount);

    console.log(`✅ Local notification displayed for ${operation} operation on "${appName}"`);
  } catch (error) {
    console.error('❌ Error displaying app management notification:', error);
    console.error('Error details:', error);
  }
};

/**
 * Initialize push notification service
 * Call this once when app starts
 */
export const initializePushNotifications = async () => {
  try {
    console.log('🚀 Initializing push notifications...');

    // Create notification channels (Android)
    await createNotificationChannels();

    // Get FCM token
    await getFCMToken();

    // Get APNs token (iOS)
    if (Platform.OS === 'ios') {
      await getAPNsToken();
    }

    // Setup token refresh listener
    onTokenRefresh();

    // Setup foreground message handler
    onForegroundMessage();

    // Setup notification press handler
    setupNotificationPressHandler();

    // Setup notification opened app handler
    onNotificationOpenedApp();

    // Check if app was opened from a notification (quit state)
    await getInitialNotification();

    console.log('✅ Push notifications initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing push notifications:', error);
  }
};

/**
 * Cleanup push notification listeners
 * Call when component unmounts to prevent memory leaks
 */
export const cleanupPushNotifications = (unsubscribeCallbacks: Array<() => void>) => {
  unsubscribeCallbacks.forEach((unsubscribe) => unsubscribe());
  console.log('✅ Push notification listeners cleaned up');
};

// Export everything
export default {
  initializePushNotifications,
  requestNotificationPermission,
  checkNotificationPermission,
  showSettingsAlert,
  getFCMToken,
  getAPNsToken,
  getStoredFCMToken,
  deleteFCMToken,
  onTokenRefresh,
  displayForegroundNotification,
  handleNotificationPress,
  onForegroundMessage,
  setupNotificationPressHandler,
  getInitialNotification,
  onNotificationOpenedApp,
  subscribeToTopic,
  unsubscribeFromTopic,
  getBadgeCount,
  setBadgeCount,
  clearAllNotifications,
  showAppManagementNotification,
  createNotificationChannels,
  setNavigationRef,
  cleanupPushNotifications,
};
