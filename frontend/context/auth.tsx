import React, { createContext, useContext, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ApiService } from '@/services/api';
import { RouteApiService } from '@/services/routeApi';

// The key to store the token
const TOKEN_KEY = 'userToken';

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (storedToken) {
        setToken(storedToken);
        ApiService.setToken(storedToken);
        RouteApiService.setToken(storedToken);
      }
    } catch (e) {
      console.error('Failed to load auth token.', e);
    } finally {
      // Prevent screen flickering
      setIsLoading(false);
    }
  };

  const login = async (newToken: string) => {
    setIsLoading(true);
    setToken(newToken);
    ApiService.setToken(newToken);
    RouteApiService.setToken(newToken);
    // Wait for the token to be saved before proceeding
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    setToken(null);
    ApiService.setToken(null);
    RouteApiService.setToken(null);
    // Wait for the token to be deleted
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setIsLoading(false);
  };

  const value = {
    token,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}