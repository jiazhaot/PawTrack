import { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme/Colors';
import { ApiService, DogData } from '@/services/api';
import { useAuth } from '@/context/auth';

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [dogData, setDogData] = useState<DogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDogProfile();
  }, []);

  const loadDogProfile = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getDogProfile();
      setDogData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load profile');
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !dogData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>🐕</Text>
          <Text style={styles.errorTitle}>Profile Not Found</Text>
          <Text style={styles.errorText}>Unable to load your puppy's profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Puppy Profile</Text>
          <Text style={styles.subtitle}>Your furry friend's details</Text>
        </View>

        <View style={styles.content}>
          {/* Profile Image and Name */}
          <View style={styles.profileCard}>
            <View style={styles.imageContainer}>
              {dogData.img ? (
                <Image source={{ uri: dogData.img }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderEmoji}>🐕</Text>
                </View>
              )}
            </View>
            <Text style={styles.dogName}>{dogData.name}</Text>
            <Text style={styles.dogBreed}>
              {dogData.breed === 'other' && dogData.customizedBreed 
                ? dogData.customizedBreed 
                : dogData.breed}
            </Text>
          </View>

          {/* Details Cards */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <View style={styles.detailCard}>
                <Text style={styles.detailIcon}>⚧️</Text>
                <Text style={styles.detailLabel}>Gender</Text>
                <Text style={styles.detailValue}>{dogData.gender}</Text>
              </View>
              
              <View style={styles.detailCard}>
                <Text style={styles.detailIcon}>🎂</Text>
                <Text style={styles.detailLabel}>Age Group</Text>
                <Text style={styles.detailValue}>{dogData.age}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailCard}>
                <Text style={styles.detailIcon}>⚖️</Text>
                <Text style={styles.detailLabel}>Weight</Text>
                <Text style={styles.detailValue}>{dogData.weight} kg</Text>
              </View>
              
              <View style={styles.detailCard}>
                <Text style={styles.detailIcon}>❤️</Text>
                <Text style={styles.detailLabel}>Health</Text>
                <Text style={styles.detailValue}>Good</Text>
              </View>
            </View>
          </View>

          {/* Personality Tags */}
          {dogData.personality && dogData.personality.length > 0 && (
            <View style={styles.personalityCard}>
              <Text style={styles.personalityTitle}>Personality</Text>
              <View style={styles.personalityTags}>
                {dogData.personality.map((trait, index) => (
                  <View key={index} style={styles.personalityTag}>
                    <Text style={styles.personalityTagText}>{trait}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Health Condition */}
          {dogData.healthCondition && dogData.healthCondition !== 'No specific conditions' && (
            <View style={styles.healthCard}>
              <Text style={styles.healthTitle}>Health Notes</Text>
              <Text style={styles.healthText}>{dogData.healthCondition}</Text>
            </View>
          )}

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={logout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    shadowColor: Colors.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.cardBackground,
    borderWidth: 3,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 50,
  },
  dogName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  dogBreed: {
    fontSize: 16,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  detailsContainer: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 16,
  },
  detailCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 8,
  },
  detailIcon: {
    fontSize: 24,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  personalityCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  personalityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  personalityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  personalityTag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  personalityTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textOnPrimary,
    textTransform: 'capitalize',
  },
  healthCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  healthText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: Colors.error,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});