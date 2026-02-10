import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme/Colors';

interface MarkerData {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  key: string;
  title?: string;
}

interface MarkerInfoProps {
  marker: MarkerData;
  onRemove: (key: string) => void;
}

export function MarkerInfo({ marker, onRemove }: MarkerInfoProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.markerInfo, { bottom: insets.bottom + 20 }]}>
      <Text style={styles.markerInfoTitle}>{marker.title}</Text>
      <Text style={styles.markerInfoCoords}>
        Lat: {marker.coordinate.latitude.toFixed(6)}
      </Text>
      <Text style={styles.markerInfoCoords}>
        Lng: {marker.coordinate.longitude.toFixed(6)}
      </Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove(marker.key)}
      >
        <Text style={styles.removeButtonText}>Remove Marker</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  markerInfo: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 10,
    shadowColor: Colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: Colors.text,
  },
  markerInfoCoords: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  removeButton: {
    marginTop: 10,
    backgroundColor: Colors.error,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  removeButtonText: {
    color: Colors.surface,
    fontWeight: 'bold',
  },
});