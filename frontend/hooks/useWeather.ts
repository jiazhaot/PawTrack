import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { ApiService } from '../services/api';
import { WeatherDisplayData } from '../types/weather';
import { formatWeatherData } from '../utils/weatherUtils';

export const useWeather = () => {
  const [weatherData, setWeatherData] = useState<WeatherDisplayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherData();
    // Refresh weather every hour
    const interval = setInterval(fetchWeatherData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Fetch weather data
      const response = await ApiService.getWeather(longitude, latitude);

      if (response.code === 0 && response.data) {
        const formattedData = formatWeatherData(response);
        setWeatherData(formattedData);
      } else {
        setError('Failed to fetch weather data');
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Failed to load weather');
    } finally {
      setLoading(false);
    }
  };

  return { weatherData, loading, error, refresh: fetchWeatherData };
};