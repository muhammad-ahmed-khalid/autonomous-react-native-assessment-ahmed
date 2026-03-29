import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { router } from 'expo-router';
import { UseSettingsContainerReturn } from './types';

export function useSettingsContainer(): UseSettingsContainerReturn {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            // Dispatch logout action
            await dispatch(logoutUser());
            // Navigate to auth screen
            router.replace('/(auth)/sign-in');
          },
        },
      ]
    );
  }, [dispatch]);

  return {
    // Redux State
    user,
    isLoading,
    
    // Handlers
    handleLogout,
  };
}
