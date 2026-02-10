import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors } from '@/constants/theme/Colors';

interface WeightSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  required?: boolean;
  error?: string;
}

export function WeightSlider({ value, onValueChange, required, error }: WeightSliderProps) {
  const handleValueChange = (sliderValue: number) => {
    // Round to 1 decimal place
    const roundedValue = Math.round(sliderValue * 10) / 10;
    onValueChange(roundedValue);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Weight (kg) {required && <Text style={styles.required}>*</Text>}
      </Text>
      
      <View style={styles.sliderContainer}>
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{value.toFixed(1)} kg</Text>
        </View>
        
        <Slider
          style={styles.slider}
          minimumValue={0.1}
          maximumValue={150.0}
          value={value}
          onValueChange={handleValueChange}
          minimumTrackTintColor={Colors.primary}
          maximumTrackTintColor={Colors.inputBorder}
        />
        
        <View style={styles.rangeLabels}>
          <Text style={styles.rangeLabel}>0.1 kg</Text>
          <Text style={styles.rangeLabel}>150.0 kg</Text>
        </View>
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.text,
  },
  required: {
    color: Colors.primary,
  },
  sliderContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  thumb: {
    backgroundColor: Colors.primary,
    width: 24,
    height: 24,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  track: {
    height: 6,
    borderRadius: 3,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  rangeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});