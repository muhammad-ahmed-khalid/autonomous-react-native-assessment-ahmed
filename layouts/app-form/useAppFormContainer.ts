import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { appSchema, AppFormData } from '@/validation/appSchemas';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createApp, updateApp } from '@/store/slices/appsSlice';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { showAppManagementNotification } from '@/services/pushNotificationService';
import { UseAppFormContainerReturn } from './types';

export function useAppFormContainer(): UseAppFormContainerReturn {
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

  const requestPermissions = useCallback(async () => {
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
  }, []);

  const pickImageFromGallery = useCallback(async () => {
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
  }, [requestPermissions, setValue]);

  const pickImageFromCamera = useCallback(async () => {
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
  }, [requestPermissions, setValue]);

  const showImagePickerOptions = useCallback(() => {
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
  }, [pickImageFromCamera, pickImageFromGallery]);

  const onSubmit = useCallback(async (data: AppFormData) => {
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
  }, [isEditMode, appId, dispatch]);

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  return {
    // Redux State
    loading,
    apps,
    
    // Form State
    control,
    errors,
    imageUri,
    uploadingImage,
    isEditMode,
    existingApp,
    
    // Handlers
    showImagePickerOptions,
    onSubmit,
    handleSubmit,
    handleBack,
  };
}
