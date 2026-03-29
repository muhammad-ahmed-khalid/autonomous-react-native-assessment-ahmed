/**
 * index.js - Application Entry Point
 * 
 * CRITICAL: This file is required for handling push notifications in background/quit state.
 * 
 * The background message handler MUST be registered BEFORE any app component is registered.
 * This ensures notifications are handled even when the app is completely closed.
 * 
 * For Expo apps, this overrides the default 'expo-router/entry' entry point.
 * Make sure to update package.json "main" field if needed.
 */

import 'expo-router/entry';
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { name as appName } from './app.json';

/**
 * Background Message Handler
 * 
 * This function runs in a separate JavaScript context when a notification is received
 * while the app is in the background or quit state.
 * 
 * Important:
 * - Must be as lightweight as possible
 * - Avoid heavy operations or API calls that take too long
 * - Has ~30 seconds to complete on Android
 * - DO NOT use UI components or navigation here
 * - Use Notifee to display notifications
 * 
 * @param {RemoteMessage} remoteMessage - The notification payload from FCM
 */
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('🔔 Background/Quit notification received:', remoteMessage);

  try {
    const { notification, data } = remoteMessage;

    // Handle data-only messages (silent push)
    if (!notification && data) {
      console.log('📦 Data-only message received in background:', data);
      
      // Handle silent push logic here
      // Example: Update local database, sync data, update badge, etc.
      
      // Optionally show a notification for data-only messages
      if (data.showNotification === 'true') {
        await displayBackgroundNotification(
          data.title || 'New Update',
          data.body || 'You have new content',
          data
        );
      }
      
      return;
    }

    // Handle notification messages
    if (notification) {
      // FCM automatically displays notifications in background/quit state
      // Do NOT manually display again to avoid duplicates
      console.log('✅ Notification will be displayed by FCM automatically');
      
      // Only handle badge count and other side effects
      if (data?.badge) {
        const badgeCount = parseInt(data.badge, 10);
        await notifee.setBadgeCount(badgeCount);
        console.log('📊 Badge count updated to:', badgeCount);
      }
    }

    // Additional background logic based on notification type
    if (data?.type === 'chat') {
      console.log('💬 Chat notification - updating badge');
      // Update badge count, cache message, etc.
    } else if (data?.type === 'order') {
      console.log('📦 Order notification - syncing data');
      // Sync order data, update local cache, etc.
    }

    console.log('✅ Background notification handled successfully');
  } catch (error) {
    console.error('❌ Error handling background notification:', error);
  }
});

/**
 * Display notification using Notifee in background
 * 
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Custom data payload
 * @param {string} imageUrl - Optional image URL
 */
const displayBackgroundNotification = async (title, body, data = {}, imageUrl = null) => {
  try {
    // Determine channel based on priority
    const channelId = data.priority === 'high' ? 'high_priority_channel' : 'default_channel';

    // Create channels if they don't exist
    await createChannels();

    // Get current badge count and increment it
    let currentBadgeCount = await notifee.getBadgeCount();
    const newBadgeCount = currentBadgeCount + 1;
    
    // Get badge count from data (if sent from backend), otherwise use incremented count
    const badgeCount = data.badge ? parseInt(data.badge, 10) : newBadgeCount;

    // Build Android config
    const androidConfig = {
      channelId,
      smallIcon: 'ic_launcher',
      badgeCount, // Set badge count
      number: badgeCount, // For app icon badge on supported launchers
      showBadge: true, // Enable badge display
      pressAction: {
        id: 'default',
        launchActivity: 'default',
      },
      sound: 'default',
      importance: AndroidImportance.HIGH,
    };

    // Only add largeIcon and bigPicture if imageUrl exists and is valid
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.length > 0) {
      androidConfig.largeIcon = imageUrl;
      androidConfig.bigPicture = {
        picture: imageUrl,
      };
    }

    // Build notification config
    const notificationConfig = {
      title,
      body,
      data,
      android: androidConfig,
    };

    // Display notification
    await notifee.displayNotification(notificationConfig);
    
    // Update badge count
    await notifee.setBadgeCount(badgeCount);

    console.log('✅ Background notification displayed via Notifee');
    console.log('📊 Badge count set to:', badgeCount);
  } catch (error) {
    console.error('❌ Error displaying background notification:', error);
  }
};

/**
 * Create notification channels for Android
 * Required for Android 8.0+ (API 26)
 */
const createChannels = async () => {
  try {
    // Default channel
    await notifee.createChannel({
      id: 'default_channel',
      name: 'Default Notifications',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
      badge: true, // Enable badge counts
    });

    // High priority channel
    await notifee.createChannel({
      id: 'high_priority_channel',
      name: 'High Priority Notifications',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
      vibrationPattern: [300, 500, 300, 500],
      badge: true, // Enable badge counts
    });
  } catch (error) {
    console.error('❌ Error creating channels in background:', error);
  }
};

/**
 * Background notification press handler
 * 
 * This handles when user taps on a notification displayed via Notifee
 * while the app was in background/quit state
 */
notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('🖱️ Background notification event:', type);

  if (type === EventType.PRESS) {
    console.log('📲 Background notification pressed:', detail.notification);

    // The app will be launched and the event will be handled
    // by the foreground handlers in pushNotificationService.ts
    
    // You can perform any quick operations here before app launches
    // Example: Log analytics, update local storage, etc.
    
    try {
      // Log the press event
      const data = detail.notification?.data;
      console.log('Notification data:', data);

      // Mark notification as read or log analytics
      // await logNotificationPress(data);

    } catch (error) {
      console.error('❌ Error handling background notification press:', error);
    }
  }

  if (type === EventType.DISMISSED) {
    console.log('🗑️ Notification dismissed');
    // Handle notification dismissal
  }

  if (type === EventType.ACTION_PRESS) {
    console.log('⚡ Notification action pressed:', detail.pressAction?.id);
    // Handle custom action buttons
  }
});

/**
 * Important Notes:
 * 
 * 1. For Expo apps using expo-router:
 *    - This file imports 'expo-router/entry' which handles app registration
 *    - Ensure your package.json "main" field points to this index.js
 * 
 * 2. For bare React Native apps:
 *    - Uncomment the following lines and remove 'expo-router/entry' import:
 * 
 *    import App from './App';
 *    AppRegistry.registerComponent(appName, () => App);
 * 
 * 3. Testing Background Handler:
 *    - Completely close the app (swipe away from recent apps)
 *    - Send a notification from Firebase Console
 *    - The handler should trigger even when app is closed
 *    - Check logs: `adb logcat | grep "Background/Quit notification"`
 * 
 * 4. Data-Only Messages:
 *    - For silent push notifications (no notification field, only data)
 *    - Set priority: "high" in your server payload
 *    - Android: Add "priority": "high"
 *    - iOS: Add "content_available": true or "content-available": 1
 * 
 * 5. Debugging:
 *    - Use console.log() for debugging (visible in Metro logs)
 *    - For Android: `adb logcat | grep -i firebase`
 *    - For iOS: Use Xcode console
 * 
 * 6. Performance:
 *    - Keep background handler under 30 seconds
 *    - Avoid heavy computations or long API calls
 *    - Use AsyncStorage sparingly
 *    - Consider queueing operations for when app opens
 */

console.log('✅ Push notification background handler registered');
