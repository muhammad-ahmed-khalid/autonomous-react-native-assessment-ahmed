import { StyleSheet, TouchableOpacity, Image, Alert, FlatList, RefreshControl, ActivityIndicator, TextInput } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { fetchApps, refreshApps, loadMoreApps, deleteApp, searchApps } from '@/store/slices/appsSlice';
import { router } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import AppCard from '@/components/AppCard';
import { App } from '@/types/app';
import { useDebounce } from '@/hooks/useDebounce';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { showAppManagementNotification } from '@/services/pushNotificationService';

export default function TabOneScreen() {
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
  }, [debouncedSearch, dispatch]);

  const handleRefresh = () => {
    setSearchQuery('');
    dispatch(refreshApps());
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      dispatch(loadMoreApps(currentPage + 1));
    }
  };

  const handleAppPress = (app: App) => {
    Alert.alert(
      app.name,
      `Status: ${app.subscriptionStatus}\n${app.description || 'No description'}`,
      [{ text: 'OK' }]
    );
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

  const handleLogout = () => {
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
  };

  const renderListHeader = useCallback(() => (
    <View style={styles.listHeader}>
      <View style={styles.resultsHeader}>
        <Text style={styles.sectionTitle}>My Apps</Text>
        {searching && <ActivityIndicator size="small" color="#007AFF" />}
        {!searching && debouncedSearch.trim() && (
          <Text style={styles.resultsCount}>
            {apps.length} {apps.length === 1 ? 'result' : 'results'}
          </Text>
        )}
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  ), [debouncedSearch, apps.length, error, searching]);

  const renderEmptyList = useCallback(() => {
    if (loading || searching) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.emptyText}>{searching ? 'Searching...' : 'Loading apps...'}</Text>
        </View>
      );
    }

    if (debouncedSearch.trim() && apps.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <FontAwesome name="search" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No apps found</Text>
          <Text style={styles.emptySubText}>Try adjusting your search</Text>
          <TouchableOpacity 
            style={styles.clearSearchButton} 
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearSearchButtonText}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No apps found</Text>
        <Text style={styles.emptySubText}>Pull down to refresh</Text>
      </View>
    );
  }, [loading, searching, debouncedSearch, apps.length, searchQuery]);

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.footerText}>Loading more apps...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header with Search */}
      <View style={styles.fixedHeader} lightColor="#fff" darkColor="#000">
        {/* <Text style={stylesn.title}>Dashboard</Text> */}
        
        {/* {user && (
          <View style={styles.userInfo}>
            {user.image && (
              <Image 
                source={{ uri: user.image }} 
                style={styles.avatar}
              />
            )}
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user.firstName} {user.lastName}
              </Text>
              <Text style={styles.userDetail}>@{user.username}</Text>
            </View>
          </View>
        )} */}

        {/* <View style={styles.headerActions}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateApp}>
            <Text style={styles.createButtonText}>+ Create App</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View> */}

        {/* Search Bar - Fixed outside FlatList */}
        <View style={styles.searchContainer} lightColor="#F5F5F5" darkColor="#1C1C1E">
          <FontAwesome name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search apps..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
            clearButtonMode="while-editing"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            blurOnSubmit={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <FontAwesome name="times-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Scrollable List */}
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
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={2}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        contentContainerStyle={apps.length === 0 ? styles.emptyListContainer : undefined}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userDetails: {
    backgroundColor: 'transparent',
  },
  userName: {
    fontSize: 18,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  createButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  userDetail: {
    fontSize: 14,
    color: '#666',
  },
  headerActions: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  clearButton: {
    padding: 5,
    marginLeft: 5,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
    backgroundColor: 'transparent',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 5,
  },
  clearSearchButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  clearSearchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  footerText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
});
