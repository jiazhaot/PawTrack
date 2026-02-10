import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme/Colors';

// UPDATED: Expanded list of 12 common languages with their ISO 639-1 codes.
const availableLanguages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: 'Chinese' },
  { code: 'es', name: 'Spanish' },
  { code: 'hi', name: 'Hindi' },
  { code: 'fr', name: 'French' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ru', name: 'Russian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ko', name: 'Korean' },
];

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onLanguageToggle: (languageCode: string) => void;
}

export function LanguageSelector({ selectedLanguages, onLanguageToggle }: LanguageSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Languages Spoken (Optional)</Text>
      <View style={styles.tagsContainer}>
        {availableLanguages.map(({ code, name }) => {
          const isSelected = selectedLanguages.includes(code);
          return (
            <TouchableOpacity
              key={code}
              style={[styles.tag, isSelected && styles.tagSelected]}
              onPress={() => onLanguageToggle(code)}
            >
              <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                {name}
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
    color: Colors.text,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tagText: {
    fontSize: 14,
    color: Colors.text,
  },
  tagTextSelected: {
    color: Colors.textOnPrimary,
    fontWeight: '600',
  },
});