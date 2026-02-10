import { createTamagui, createFont } from 'tamagui';
import { createTokens } from '@tamagui/core';

// Step 1: Import your beautiful Colors object to be our single source of truth
import { Colors } from './constants/theme/Colors';

// Step 2: Define your app's brand font to keep everything consistent
const silkscreenFont = createFont({
  family: 'Silkscreen',
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    true: 14, // Default size for body text
  },
  lineHeight: {
    1: 16,
    2: 20,
    3: 22,
    4: 24,
    true: 20,
  },
  weight: {
    4: '400', // For Silkscreen_400Regular
    7: '700', // For Silkscreen_700Bold
    true: '400',
  },
});

// Step 3: Create design "tokens". These are the variables for your UI.
// We are creating them directly from your Colors object.
const tokens = createTokens({
  color: {
    // Core Theme
    primary: Colors.primary,
    secondary: Colors.secondary,
    accent: Colors.accent,
    // Status
    error: Colors.error,
    success: Colors.success,
    warning: Colors.warning,
    // Neutrals
    background: Colors.background,
    surface: Colors.surface,
    border: Colors.border,
    // Text
    text: Colors.text,
    textSecondary: Colors.textSecondary,
    textOnPrimary: Colors.textOnPrimary,
  },
  space: {
    0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, true: 16,
  },
  size: {
    0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, true: 16,
  },
  radius: {
    0: 0, 1: 4, 2: 8, 3: 12, 4: 25, true: 8,
  },
  zIndex: {
    0: 0, 1: 100, 2: 200, true: 100,
  },
});

// Step 4: Create COMPLETE light and dark themes using the tokens.
// This is the part that fixes your TypeScript error.
const lightTheme = {
  background: tokens.color.background,
  backgroundHover: tokens.color.surface,
  backgroundPress: tokens.color.border,
  backgroundFocus: Colors.primaryLight,
  color: tokens.color.text,
  colorHover: tokens.color.text,
  colorPress: tokens.color.text,
  colorFocus: tokens.color.text,
  borderColor: tokens.color.border,
  borderColorHover: tokens.color.secondary,
  borderColorPress: Colors.primaryDark,
  borderColorFocus: Colors.primaryDark,
  placeholderColor: tokens.color.textSecondary,
};

const darkTheme = {
  ...lightTheme, // Start with the light theme properties
  background: Colors.dark.background,
  backgroundHover: Colors.secondaryDark,
  color: Colors.dark.text,
  borderColor: Colors.dark.border,
  placeholderColor: Colors.dark.tabIconDefault,
};


// Step 5: Create the final config object
const config = createTamagui({
  fonts: {
    heading: silkscreenFont,
    body: silkscreenFont,
  },
  tokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
    accent: {
      background: '#FFD700',
      color: '#000',
    },
    alt1: {
      background: '#333',
      color: '#fff',
    },
    green: {
      background: '#2ecc71', 
      color: '#fff',
    },
    gray: {
      background: '#bdc3c7', 
      color: '#000',
    },
    red: {
      background: '#e74c3c', 
      color: '#fff',
    },
  },
  shorthands: {
    bg: 'backgroundColor',
    p: 'padding',
    m: 'margin',
    w: 'width',
    h: 'height',
  } as const,
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;