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
import { router, Link } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { FormInput } from '@/components/forms/FormInput';
import { LanguageSelector } from '@/components/forms/LanguageSelector';
import { SegmentedControl } from '@/components/forms/SegmentedControl';

import { Colors } from '@/constants/theme/Colors';
import { ApiService, SignUpPayload } from '@/services/api';

// TYPE DEFINITIONS
interface FormData {
  email: string;
  username: string;
  nickname: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: Date | null;
  gender: 'female' | 'male' | 'other' | 'prefer_not_to_say';
  languages: string[];
}

interface FormErrors {
  email?: string;
  username?: string;
  nickname?: string;
  password?: string;
  confirmPassword?: string;
  dateOfBirth?: string;
}

export default function SignUpScreen() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: null,
    gender: 'prefer_not_to_say',
    languages: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const genderOptions = [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'other', label: 'Other' },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]+$/;

    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (formData.username.trim().length < 3 || formData.username.trim().length > 20) {
      newErrors.username = 'Username must be 3-20 characters';
    } else if (!usernameRegex.test(formData.username)) {
      newErrors.username = 'Username can only use letters, numbers, and underscores';
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData(prev => ({ ...prev, dateOfBirth: selectedDate }));
      if (errors.dateOfBirth) {
        setErrors(prev => ({ ...prev, dateOfBirth: undefined }));
      }
    }
  };
  
  const handleInputChange = (field: keyof Omit<FormData, 'dateOfBirth' | 'gender' | 'languages'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors on the form.');
      return;
    }

    setSubmitting(true);
    try {
      const apiPayload: SignUpPayload = {
        username: formData.username.trim(),
        nickname: formData.nickname.trim(),
        password: formData.password,
        email: formData.email.trim(),
        dateOfBirth: formData.dateOfBirth!.toISOString().split('T')[0],
        gender: formData.gender,
        language: formData.languages,
        roles: ["user"],
      };

      await ApiService.createUser(apiPayload);
      
      Alert.alert(
        'Account Created!',
        'You can now log in with your new credentials.',
        [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
      );

    } catch (error) {
      Alert.alert('Registration Error', error instanceof Error ? error.message : 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the PawTrack community</Text>
          </View>

          <View style={styles.form}>
            <FormInput
              label="Email"
              required
              value={formData.email}
              onChangeText={text => handleInputChange('email', text)}
              placeholder="you@example.com"
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FormInput
              label="Username"
              required
              value={formData.username}
              onChangeText={text => handleInputChange('username', text)}
              placeholder="e.g., puppy_lover_99"
              error={errors.username}
              maxLength={20}
              autoCapitalize="none"
            />
            <FormInput
              label="Nickname"
              value={formData.nickname}
              onChangeText={text => handleInputChange('nickname', text)}
              placeholder="How you'd like to be called (optional)"
              maxLength={50}
            />
            <FormInput
              label="Password"
              required
              value={formData.password}
              onChangeText={text => handleInputChange('password', text)}
              placeholder="Minimum 8 characters"
              error={errors.password}
              secureTextEntry
            />
            <FormInput
              label="Confirm Password"
              required
              value={formData.confirmPassword}
              onChangeText={text => handleInputChange('confirmPassword', text)}
              placeholder="Repeat your password"
              error={errors.confirmPassword}
              secureTextEntry
            />

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Date of Birth <Text style={styles.requiredAsterisk}>*</Text></Text>
              <TouchableOpacity style={styles.dateInputButton} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateInputText}>
                  {formData.dateOfBirth ? formData.dateOfBirth.toLocaleDateString() : 'Select your date of birth'}
                </Text>
              </TouchableOpacity>
              {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={formData.dateOfBirth || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
            
            <SegmentedControl
              label="Gender"
              options={genderOptions}
              selectedValue={formData.gender}
              onValueChange={value => setFormData(prev => ({...prev, gender: value as any}))}
            />
            
            <LanguageSelector
              selectedLanguages={formData.languages}
              onLanguageToggle={lang => {
                setFormData(prev => ({
                  ...prev,
                  languages: prev.languages.includes(lang) ? prev.languages.filter(l => l !== lang) : [...prev.languages, lang],
                }));
              }}
            />

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.textOnPrimary} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Create My Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/auth/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 40 },
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
  form: { padding: 20 },
  fieldContainer: { marginBottom: 20 },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  requiredAsterisk: { color: Colors.primary },
  dateInputButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  dateInputText: { fontSize: 14, color: Colors.text },
  errorText: { color: Colors.error, fontSize: 12, marginTop: 5 },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  linkText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
  },
});