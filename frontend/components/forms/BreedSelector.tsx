import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DOG_BREEDS, searchBreeds, BreedOption, DogBreed } from '@/constants/data/dogBreeds';
import { Colors } from '@/constants/theme/Colors';

interface BreedSelectorProps {
  selectedBreed: DogBreed | null;
  customBreed: string;
  onBreedSelect: (breed: DogBreed) => void;
  onCustomBreedChange: (customBreed: string) => void;
  required?: boolean;
}

export function BreedSelector({ 
  selectedBreed, 
  customBreed, 
  onBreedSelect, 
  onCustomBreedChange,
  required
}: BreedSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBreeds = searchBreeds(searchQuery);
  const selectedBreedLabel = selectedBreed 
    ? DOG_BREEDS.find(b => b.value === selectedBreed)?.label
    : null;

  const handleBreedSelect = (breed: BreedOption) => {
    onBreedSelect(breed.value);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Breed {required && <Text style={styles.required}>*</Text>}
      </Text>
      
      <TouchableOpacity 
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.selectorText, !selectedBreedLabel && styles.placeholder]}>
          {selectedBreedLabel || 'Select breed'}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      {selectedBreed === 'other' && (
        <View style={styles.customBreedContainer}>
          <Text style={styles.customLabel}>Custom Breed</Text>
          <TextInput
            style={styles.customInput}
            value={customBreed}
            onChangeText={onCustomBreedChange}
            placeholder="Enter custom breed"
            placeholderTextColor={Colors.textLight}
          />
        </View>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Breed</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search breeds..."
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <FlatList
            data={filteredBreeds}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.breedItem,
                  selectedBreed === item.value && styles.selectedBreedItem
                ]}
                onPress={() => handleBreedSelect(item)}
              >
                <Text style={[
                  styles.breedItemText,
                  selectedBreed === item.value && styles.selectedBreedItemText
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
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
  selector: {
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
  },
  selectorText: {
    fontSize: 16,
    color: Colors.text,
  },
  placeholder: {
    color: Colors.textLight,
  },
  arrow: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  customBreedContainer: {
    marginTop: 12,
  },
  customLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: Colors.textSecondary,
  },
  customInput: {
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.inputBackground,
    color: Colors.text,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    padding: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.cardBackground,
    color: Colors.text,
  },
  breedItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  selectedBreedItem: {
    backgroundColor: Colors.primary,
  },
  breedItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  selectedBreedItemText: {
    color: Colors.textOnPrimary,
  },
});