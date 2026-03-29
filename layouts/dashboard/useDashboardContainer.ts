import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { fetchApps, refreshApps, loadMoreApps, deleteApp, searchApps } from '@/store/slices/appsSlice';
import { router } from 'expo-router';
import { App } from '@/types/app';
import { useDebounce } from '@/hooks/useDebounce';
import { showAppManagementNotification } from '@/services/pushNotificationService';
import { UseDashboardContainerReturn } from './types';

export function useDashboardContainer(): UseDashboardContainerReturn {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { apps, loading, refreshing, error, hasMore, loadingMore, currentPage, searching } = useAppSelector((state) => state.apps);
  
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    dispatch(fetchApps());
  }, [dispatch]);

  // Search from API when debounced search changes
  useEffect(() => {
    if (debouncedSearch.trim()) {
      dispatch(searchApps(debouncedSearch));
    } else if (searchQuery === '' && debouncedSearch === '') {
      // Only refetch when search is cleared
      dispatch(fetchApps());
    }
  }, [debouncedSearch, dispatch, searchQuery]);

  const handleRefresh = useCallback(() => {
    setSearchQuery('');
    dispatch(refreshApps());
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      dispatch(loadMoreApps(currentPage + 1));
    }
  }, [loadingMore, hasMore, loading, dispatch, currentPage]);

  const handleAppPress = useCallback((app: App) => {
    Alert.alert(
      app.name,
      `Status: ${app.subscriptionStatus}\n${app.description || 'No description'}`,
      [{ text: 'OK' }]
    );
  }, []);

  const handleCreateApp = useCallback(() => {
    router.push('../app-form');
  }, []);

  const handleEditApp = useCallback((app: App) => {
    router.push(`../app-form?id=${app.id}`);
  }, []);

  const handleDeleteApp = useCallback((app: App) => {
    Alert.alert(
      'Delete App',
      `Are you sure you want to delete "${app.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const appNameToDelete = app.name; // Store name before deletion
            try {
              await dispatch(deleteApp(app.id)).unwrap();
              
              // Show local push notification first
              try {
                await showAppManagementNotification('deleted', appNameToDelete);
                console.log('✅ Delete notification triggered for:', appNameToDelete);
              } catch (notifError) {
                console.error('❌ Failed to show delete notification:', notifError);
              }
              
              // Then show success alert with a small delay
              setTimeout(() => {
                Alert.alert('Success', 'App deleted successfully');
              }, 100);
            } catch (error: any) {
              Alert.alert('Error', error || 'Failed to delete app');
            }
          },
        },
      ]
    );
  }, [dispatch]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await dispatch(logoutUser());
            router.replace('/(auth)/sign-in' as any);
          },
        },
      ]
    );
  }, [dispatch]);

  return {
    // Redux State
    user,
    apps,
    loading,
    refreshing,
    error,
    hasMore,
    loadingMore,
    currentPage,
    searching,
    
    // Search State
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    
    // Handlers
    handleRefresh,
    handleLoadMore,
    handleAppPress,
    handleCreateApp,
    handleEditApp,
    handleDeleteApp,
    handleLogout,
  };
}
