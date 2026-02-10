// Euclidean distance calculation
export function euclideanDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const meanLatRad = toRad((lat1 + lat2) / 2);

  // ~110,574 meters per 1° latitude
  const mPerDegLat = 110_574;
  // ~111,320 * cos(latitude) meters per 1° longitude
  const mPerDegLon = 111_320 * Math.cos(meanLatRad);

  const dx = (lon2 - lon1) * mPerDegLon;
  const dy = (lat2 - lat1) * mPerDegLat;

  return Math.hypot(dx, dy);
}

// Format distance into human-friendly string
export function formatDistance(meters: number): string {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km`
    : `${Math.round(meters)} m`;
}