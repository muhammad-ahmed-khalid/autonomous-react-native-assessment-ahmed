/**
 * Image Upload Utility
 * 
 * This utility handles uploading images to cloud storage.
 * Currently returns the local URI as-is for development with mock API.
 * 
 * For production, implement one of these options:
 * 1. AWS S3 with expo-file-system
 * 2. Firebase Storage
 * 3. Cloudinary
 * 4. Your own backend server
 */

/**
 * Uploads an image to cloud storage and returns the URL
 * @param localUri - Local file URI from ImagePicker
 * @returns Promise<string> - URL of the uploaded image
 */
export const uploadImage = async (localUri: string): Promise<string> => {
  // Check if it's already a remote URL
  if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
    return localUri;
  }

  try {
    // TODO: Implement actual upload logic here
    // Example with fetch and FormData:
    /*
    const filename = localUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    const formData = new FormData();
    formData.append('file', {
      uri: localUri,
      name: filename,
      type,
    } as any);

    const response = await fetch('YOUR_UPLOAD_ENDPOINT', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await response.json();
    return data.url; // Return the uploaded image URL
    */

    // For now, return the local URI (works with mock API)
    console.log('Image upload not implemented. Using local URI:', localUri);
    return localUri;

  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Example implementation with Firebase Storage:
 * 
 * import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
 * import * as FileSystem from 'expo-file-system';
 * 
 * export const uploadImageToFirebase = async (localUri: string): Promise<string> => {
 *   const storage = getStorage();
 *   const filename = `app-icons/${Date.now()}.jpg`;
 *   const storageRef = ref(storage, filename);
 *   
 *   // Read file as blob
 *   const blob = await fetch(localUri).then(r => r.blob());
 *   
 *   // Upload to Firebase
 *   await uploadBytes(storageRef, blob);
 *   
 *   // Get download URL
 *   const downloadURL = await getDownloadURL(storageRef);
 *   return downloadURL;
 * };
 */

/**
 * Example implementation with Cloudinary:
 * 
 * export const uploadImageToCloudinary = async (localUri: string): Promise<string> => {
 *   const formData = new FormData();
 *   formData.append('file', {
 *     uri: localUri,
 *     type: 'image/jpeg',
 *     name: 'upload.jpg',
 *   } as any);
 *   formData.append('upload_preset', 'YOUR_UPLOAD_PRESET');
 *   
 *   const response = await fetch(
 *     'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload',
 *     {
 *       method: 'POST',
 *       body: formData,
 *     }
 *   );
 *   
 *   const data = await response.json();
 *   return data.secure_url;
 * };
 */
