/**
 * Warm & Trustworthy Theme
 * Inspired by Golden retriever: friendly and reliable
 */

// Core theme colors
export const Colors = {
  // Primary colors - golden retriever yellow
  primary: '#FFD54F',      // Golden retriever yellow - warm and inviting
  primaryLight: '#FFECB3', // Light golden yellow
  primaryDark: '#FFB300',  // Deeper golden yellow

  // Secondary colors - warm brown
  secondary: '#8D6E63',    // Warm brown - earthy and trustworthy
  secondaryLight: '#BCAAA4', // Light brown
  secondaryDark: '#5D4037', // Deep brown

  // Accent colors - soft teal
  accent: '#4DB6AC',       // Soft teal - calming and fresh
  accentLight: '#80CBC4',  // Light teal
  
  // Neutral colors - cream background
  background: '#FFF8E1',   // Cream background - warm and cozy
  surface: '#FFFFFF',      // Pure white for cards
  cardBackground: '#FFF9C4', // Very light cream for cards

  // Text colors
  text: '#5D4037',         // Deep brown - warm and readable
  textSecondary: '#8D6E63', // Warm brown for secondary text
  textLight: '#BCAAA4',    // Light brown
  textOnPrimary: '#5D4037', // Deep brown text on golden backgrounds

  // Status colors - warm and friendly
  success: '#4CAF50',      // Natural green - like healthy plants
  warning: '#FF9800',      // Warm orange - friendly warning
  error: '#F44336',        // Warm red - clear but not harsh
  
  // Border and divider colors
  border: '#BCAAA4',       // Light brown border - warm and subtle
  divider: '#D7CCC8',      // Very light brown divider

  // Button colors
  buttonPrimary: '#FFD54F',    // Golden yellow
  buttonSecondary: '#8D6E63',  // Warm brown
  buttonDisabled: '#CCCCCC',
  
  // Input colors
  inputBackground: '#FFFFFF',  // Clean white background
  inputBorder: '#BCAAA4',     // Light brown border
  inputFocus: '#FFD54F',      // Golden yellow focus
  
  // Extra warm colors
  powerUp: '#4DB6AC',      // Soft teal - for special features
  coin: '#FFD54F',         // Golden yellow - for rewards/points
  health: '#4CAF50',       // Natural green - for positive states
  energy: '#FFD54F',       // Golden yellow - for primary actions/energy

  // Theme variants for light/dark mode compatibility
  light: {
    text: '#5D4037',         // Deep brown
    background: '#FFF8E1',   // Cream background
    tint: '#FFD54F',         // Golden yellow
    icon: '#8D6E63',         // Warm brown
    tabIconDefault: '#BCAAA4', // Light brown
    tabIconSelected: '#FFD54F', // Golden yellow
  },
  dark: {
    text: '#FFF8E1',          // Use the light cream for text
    background: '#5D4037',      // Use the deep brown for the background
    primary: '#FFD54F',       // Primary color can often stay the same
    secondary: '#BCAAA4',     // Use a lighter brown for secondary elements
    surface: '#6D4C41',         // A slightly lighter brown for cards
    border: '#8D6E63',          // A more prominent brown for borders
    textOnPrimary: '#5D4037',  // This can also stay the same
    tint: '#FFF8E1',          // Cream tint for active elements
    icon: '#BCAAA4',          // Light brown for icons
    tabIconDefault: '#8D6E63', // Muted warm brown for inactive tabs
    tabIconSelected: '#FFF8E1', // Cream for selected tabs
  },
};