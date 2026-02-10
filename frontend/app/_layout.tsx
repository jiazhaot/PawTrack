import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router, useSegments, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { TamaguiProvider, Theme } from 'tamagui';
import tamaguiConfig from '../tamagui.config';
import { Silkscreen_400Regular, Silkscreen_700Bold } from '@expo-google-fonts/silkscreen';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/theme/Colors';
import { AuthProvider, useAuth } from '@/context/auth';

// Prevent the splash screen from auto-hiding before we can check the user's auth status
SplashScreen.preventAutoHideAsync();

// Create custom themes for React Navigation using your color palette
const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.text,
    border: Colors.border,
    notification: Colors.primary,
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.primary,
    background: Colors.dark.background,
    card: Colors.dark.surface,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.primary,
  },
};


/**
 * This component contains the core navigation logic and the "Auth Gate".
 * It's separate from RootLayout so it can use the useAuth() hook provided by AuthProvider.
 */
function InitialLayout() {
  // CHANGED: Get the new `isLoading` state and use `token` instead of `userToken`
  const { token, isLoading, checkAuthStatus } = useAuth();
  const segments = useSegments();
  
  // This effect runs once on mount to start the process of checking for a stored token.
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // This single, robust effect handles both hiding the splash screen and redirecting the user.
  useEffect(() => {
    // If we are still checking for a token, don't do anything yet.
    // The native splash screen will remain visible.
    if (isLoading) {
      return;
    }

    // When loading is finished, we are ready to hide the splash screen.
    SplashScreen.hideAsync();

    const inAuthGroup = segments[0] === 'auth';

    // Now, handle the redirection logic.
    if (token && inAuthGroup) {
      // User is logged in but is in the auth group (e.g., login screen), so redirect away.
      router.replace('/(tabs)');
    } else if (!token && !inAuthGroup) {
      // User is not logged in and is trying to access a protected screen, so redirect to login.
      router.replace('/auth/login');
    }
  }, [token, isLoading, segments]); // Re-run whenever auth state, loading status, or route changes

  // While the auth status is loading, the splash screen is visible.
  // We render nothing here to prevent any screen flashes or layout shifts.
  if (isLoading) {
    return null;
  }

  // Once loading is complete, render the main navigation stack.
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen 
        name="dog-registration" 
        options={{ 
          headerShown: false,
          presentation: 'modal',
        }} 
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}


// Set up all the global providers
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Silkscreen': Silkscreen_400Regular,
    'Silkscreen-Bold': Silkscreen_700Bold,
  });

  // Keep showing the splash screen until fonts are loaded
  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      {/* 2. TamaguiProvider sets up the Tamagui UI library. */}
      <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme || 'light'}>
        {/* 3. Tamagui's Theme component applies light/dark mode to Tamagui components. */}
        <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
          {/* 4. React Navigation's ThemeProvider applies themes to navigation elements. */}
          <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme}>
            <InitialLayout />
            <StatusBar style="dark" />
          </ThemeProvider>
        </Theme>
      </TamaguiProvider>
    </AuthProvider>
  );
}