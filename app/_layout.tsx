import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider, NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Redirect, useNavigationContainerRef } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadStoredAuth } from '@/store/slices/authSlice';

// Import push notification service
import { setNavigationRef } from '@/services/pushNotificationService';
import usePushNotifications from '@/services/usePushNotifications';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <AuthInitializer>
        <RootLayoutNav />
      </AuthInitializer>
    </Provider>
  );
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const init = async () => {
      try {
        await dispatch(loadStoredAuth());
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        // Keep splash screen visible for at least 2 seconds
        setTimeout(async () => {
          setIsReady(true);
          await SplashScreen.hideAsync();
        }, 2000);
      }
    };
    init();
  }, [dispatch]);

  if (!isReady) {
    return null; // Keep showing splash screen
  }

  return <>{children}</>;
}

/**
 * Push Notification Initializer Component
 * Initialize push notifications after app is ready
 */
function PushNotificationInitializer({ children }: { children: React.ReactNode }) {
  const { 
    fcmToken, 
    hasPermission, 
    isLoading, 
    error,
    requestPermission 
  } = usePushNotifications();

  // Get user authentication state to conditionally request permission
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    // Request permission after user is authenticated
    // You can adjust this logic based on your app's requirements
    if (isAuthenticated && !hasPermission && !isLoading) {
      console.log('🔔 Requesting notification permission for authenticated user');
      
      // Add a small delay to avoid requesting immediately
      setTimeout(() => {
        requestPermission();
      }, 2000);
    }
  }, [isAuthenticated, hasPermission, isLoading, requestPermission]);

  // Log FCM token for debugging
  useEffect(() => {
    if (fcmToken) {
      console.log('📱 Current FCM Token:', fcmToken);
      // You can also dispatch this to Redux if needed
      // dispatch(setFCMToken(fcmToken));
    }
  }, [fcmToken]);

  // Log errors
  useEffect(() => {
    if (error) {
      console.error('🔴 Push Notification Error:', error);
    }
  }, [error]);

  return <>{children}</>;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const navigationRef = useNavigationContainerRef();

  // Set navigation reference for deep linking in push notifications
  useEffect(() => {
    if (navigationRef) {
      setNavigationRef(navigationRef);
    }
  }, [navigationRef]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PushNotificationInitializer>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </PushNotificationInitializer>
    </ThemeProvider>
  );
}
