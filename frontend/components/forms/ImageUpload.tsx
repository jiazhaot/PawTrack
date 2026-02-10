import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ApiService } from '@/services/api';
import { Colors } from '@/constants/theme/Colors';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  initialImageUrl?: string;
  required?: boolean;
}

export function ImageUpload({ onImageUploaded, initialImageUrl, required }: ImageUploadProps) {
  const [imageUri, setImageUri] = useState<string | null>(initialImageUrl || null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    try {
      console.log('Starting image upload for URI:', uri);
      const response = await ApiService.createImage(uri);
      console.log('Image upload successful, URL:', response.url);
      setImageUri(response.url);
      onImageUploaded(response.url);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image. Please try again.');
      console.error('Image upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Select Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Puppy Photo {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TouchableOpacity style={styles.uploadArea} onPress={showImageOptions} disabled={uploading}>
        {uploading ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
        ) : imageUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <View style={styles.changeOverlay}>
              <Text style={styles.changeText}>Tap to change</Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderEmoji}>📷</Text>
            <Text style={styles.placeholderText}>Add Photo</Text>
            <Text style={styles.placeholderSubtext}>Tap to upload</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.text,
    textAlign: 'center',
  },
  required: {
    color: Colors.primary,
  },
  uploadArea: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  changeOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  changeText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  uploadingContainer: {
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
});