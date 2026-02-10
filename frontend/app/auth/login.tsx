import { useState } from 'react';
import {
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
import { Link } from 'expo-router';

import { FormInput } from '@/components/forms/FormInput';
import { Colors } from '@/constants/theme/Colors';
import { useAuth } from '@/context/auth';
import { ApiService } from '@/services/api'; // Make sure this path is correct

export default function LoginScreen() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Calls the API service with username
      const response = await ApiService.login(formData.username, formData.password);
      
      if (response.token) {
        await login(response.token);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Ops.An unknown error occurred.');
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
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to PawTrack!</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
          <FormInput
            label="Username"
            value={formData.username}
            onChangeText={username => setFormData(prev => ({ ...prev, username }))}
            placeholder="Enter your username"
            error={errors.username}
            autoCapitalize="none"
          />
          <FormInput
            label="Password"
            value={formData.password}
            onChangeText={password => setFormData(prev => ({ ...prev, password }))}
            placeholder="Enter your password"
            error={errors.password}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.textOnPrimary} size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/auth/sign-up" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center' },
  keyboardAvoidingView: { flex: 1, justifyContent: 'center' },
  header: { padding: 20, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '800', color: Colors.primary, textAlign: 'center', letterSpacing: 0.5 },
  subtitle: { fontSize: 14, color: Colors.secondary, textAlign: 'center', marginTop: 8 },
  form: { paddingHorizontal: 20 },
  submitButton: { backgroundColor: Colors.primary, paddingVertical: 18, borderRadius: 25, alignItems: 'center', marginTop: 20 },
  submitButtonDisabled: { backgroundColor: Colors.buttonDisabled },
  submitButtonText: { color: Colors.textOnPrimary, fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: Colors.textSecondary },
  linkText: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
});