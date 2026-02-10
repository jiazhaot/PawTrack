import { useState } from 'react';
import { MapPressEvent } from 'react-native-maps';

interface MarkerData {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  key: string;
  title?: string;
}

export function useMapMarkers() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [isAddingMarker, setIsAddingMarker] = useState<boolean>(false);

  const handleMapPress = (event: MapPressEvent) => {
    if (event.nativeEvent.action === 'marker-press') {
      return;
    }

    if (!isAddingMarker) {
      setSelectedMarker(null);
      return;
    }

    const coordinate = event.nativeEvent.coordinate;
    const newMarker: MarkerData = {
      coordinate,
      key: `marker_${Date.now()}`,
      title: `Marker ${markers.length + 1}`,
    };
    
    setMarkers([...markers, newMarker]);
    setSelectedMarker(newMarker);
    setIsAddingMarker(false);
    
    console.log('New marker placed at:', {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
  };

  const removeMarker = (markerKey: string) => {
    setMarkers(markers.filter(m => m.key !== markerKey));
    setSelectedMarker(null);
  };

  const toggleAddingMarker = () => {
    setIsAddingMarker(!isAddingMarker);
  };

  const selectMarker = (marker: MarkerData) => {
    setSelectedMarker(marker);
  };

  return {
    markers,
    selectedMarker,
    isAddingMarker,
    handleMapPress,
    removeMarker,
    toggleAddingMarker,
    selectMarker,
  };
}