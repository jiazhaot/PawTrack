import { useEffect, useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { Region } from 'react-native-maps';

export function useLocation() {
  const [currentLocation, setCurrentLocation] = useState<Region | null>(null);

  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        console.log('Location permission granted!');
        getCurrentLocation();
      } else {
        console.log('Location permission denied.');
      }
    } catch (err) {
      console.warn(err);
    }
  }, []);

  const getCurrentLocation = async () => {
    try {
      const position = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = position.coords;
      const region = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setCurrentLocation(region);
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  return { currentLocation };
}