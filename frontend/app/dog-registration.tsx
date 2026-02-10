import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ImageUpload } from '@/components/forms/ImageUpload';
import { FormInput } from '@/components/forms/FormInput';
import { BreedSelector } from '@/components/forms/BreedSelector';
import { SegmentedControl } from '@/components/forms/SegmentedControl';
import { WeightSlider } from '@/components/forms/WeightSlider';
import { PersonalitySelector } from '@/components/forms/PersonalitySelector';
import { ApiService, DogData, PersonalityTag } from '@/services/api';
import { DogBreed } from '@/constants/data/dogBreeds';
import { Colors } from '@/constants/theme/Colors';
import { useAuth } from '@/context/auth';

interface FormData {
  name: string;
  breed: DogBreed | null;
  customizedBreed: string;
  gender: 'male' | 'female' | 'other' | null;
  weight: number;
  healthCondition: string;
  img: string;
  age: 'young' | 'adult' | 'old' | null;
  personality: PersonalityTag[];
}

interface FormErrors {
  name?: string;
  breed?: string;
  gender?: string;
  weight?: string;
  img?: string;
  age?: string;
  personality?: string;
}

export default function DogRegistrationScreen() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    breed: null,
    customizedBreed: '',
    gender: null,
    weight: 5.0,
    healthCondition: '',
    img: '',
    age: null,
    personality: [],
  });

  const { logout } = useAuth();

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const ageOptions = [
    { value: 'young', label: 'Young' },
    { value: 'adult', label: 'Adult' },
    { value: 'old', label: 'Senior' },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.breed) {
      newErrors.breed = 'Breed is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (formData.weight <= 0) {
      newErrors.weight = 'Please select a valid weight';
    }

    if (!formData.img) {
      newErrors.img = 'Puppy photo is required';
    }

    if (!formData.age) {
      newErrors.age = 'Age group is required';
    }

    if (formData.personality.length === 0) {
      newErrors.personality = 'Please select at least one personality trait';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    setSubmitting(true);

    try {
      const dogData: DogData = {
        name: formData.name.trim(),
        breed: formData.breed!,
        customizedBreed: formData.breed === 'other' ? formData.customizedBreed : undefined,
        gender: formData.gender!,
        weight: formData.weight,
        healthCondition: formData.healthCondition.trim() || 'No specific conditions',
        img: formData.img,
        age: formData.age!,
        personality: formData.personality,
      };

      await ApiService.createDog(dogData);
      
      // Automatically navigate to main page after successful creation
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to create puppy profile. Please try again.');
      console.error('Dog registration error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Puppy Profile</Text>
            <Text style={styles.subtitle}>
              For your furry friend
            </Text>
          </View>

          <View style={styles.form}>
            <ImageUpload
              onImageUploaded={(url) => {
                setFormData(prev => ({ ...prev, img: url }));
                if (errors.img) {
                  setErrors(prev => ({ ...prev, img: undefined }));
                }
              }}
              initialImageUrl={formData.img}
              required
            />
            {errors.img && <Text style={styles.errorText}>{errors.img}</Text>}

            <FormInput
              label="Name"
              required
              value={formData.name}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, name: text }));
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: undefined }));
                }
              }}
              placeholder="Enter your puppy's name"
              error={errors.name}
            />

            <BreedSelector
              selectedBreed={formData.breed}
              customBreed={formData.customizedBreed}
              onBreedSelect={(breed) => {
                setFormData(prev => ({ ...prev, breed }));
                if (errors.breed) {
                  setErrors(prev => ({ ...prev, breed: undefined }));
                }
              }}
              onCustomBreedChange={(customizedBreed) => {
                setFormData(prev => ({ ...prev, customizedBreed }));
              }}
              required
            />
            {errors.breed && <Text style={styles.errorText}>{errors.breed}</Text>}

            <SegmentedControl
              label="Gender"
              required
              options={genderOptions}
              selectedValue={formData.gender}
              onValueChange={(gender) => {
                setFormData(prev => ({ ...prev, gender: gender as any }));
                if (errors.gender) {
                  setErrors(prev => ({ ...prev, gender: undefined }));
                }
              }}
            />
            {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

            <SegmentedControl
              label="Age Group"
              required
              options={ageOptions}
              selectedValue={formData.age}
              onValueChange={(age) => {
                setFormData(prev => ({ ...prev, age: age as any }));
                if (errors.age) {
                  setErrors(prev => ({ ...prev, age: undefined }));
                }
              }}
            />
            {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}

            <PersonalitySelector
              selectedPersonalities={formData.personality}
              onPersonalityToggle={(personality) => {
                setFormData(prev => ({
                  ...prev,
                  personality: prev.personality.includes(personality)
                    ? prev.personality.filter(p => p !== personality)
                    : [...prev.personality, personality]
                }));
                if (errors.personality) {
                  setErrors(prev => ({ ...prev, personality: undefined }));
                }
              }}
              required
            />
            {errors.personality && <Text style={styles.errorText}>{errors.personality}</Text>}

            <WeightSlider
              value={formData.weight}
              onValueChange={(weight) => {
                setFormData(prev => ({ ...prev, weight }));
                if (errors.weight) {
                  setErrors(prev => ({ ...prev, weight: undefined }));
                }
              }}
              required
              error={errors.weight}
            />

            <FormInput
              label="Health Condition"
              value={formData.healthCondition}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, healthCondition: text }));
              }}
              placeholder="Any health conditions or notes (optional)"
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.textOnPrimary} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Create Profile</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.devLogoutButton}
              onPress={logout}
            >
              <Text style={styles.submitButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  form: {
    padding: 20,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: -15,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.buttonDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  devLogoutButton: {
    backgroundColor: Colors.error,
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
});