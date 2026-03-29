import { StyleSheet, TouchableOpacity, FlatList, RefreshControl, TextInput, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import AppCard from '@/components/AppCard';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useDashboardContainer } from '@/layouts/dashboard/useDashboardContainer';
import { useCallback } from 'react';

export default function TabOneScreen() {
  const {
    apps,
    loading,
    refreshing,
    error,
    searching,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    loadingMore,
    handleRefresh,
    handleLoadMore,
    handleAppPress,
    handleEditApp,
    handleDeleteApp,
  } = useDashboardContainer();

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
  }, [loading, searching, debouncedSearch, apps.length, searchQuery, setSearchQuery]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.footerText}>Loading more apps...</Text>
      </View>
    );
  }, [loadingMore]);

  return (
    <View style={styles.container}>
      {/* Fixed Header with Search */}
      <View style={styles.fixedHeader} lightColor="#fff" darkColor="#000">
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
  listHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
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
