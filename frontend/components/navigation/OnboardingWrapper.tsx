import React, { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingLoader } from './OnboardingLoader';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  const { isLoading, needsOnboarding, error } = useOnboarding();
  const hasNavigated = useRef(false);

  console.log('OnboardingWrapper state:', { isLoading, needsOnboarding, error });

  useEffect(() => {
    console.log('OnboardingWrapper useEffect:', { isLoading, needsOnboarding, hasNavigated: hasNavigated.current });
    
    if (!isLoading && needsOnboarding && !hasNavigated.current) {
      console.log('Navigating to dog-registration');
      hasNavigated.current = true;
      // Navigate to dog registration screen
      router.replace('/dog-registration');
    } else if (!isLoading && !needsOnboarding) {
      hasNavigated.current = false;
    }
  }, [isLoading, needsOnboarding]);

  if (isLoading) {
    return <OnboardingLoader />;
  }

  if (needsOnboarding) {
    // Return null while navigating to prevent flash
    return null;
  }

  return <>{children}</>;
}