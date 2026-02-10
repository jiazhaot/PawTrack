import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme/Colors';

interface AddMarkerButtonProps {
  isAddingMarker: boolean;
  onPress: () => void;
}

export function AddMarkerButton({ isAddingMarker, onPress }: AddMarkerButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.addMarkerButton, isAddingMarker && styles.addMarkerButtonActive]}
      onPress={onPress}
    >
      <Text style={styles.addMarkerButtonText}>📌</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  addMarkerButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: Colors.surface,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addMarkerButtonActive: {
    backgroundColor: Colors.primary,
  },
  addMarkerButtonText: {
    fontSize: 24,
  },
});