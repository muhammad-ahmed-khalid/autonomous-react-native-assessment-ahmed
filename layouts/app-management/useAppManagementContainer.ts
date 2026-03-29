import { useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchApps, refreshApps, loadMoreApps, deleteApp } from '@/store/slices/appsSlice';
import { router } from 'expo-router';
import { App } from '@/types/app';
import { showAppManagementNotification } from '@/services/pushNotificationService';
import { UseAppManagementContainerReturn } from './types';

export function useAppManagementContainer(): UseAppManagementContainerReturn {
  const dispatch = useAppDispatch();
  const { apps, loading, refreshing, error, hasMore, loadingMore, currentPage } = useAppSelector((state) => state.apps);

  useEffect(() => {
    dispatch(fetchApps());
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    dispatch(refreshApps());
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      dispatch(loadMoreApps(currentPage + 1));
    }
  }, [loadingMore, hasMore, loading, dispatch, currentPage]);

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

  const handleAppPress = useCallback((app: App) => {
    Alert.alert(
      app.name,
      `Status: ${app.subscriptionStatus}\n${app.description || 'No description'}`,
      [
        { text: 'Edit', onPress: () => handleEditApp(app) },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteApp(app) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [handleEditApp, handleDeleteApp]);

  return {
    // Redux State
    apps,
    loading,
    refreshing,
    error,
    hasMore,
    loadingMore,
    currentPage,
    
    // Handlers
    handleRefresh,
    handleLoadMore,
    handleCreateApp,
    handleEditApp,
    handleDeleteApp,
    handleAppPress,
  };
}
