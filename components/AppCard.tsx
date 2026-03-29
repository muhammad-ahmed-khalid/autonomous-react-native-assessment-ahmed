import React from 'react';
import { StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { App } from '@/types/app';

interface AppCardProps {
  app: App;
  onPress?: (app: App) => void;
  onEdit?: (app: App) => void;
  onDelete?: (app: App) => void;
}

const getStatusColor = (status: App['subscriptionStatus']) => {
  switch (status) {
    case 'active':
      return '#4CAF50';
    case 'trial':
      return '#2196F3';
    case 'inactive':
      return '#9E9E9E';
    case 'expired':
      return '#F44336';
    default:
      return '#9E9E9E';
  }
};

const getStatusText = (status: App['subscriptionStatus']) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'trial':
      return 'Trial';
    case 'inactive':
      return 'Inactive';
    case 'expired':
      return 'Expired';
    default:
      return status;
  }
};

const formatTimestamp = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

export default function AppCard({ app, onPress, onEdit, onDelete }: AppCardProps) {
  const handlePress = () => {
    onPress?.(app);
  };

  const handleEdit = (e: any) => {
    e.stopPropagation();
    onEdit?.(app);
  };

  const handleDelete = (e: any) => {
    e.stopPropagation();
    onDelete?.(app);
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <Image 
          source={{ uri: app.logo }} 
          style={styles.logo}
          resizeMode="cover"
        />
        
        <View style={styles.infoContainer}>
          <Text style={styles.appName} numberOfLines={1}>
            {app.name}
          </Text>
          
          {app.description && (
            <Text style={styles.description} numberOfLines={2}>
              {app.description}
            </Text>
          )}
          
          <View style={styles.statusRow}>
            <View 
              style={[
                styles.statusBadge, 
                { backgroundColor: getStatusColor(app.subscriptionStatus) }
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusText(app.subscriptionStatus)}
              </Text>
            </View>
            
            <Text style={styles.timestamp}>
              Updated {formatTimestamp(app.lastUpdated)}
            </Text>
          </View>

          {/* Action Buttons */}
          {(onEdit || onDelete) && (
            <View style={styles.actions}>
              {onEdit && (
                <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'transparent',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
  },
  infoContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
    backgroundColor: 'transparent',
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

