import { useState, useCallback, useEffect } from 'react';
import { ApiService, DogData } from '@/services/api';

export function useDog() {
  const [dogProfile, setDogProfile] = useState<DogData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDogProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.getDogProfile();
      if (response.success) {
        setDogProfile(response.data);
      } else {
        setError('Failed to fetch dog profile');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dog profile';
      setError(errorMessage);
      console.error('Dog profile fetch error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDogProfile();
  }, [fetchDogProfile]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    dogProfile,
    loading,
    error,
    fetchDogProfile,
    clearError,
  };
}