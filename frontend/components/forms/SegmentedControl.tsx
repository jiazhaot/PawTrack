import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '@/constants/theme/Colors';

interface Option {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  label: string;
  options: Option[];
  selectedValue: string | null;
  onValueChange: (value: string) => void;
  required?: boolean;
}

export function SegmentedControl({ 
  label, 
  options, 
  selectedValue, 
  onValueChange,
  required 
}: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.segmentContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.segment,
              index === 0 && styles.firstSegment,
              index === options.length - 1 && styles.lastSegment,
              selectedValue === option.value && styles.selectedSegment,
            ]}
            onPress={() => onValueChange(option.value)}
          >
            <Text
              style={[
                styles.segmentText,
                selectedValue === option.value && styles.selectedSegmentText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  segmentContainer: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  segment: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 2,
    borderRightColor: Colors.border,
  },
  firstSegment: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  lastSegment: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderRightWidth: 0,
  },
  selectedSegment: {
    backgroundColor: Colors.primary,
  },
  segmentText: {
    fontSize: 14,
    color: Colors.text,
  },
  selectedSegmentText: {
    color: Colors.textOnPrimary,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});