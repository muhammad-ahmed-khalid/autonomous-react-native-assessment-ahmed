import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { appSchema, AppFormData } from '@/validation/appSchemas';
import { ControlledInput } from '@/components/ControlledInput';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createApp, updateApp } from '@/store/slices/appsSlice';
import { router, useLocalSearchParams } from 'expo-router';
import { App } from '@/types/app';
import * as ImagePicker from 'expo-image-picker';
import { showAppManagementNotification } from '@/services/pushNotificationService';

export default function AppFormScreen() {
  const dispatch = useAppDispatch();
  const { loading, apps } = useAppSelector((state) => state.apps);
  const params = useLocalSearchParams();
  const appId = params.id as string | undefined;
  const isEditMode = !!appId;

  const [imageUri, setImageUri] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const existingApp = isEditMode ? apps.find((app) => app.id === appId) : null;

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AppFormData>({
    resolver: yupResolver(appSchema) as any,
    defaultValues: existingApp
      ? {
          name: existingApp.name,
          description: existingApp.description || '',
          subscriptionStatus: existingApp.subscriptionStatus,
          logo: existingApp.logo,
        }
      : {
          name: '',
          description: '',
          subscriptionStatus: 'trial' as const,
          logo: '',
        },
  });

  useEffect(() => {
    if (existingApp?.logo) {
      setImageUri(existingApp.logo);
    }
  }, [existingApp]);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera and photo library permissions to upload app icons.'
      );
      return false;
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        setValue('logo', uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickImageFromCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        setValue('logo', uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert('Upload App Icon', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: pickImageFromCamera,
      },
      {
        text: 'Choose from Gallery',
        onPress: pickImageFromGallery,
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const onSubmit = async (data: AppFormData) => {
    try {
      // Note: In production, if logo is a local URI (file://, content://, etc.),
      // you should upload it to your server/cloud storage first and get back a URL
      // Example: if (data.logo.startsWith('file://')) { data.logo = await uploadImage(data.logo); }
      
      if (isEditMode && appId) {
        await dispatch(updateApp({ id: appId, data })).unwrap();
        
        Alert.alert('Success', 'App updated successfully', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        
        // Show local push notification for update after a brief delay
        setTimeout(async () => {
          try {
            await showAppManagementNotification('updated', data.name);
            console.log('✅ Update notification triggered for:', data.name);
          } catch (notifError) {
            console.error('❌ Failed to show update notification:', notifError);
          }
        }, 500);
      } else {
        await dispatch(createApp(data)).unwrap();
        
        Alert.alert('Success', 'App created successfully', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        
        // Show local push notification for creation after a brief delay
        setTimeout(async () => {
          try {
            await showAppManagementNotification('created', data.name);
            console.log('✅ Create notification triggered for:', data.name);
          } catch (notifError) {
            console.error('❌ Failed to show create notification:', notifError);
          }
        }, 500);
      }
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to save app');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{isEditMode ? 'Edit App' : 'Create New App'}</Text>
        </View>

        {/* Image Upload Section */}
        <View style={styles.imageSection}>
          <Text style={styles.label}>App Icon</Text>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={showImagePickerOptions}
            disabled={uploadingImage}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.appImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>+</Text>
                <Text style={styles.placeholderSubText}>Add Icon</Text>
              </View>
            )}
            {uploadingImage && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          {errors.logo && <Text style={styles.errorText}>{errors.logo.message}</Text>}
        </View>

        {/* App Name */}
        <View style={styles.formGroup}>
          <ControlledInput
            control={control}
            name="name"
            label="App Name *"
            placeholder="Enter app name"
            error={errors.name?.message}
          />
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <ControlledInput
            control={control}
            name="description"
            label="Description"
            placeholder="Enter description"
            error={errors.description?.message}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />
        </View>

        {/* Subscription Status */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Subscription Status *</Text>
          <Controller
            control={control}
            name="subscriptionStatus"
            render={({ field: { onChange, value } }) => (
              <View style={styles.statusButtons}>
                {(['active', 'inactive', 'trial', 'expired'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      value === status && styles.statusButtonActive,
                    ]}
                    onPress={() => onChange(status)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        value === status && styles.statusButtonTextActive,
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
          {errors.subscriptionStatus && (
            <Text style={styles.errorText}>{errors.subscriptionStatus.message}</Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditMode ? 'Update App' : 'Create App'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  imageSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    marginTop: 8,
  },
  appImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  placeholderText: {
    fontSize: 48,
    color: '#999',
  },
  placeholderSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  statusButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  statusButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
});
