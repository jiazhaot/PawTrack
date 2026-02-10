export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface RoutePoint extends Coordinate {
  timestamp: Date;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param point1 First coordinate
 * @param point2 Second coordinate
 * @returns Distance in meters
 */
export function calculateDistance(point1: Coordinate, point2: Coordinate): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate total distance for a route
 * @param points Array of route points
 * @returns Total distance in meters
 */
export function calculateTotalDistance(points: RoutePoint[]): number {
  if (points.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < points.length; i++) {
    totalDistance += calculateDistance(points[i - 1], points[i]);
  }

  return totalDistance;
}

/**
 * Calculate average speed for a route
 * @param points Array of route points
 * @returns Speed in km/h, or 0 if cannot calculate
 */
export function calculateAverageSpeed(points: RoutePoint[]): number {
  if (points.length < 2) return 0;

  const totalDistance = calculateTotalDistance(points); // meters
  const startTime = points[0].timestamp.getTime();
  const endTime = points[points.length - 1].timestamp.getTime();
  const timeInHours = (endTime - startTime) / (1000 * 60 * 60);

  if (timeInHours === 0) return 0;

  return (totalDistance / 1000) / timeInHours; // km/h
}

/**
 * Get bounding box for a set of coordinates
 * @param points Array of coordinates
 * @returns Bounding box with center and deltas for map region
 */
export function getBoundingBox(points: Coordinate[]) {
  if (points.length === 0) return null;

  const latitudes = points.map(p => p.latitude);
  const longitudes = points.map(p => p.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  // Add padding to the deltas
  const latDelta = Math.max((maxLat - minLat) * 1.2, 0.01);
  const lngDelta = Math.max((maxLng - minLng) * 1.2, 0.01);

  return {
    latitude: centerLat,
    longitude: centerLng,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}

/**
 * Check if a new point should be saved based on distance threshold
 * @param newPoint New coordinate
 * @param lastSavedPoint Last saved coordinate
 * @param threshold Distance threshold in meters
 * @returns True if point should be saved
 */
export function shouldSavePoint(
  newPoint: Coordinate,
  lastSavedPoint: Coordinate | null,
  threshold: number = 2
): boolean {
  if (!lastSavedPoint) return true;

  const distance = calculateDistance(lastSavedPoint, newPoint);
  return distance > threshold;
}