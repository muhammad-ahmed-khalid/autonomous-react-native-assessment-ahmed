import { StyleSheet, ScrollView, TouchableOpacity, Alert, View as RNView, Image } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BiometricSettingsCard from '@/components/BiometricSettingsCard';

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
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
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No user data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          {user.image ? (
            <Image source={{ uri: user.image }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={60} color="#007AFF" />
            </View>
          )}
        </View>
        
        <Text style={styles.userName}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.userUsername}>@{user.username}</Text>
      </View>

      {/* User Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Information</Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="person-outline" size={20} color="#007AFF" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>
              {user.firstName} {user.lastName}
            </Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="mail-outline" size={20} color="#007AFF" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="at-outline" size={20} color="#007AFF" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>{user.username}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="transgender-outline" size={20} color="#007AFF" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>
              {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="finger-print-outline" size={20} color="#007AFF" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>User ID</Text>
            <Text style={styles.infoValue}>{user.id}</Text>
          </View>
        </View>
      </View>

      {/* Biometric Settings Card */}
      <BiometricSettingsCard />

      {/* Security Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Security</Text>
        
        <TouchableOpacity style={styles.securityOption}>
          <View style={styles.securityIconContainer}>
            <Ionicons name="key-outline" size={20} color="#007AFF" />
          </View>
          <Text style={styles.securityText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={isLoading}
      >
        <Ionicons name="log-out-outline" size={24} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* App Version */}
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'transparent',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 14,
    color: '#999',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginLeft: 52,
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  securityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
    gap: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 8,
  },
});
