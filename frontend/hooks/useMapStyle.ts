export type MapStyleType = 'standard' | 'satellite' | 'hybrid';

export function useMapStyle() {
  return {
    mapStyle: 'standard' as MapStyleType,
    lightLevel: 100,
    sensorError: null,
    isManualOverride: false,
    setMapStyle: () => {}, // No-op function for compatibility
  };
}