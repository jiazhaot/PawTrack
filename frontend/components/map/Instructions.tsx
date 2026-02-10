import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme/Colors';

interface InstructionsProps {
  isAddingMarker: boolean;
  markerCount: number;
}

export function Instructions({ isAddingMarker, markerCount }: InstructionsProps) {
  return (
    <View style={styles.instructions}>
      <Text style={styles.instructionText}>
        {isAddingMarker ? 'Tap on the map to place a marker' : 'Tap 📌 to mark a place'}
      </Text>
      <Text style={styles.markerCount}>
        Markers placed: {markerCount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  instructions: {
    position: 'absolute',
    top: 20,
    left: 20,
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
  instructionText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
    color: Colors.text,
  },
  markerCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});