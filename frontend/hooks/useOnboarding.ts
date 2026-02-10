import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { ApiService } from '@/services/api';

interface OnboardingState {
  isLoading: boolean;
  needsOnboarding: boolean;
  error: string | null;
}

export function useOnboarding(): OnboardingState {
  const [state, setState] = useState<OnboardingState>({
    isLoading: true,
    needsOnboarding: false,
    error: null,
  });

  const checkOnboardingStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await ApiService.getDogProfile();
      console.log('Onboarding check response:', response);
      console.log('response.data:', response.data);
      console.log('!response.data (needsOnboarding):', !response.data);
      
      setState({
        isLoading: false,
        needsOnboarding: !response.data,
        error: null,
      });
    } catch (error) {
      console.error('Onboarding check error:', error);
      setState({
        isLoading: false,
        needsOnboarding: true, // Default to showing onboarding if there's an error
        error: error instanceof Error ? error.message : 'Failed to check profile',
      });
    }
  }, []);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  // Re-check when the screen gains focus (e.g., navigating back from registration)
  useFocusEffect(
    useCallback(() => {
      checkOnboardingStatus();
    }, [checkOnboardingStatus])
  );

  return state;
}