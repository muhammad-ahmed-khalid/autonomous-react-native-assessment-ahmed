/**
 * Billing History Screen
 * Displays past invoices and payment history
 */

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  View as RNView,
  TouchableOpacity,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '@/hooks/useSubscription';

export default function BillingHistoryScreen() {
  const { billingHistory, loading, loadBillingHistory } = useSubscription();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBillingHistory();
  }, [loadBillingHistory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBillingHistory();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#4CAF50';
      case 'failed':
        return '#F44336';
      case 'pending':
        return '#FF9800';
      case 'refunded':
        return '#2196F3';
      default:
        return '#999';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return 'checkmark-circle';
      case 'failed':
        return 'close-circle';
      case 'pending':
        return 'time';
      case 'refunded':
        return 'return-down-back';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Billing History</Text>
            <Text style={styles.headerSubtitle}>View your payment history</Text>
          </View>
        </View>

        {/* Billing History List */}
        {loading && billingHistory.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : billingHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={80} color="#CCC" />
            <Text style={styles.emptyTitle}>No Billing History</Text>
            <Text style={styles.emptyMessage}>
              Your payment history will appear here once you make a payment.
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {billingHistory.map((item) => (
              <TouchableOpacity key={item.id} style={styles.historyCard} activeOpacity={0.7}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyDescription}>{item.description}</Text>
                    <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                  </View>

                  <View style={styles.historyRight}>
                    <Text style={styles.historyAmount}>
                      ${item.amount.toFixed(2)}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
                      <Ionicons
                        name={getStatusIcon(item.status) as any}
                        size={14}
                        color={getStatusColor(item.status)}
                        style={styles.statusIcon}
                      />
                      <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>

                {item.invoiceUrl && (
                  <TouchableOpacity style={styles.downloadButton}>
                    <Ionicons name="download-outline" size={18} color="#007AFF" />
                    <Text style={styles.downloadText}>Download Invoice</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    opacity: 0.6,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 24,
  },
  historyList: {
    paddingHorizontal: 20,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyInfo: {
    flex: 1,
    marginRight: 16,
  },
  historyDescription: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  historyDate: {
    fontSize: 14,
    opacity: 0.6,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyAmount: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  downloadText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 6,
  },
});
