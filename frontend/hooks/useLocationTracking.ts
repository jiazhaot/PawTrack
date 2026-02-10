import { useState, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { LocationService, LocationTrackingConfig, DEFAULT_TRACKING_CONFIG } from '@/services/locationService';
import { RoutePoint, calculateTotalDistance } from '@/utils/geoUtils';

export interface UseLocationTrackingReturn {
  // State
  isTracking: boolean;
  currentLocation: Location.LocationObject | null;
  routePoints: RoutePoint[];
  totalDistance: number;

  // Actions
  startTracking: () => Promise<boolean>;
  stopTracking: () => void;
  addManualPoint: (location: Location.LocationObject) => void;
  clearRoute: () => void;

  // Callbacks for route updates
  onLocationUpdate?: (location: Location.LocationObject, shouldSave: boolean) => void;
}

export interface UseLocationTrackingOptions {
  config?: Partial<LocationTrackingConfig>;
  onLocationUpdate?: (location: Location.LocationObject, shouldSave: boolean) => void;
  onRoutePointAdded?: (point: RoutePoint) => void;
}

export function useLocationTracking(options: UseLocationTrackingOptions = {}): UseLocationTrackingReturn {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [totalDistance, setTotalDistance] = useState(0);

  const locationServiceRef = useRef<LocationService | null>(null);

  // Initialize location service with config
  const getLocationService = useCallback(() => {
    if (!locationServiceRef.current) {
      const config = { ...DEFAULT_TRACKING_CONFIG, ...options.config };
      locationServiceRef.current = new LocationService(config);
    }
    return locationServiceRef.current;
  }, [options.config]);

  // Handle location updates from the service
  const handleLocationUpdate = useCallback((location: Location.LocationObject, shouldSave: boolean) => {
    setCurrentLocation(location);

    // Call external callback if provided
    if (options.onLocationUpdate) {
      options.onLocationUpdate(location, shouldSave);
    }

    // Add to route points if we should save
    if (shouldSave) {
      const newPoint: RoutePoint = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date(),
      };

      setRoutePoints(prev => {
        const updated = [...prev, newPoint];

        // Update total distance
        setTotalDistance(calculateTotalDistance(updated));

        // Call callback for new point
        if (options.onRoutePointAdded) {
          options.onRoutePointAdded(newPoint);
        }

        return updated;
      });
    }
  }, [options.onLocationUpdate, options.onRoutePointAdded]);

  // Start tracking
  const startTracking = useCallback(async (): Promise<boolean> => {
    const service = getLocationService();

    // Get initial location
    const initialLocation = await service.getCurrentLocation();
    if (initialLocation) {
      setCurrentLocation(initialLocation);
    }

    // Start tracking
    const success = await service.startTracking(handleLocationUpdate);
    if (success) {
      setIsTracking(true);
      service.resetSavedPoint(); // Reset for new route
      console.log('🚀 useLocationTracking: Started tracking');
    }

    return success;
  }, [getLocationService, handleLocationUpdate]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    const service = getLocationService();
    service.stopTracking();
    setIsTracking(false);
    console.log('🛑 useLocationTracking: Stopped tracking');
  }, [getLocationService]);

  // Add manual point (useful for testing or manual waypoints)
  const addManualPoint = useCallback((location: Location.LocationObject) => {
    const newPoint: RoutePoint = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: new Date(),
    };

    setRoutePoints(prev => {
      const updated = [...prev, newPoint];
      setTotalDistance(calculateTotalDistance(updated));

      if (options.onRoutePointAdded) {
        options.onRoutePointAdded(newPoint);
      }

      return updated;
    });

    setCurrentLocation(location);
  }, [options.onRoutePointAdded]);

  // Clear route data
  const clearRoute = useCallback(() => {
    setRoutePoints([]);
    setTotalDistance(0);
    const service = getLocationService();
    service.resetSavedPoint();
    console.log('🔄 useLocationTracking: Cleared route');
  }, [getLocationService]);

  return {
    // State
    isTracking,
    currentLocation,
    routePoints,
    totalDistance,

    // Actions
    startTracking,
    stopTracking,
    addManualPoint,
    clearRoute,
  };
}