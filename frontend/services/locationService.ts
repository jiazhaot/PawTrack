import * as Location from "expo-location";
import {
  Coordinate,
  RoutePoint,
  shouldSavePoint,
  calculateDistance,
} from "@/utils/geoUtils";

export interface LocationTrackingConfig {
  timeInterval: number; // GPS position update interval in ms
  distanceInterval: number; // GPS distance threshold in meters
  saveThreshold: number; // App-level distance threshold for saving points
  maxJumpDistance: number; // Maximum allowed distance jump in meters
  accuracyThreshold: number; // Minimum GPS accuracy required in meters
}

export const DEFAULT_TRACKING_CONFIG: LocationTrackingConfig = {
  timeInterval: 3000, // 3 seconds
  distanceInterval: 3, // 3 meters GPS threshold
  saveThreshold: 2, // 2 meters app threshold
  maxJumpDistance: 100, // 100 meters max jump
  accuracyThreshold: 20, // 20 meters max accuracy
};

export interface LocationUpdateCallback {
  (location: Location.LocationObject, shouldSave: boolean): void;
}

export class LocationService {
  private subscription: Location.LocationSubscription | null = null;
  private lastSavedPoint: Coordinate | null = null;
  private lastSavedTime: number | null = null;
  private config: LocationTrackingConfig;
  private callback: LocationUpdateCallback | null = null;

  constructor(config: LocationTrackingConfig = DEFAULT_TRACKING_CONFIG) {
    this.config = config;
  }

  /**
   * Request location permissions
   */
  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  }

  /**
   * Get current location
   */
  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      return await Location.getCurrentPositionAsync({});
    } catch (error) {
      console.error("Failed to get current location:", error);
      return null;
    }
  }

  /**
   * Start location tracking
   */
  async startTracking(callback: LocationUpdateCallback): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error("Location permission denied");
      }

      this.callback = callback;
      this.lastSavedPoint = null;
      this.lastSavedTime = null;

      this.subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: this.config.timeInterval,
          distanceInterval: this.config.distanceInterval,
        },
        this.handleLocationUpdate.bind(this)
      );

      console.log(
        "📍 LocationService: Started tracking with config:",
        this.config
      );
      return true;
    } catch (error) {
      console.error("❌ LocationService: Failed to start tracking:", error);
      return false;
    }
  }

  /**
   * Stop location tracking
   */
  stopTracking(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
      this.callback = null;
      this.lastSavedPoint = null;
      this.lastSavedTime = null;
      console.log("🛑 LocationService: Stopped tracking");
    }
  }

  /**
   * Check if a location point is an outlier
   */
  private isOutlierPoint(location: Location.LocationObject): boolean {
    const newPoint: Coordinate = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    // Check GPS accuracy first
    const accuracy = location.coords.accuracy || 0;
    if (accuracy > this.config.accuracyThreshold) {
      console.log(
        `⚠️ LocationService: Poor GPS accuracy (${accuracy.toFixed(1)}m)`
      );
      return true;
    }

    // If no previous point, accept this one
    if (!this.lastSavedPoint || !this.lastSavedTime) {
      return false;
    }

    const distance = calculateDistance(this.lastSavedPoint, newPoint);

    // Check for distance jump that's too large
    if (distance > this.config.maxJumpDistance) {
      console.log(
        `⚠️ LocationService: Distance jump too large (${distance.toFixed(1)}m)`
      );
      return true;
    }

    return false;
  }

  /**
   * Handle location updates from GPS
   */
  private handleLocationUpdate(location: Location.LocationObject): void {
    // First check if this is an outlier point
    if (this.isOutlierPoint(location)) {
      console.log("❌ LocationService: Rejecting outlier point");
      // Still call callback but mark as not to save
      if (this.callback) {
        this.callback(location, false);
      }
      return;
    }

    const newPoint: Coordinate = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    // Check if we should save this point based on distance threshold
    const shouldSave = shouldSavePoint(
      newPoint,
      this.lastSavedPoint,
      this.config.saveThreshold
    );

    if (shouldSave) {
      // Log distance for debugging
      if (this.lastSavedPoint) {
        const distance = calculateDistance(this.lastSavedPoint, newPoint);
        const accuracy = location.coords.accuracy || 0;
        // console.log(`📍 LocationService: Saving point (${distance.toFixed(1)}m from last, accuracy: ${accuracy.toFixed(1)}m)`);
      } else {
        // console.log('📍 LocationService: Saving first point');
      }

      this.lastSavedPoint = newPoint;
      this.lastSavedTime = Date.now();
    }

    // Always call the callback, let it know if we should save
    if (this.callback) {
      this.callback(location, shouldSave);
    }
  }

  /**
   * Get tracking status
   */
  isTracking(): boolean {
    return this.subscription !== null;
  }

  /**
   * Update tracking configuration
   */
  updateConfig(newConfig: Partial<LocationTrackingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log("🔧 LocationService: Updated config:", this.config);
  }

  /**
   * Reset saved point (useful when starting a new route)
   */
  resetSavedPoint(): void {
    this.lastSavedPoint = null;
    console.log("🔄 LocationService: Reset saved point");
  }
}
