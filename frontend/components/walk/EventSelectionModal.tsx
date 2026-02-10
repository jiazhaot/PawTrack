import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Colors } from '@/constants/theme/Colors';

interface EventOption {
  type: 'poop' | 'play' | 'water' | 'meeting';
  emoji: string;
  label: string;
}

interface EventSelectionModalProps {
  visible: boolean;
  onEventSelect: (eventType: EventOption['type']) => void;
  onClose: () => void;
}

const eventOptions: EventOption[] = [
  { type: 'poop', emoji: '💩', label: 'Poop' },
  { type: 'play', emoji: '🎾', label: 'Play Time' },
  { type: 'water', emoji: '💧', label: 'Water Break' },
  { type: 'meeting', emoji: '🐕', label: 'Met Another Dog' },
];

export function EventSelectionModal({ visible, onEventSelect, onClose }: EventSelectionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modalContainer}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <Text style={styles.title}>What happened?</Text>
              <Text style={styles.subtitle}>Select an event to record</Text>
            </View>

            <View style={styles.optionsGrid}>
              {eventOptions.map((option) => (
                <TouchableOpacity
                  key={option.type}
                  style={styles.optionButton}
                  onPress={() => onEventSelect(option.type)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.text,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  optionButton: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    minHeight: 80,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 12,
  },
  cancelButton: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});