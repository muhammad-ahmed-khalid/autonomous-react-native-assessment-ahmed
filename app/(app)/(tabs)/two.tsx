import { 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  RefreshControl, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchApps, refreshApps, loadMoreApps, deleteApp } from '@/store/slices/appsSlice';
import { router } from 'expo-router';
import { useEffect } from 'react';
import AppCard from '@/components/AppCard';
import { App } from '@/types/app';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { showAppManagementNotification } from '@/services/pushNotificationService';

export default function AppManagementScreen() {
  const dispatch = useAppDispatch();
  const { apps, loading, refreshing, error, hasMore, loadingMore, currentPage } = useAppSelector((state) => state.apps);

  useEffect(() => {
    dispatch(fetchApps());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(refreshApps());
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      dispatch(loadMoreApps(currentPage + 1));
    }
  };

  const handleCreateApp = () => {
    router.push('../app-form');
  };

  const handleEditApp = (app: App) => {
    router.push(`../app-form?id=${app.id}`);
  };

  const handleDeleteApp = (app: App) => {
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
  };

  const handleAppPress = (app: App) => {
    Alert.alert(
      app.name,
      `Status: ${app.subscriptionStatus}\n${app.description || 'No description'}`,
      [
        { text: 'Edit', onPress: () => handleEditApp(app) },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteApp(app) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>App Management</Text>
      <Text style={styles.subtitle}>
        {apps.length} {apps.length === 1 ? 'app' : 'apps'}
      </Text>
      
      <TouchableOpacity style={styles.createButton} onPress={handleCreateApp}>
        <FontAwesome name="plus" size={20} color="#fff" />
        <Text style={styles.createButtonText}>Create New App</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  if (loading && apps.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading apps...</Text>
      </View>
    );
  }

  if (error && apps.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <FontAwesome name="exclamation-circle" size={48} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(fetchApps())}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={apps}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AppCard
            app={item}
            onPress={handleAppPress}
            onEdit={handleEditApp}
            onDelete={handleDeleteApp}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="mobile" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No apps yet</Text>
            <Text style={styles.emptySubText}>Create your first app to get started</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleCreateApp}>
              <Text style={styles.emptyButtonText}>Create App</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={apps.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 20,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.7,
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
