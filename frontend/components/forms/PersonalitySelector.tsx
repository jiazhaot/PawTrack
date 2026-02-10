import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { PersonalityTag } from '@/services/api';
import { Colors } from '@/constants/theme/Colors';

interface PersonalitySelectorProps {
  selectedPersonalities: PersonalityTag[];
  onPersonalityToggle: (personality: PersonalityTag) => void;
  required?: boolean;
}

const PERSONALITY_OPTIONS: PersonalityTag[] = [
  'friendly', 'outgoing', 'playful', 'loyal', 'gentle',
  'curious', 'energetic', 'affectionate', 'independent', 'calm'
];

export function PersonalitySelector({ 
  selectedPersonalities, 
  onPersonalityToggle, 
  required 
}: PersonalitySelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Personality {required && <Text style={styles.required}>*</Text>}
      </Text>
      <Text style={styles.subtitle}>Select all that apply</Text>
      
      <View style={styles.tagsContainer}>
        {PERSONALITY_OPTIONS.map((personality) => {
          const isSelected = selectedPersonalities.includes(personality);
          return (
            <TouchableOpacity
              key={personality}
              style={[
                styles.tag,
                isSelected && styles.tagSelected
              ]}
              onPress={() => onPersonalityToggle(personality)}
            >
              <Text style={[
                styles.tagText,
                isSelected && styles.tagTextSelected
              ]}>
                {personality}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    marginBottom: 4,
    color: Colors.text,
  },
  required: {
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tagSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tagText: {
    fontSize: 14,
    color: Colors.text,
    textTransform: 'capitalize',
  },
  tagTextSelected: {
    color: Colors.textOnPrimary,
    fontWeight: '600',
  },
});