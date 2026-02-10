import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, Text, View, Image, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { ApiService, DogData } from '@/services/api';
import { Colors } from '@/constants/theme/Colors';
import { euclideanDistanceMeters, formatDistance } from '@/utils/distance';
import { computeDogSize } from '@/utils/size';

// Mock event data
interface WalkEvent {
  id: string;
  title: string;
  location: string;
  scheduledTime: string;
  creatorName: string;
  dogName: string;
  description?: string;
}

const mockEvent: WalkEvent = {
  id: '1',
  title: 'Morning Dog Walk Meetup',
  location: 'Victoria Park Dog Area',
  scheduledTime: '2025-11-22 08:00',
  creatorName: 'PawTrack',
  dogName: '',
  description: 'Let\'s meet for a morning walk!'
};

export default function CommunityScreen() {
  const [dogs, setDogs] = useState<DogData[]>([]);
  const [userDog, setUserDog] = useState<DogData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDogs();
  }, []);

  // Refresh dogs when user returns to this screen
  useFocusEffect(
    useCallback(() => {
      loadDogs();
    }, [])
  );

  const getCurrentLocation = async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
      console.log('Got current location for distance calculation');
    } catch (error) {
      console.error('Failed to get current location:', error);
    }
  };

  const loadDogs = async () => {
    try {
      setLoading(true);

      // Load user's dog profile, community dogs, and current location in parallel
      const [userDogResponse, communityDogsResponse] = await Promise.all([
        ApiService.getDogProfile(),
        ApiService.listCurrentDog(),
        getCurrentLocation()
      ]);

      if (userDogResponse.success && userDogResponse.data) {
        setUserDog(userDogResponse.data);
      }

      if (communityDogsResponse.success) {
        // Filter out user's own dog from the list
        const filteredDogs = userDogResponse.success && userDogResponse.data
          ? communityDogsResponse.data.filter(dog => dog.ID !== userDogResponse.data!.ID)
          : communityDogsResponse.data;

        setDogs(filteredDogs);
      } else {
        setError(communityDogsResponse.message || 'Failed to load dogs');
      }
    } catch (err) {
      setError('Failed to load dogs');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (dog: DogData): string | null => {
    // Use current device location instead of user dog's stored location
    if (!currentLocation || !dog.latitude || !dog.longitude) {
      return null;
    }

    const distanceMeters = euclideanDistanceMeters(
      currentLocation.coords.latitude,
      currentLocation.coords.longitude,
      dog.latitude,
      dog.longitude
    );

    return formatDistance(distanceMeters);
  };

  const renderDogItem = ({ item }: { item: DogData }) => {
    const distance = calculateDistance(item);
    const dogSize = computeDogSize(item.breed, item.weight);

    // Determine badge style and text based on size
    const getBadgeStyle = () => {
      switch (dogSize) {
        case 'big':
          return styles.bigDogBadge;
        case 'medium':
          return styles.mediumDogBadge;
        case 'small':
          return styles.smallDogBadge;
        default:
          return styles.smallDogBadge;
      }
    };

    const getBadgeTextStyle = () => {
      switch (dogSize) {
        case 'big':
          return styles.bigDogText;
        case 'medium':
          return styles.mediumDogText;
        case 'small':
          return styles.smallDogText;
        default:
          return styles.smallDogText;
      }
    };

    const getBadgeLabel = () => {
      switch (dogSize) {
        case 'big':
          return 'BIG DOG';
        case 'medium':
          return 'MEDIUM DOG';
        case 'small':
          return 'SMALL DOG';
        default:
          return 'SMALL DOG';
      }
    };

    return (
      <View style={styles.dogCard}>
        <Image
          source={{ uri: item.img }}
          style={styles.dogImage}
        />
        <View style={styles.dogInfo}>
          <View style={styles.dogNameRow}>
            <Text style={styles.dogName}>{item.name}</Text>
            <View style={getBadgeStyle()}>
              <Text style={getBadgeTextStyle()}>{getBadgeLabel()}</Text>
            </View>
          </View>
          <Text style={styles.dogBreed}>{item.breed.replace(/_/g, ' ')}</Text>
          {item.personality && item.personality.length > 0 && (
            <Text style={styles.dogPersonality}>
              {item.personality.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ')}
            </Text>
          )}
          {item.age && <Text style={styles.dogAge}>{item.age}</Text>}
        </View>
        {distance && (
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>{distance}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderEventCard = () => {
    const eventDate = new Date(mockEvent.scheduledTime);
    const formattedDate = eventDate.toLocaleDateString();
    const formattedTime = eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    return (
      <View style={styles.eventCard}>
        <Text style={styles.eventTitle}>{mockEvent.title}</Text>
        <View style={styles.eventDetails}>
          <Text style={styles.eventInfo}>📅 {formattedDate} at {formattedTime}</Text>
          <Text style={styles.eventInfo}>📍 {mockEvent.location}</Text>
          <Text style={styles.eventInfo}>👤 Organizer: {mockEvent.creatorName}</Text>
          {mockEvent.description && (
            <Text style={styles.eventDescription}>{mockEvent.description}</Text>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading dogs...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Puppies Nearby Section - Limited to half screen */}
      <View style={styles.puppiesSection}>
        <View style={styles.titleBar}>
          <Text style={styles.title}>Dogs Nearby</Text>
        </View>
        {dogs.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>No dogs have been walked in the past 5 hours</Text>
          </View>
        ) : (
          <FlatList
            data={dogs}
            renderItem={renderDogItem}
            keyExtractor={(item) => item.ID?.toString() || item.name}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            style={styles.puppiesList}
          />
        )}
      </View>

      {/* Dog Walk Events Section */}
      <View style={styles.eventsSection}>
        <View style={styles.titleBar}>
          <Text style={styles.title}>Dog Walk Events</Text>
        </View>
        <View style={styles.listContainer}>
          {renderEventCard()}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 50,
  },
  puppiesSection: {
    flex: 0.6, // Takes up 60% of the screen
    minHeight: 250, // Minimum height when empty
  },
  eventsSection: {
    flex: 0.4, // Takes up 40% of the screen
    minHeight: 200,
    paddingTop: 0,
  },
  puppiesList: {
    flex: 1, // Allow scrolling within the allocated space
  },
  titleBar: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  listContainer: {
    padding: 12,
    paddingBottom: 8,
  },
  dogCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  dogImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 12,
    backgroundColor: Colors.cardBackground,
    borderWidth: 2,
    borderColor: '#fff',
  },
  dogInfo: {
    flex: 1,
  },
  dogNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    gap: 6,
  },
  dogName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.text,
  },
  bigDogBadge: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ef5350',
  },
  bigDogText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#e57373',
  },
  mediumDogBadge: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffb74d',
  },
  mediumDogText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#f57c00',
  },
  smallDogBadge: {
    backgroundColor: '#fffde7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fdd835',
  },
  smallDogText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#f9a825',
  },
  dogBreed: {
    fontSize: 13,
    color: Colors.primary,
    marginBottom: 1,
    textTransform: 'capitalize',
  },
  dogPersonality: {
    fontSize: 12,
    color: '#b48a78',
    marginBottom: 0,
    fontStyle: 'italic',
  },
  dogAge: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 0,
    textTransform: 'capitalize',
  },
  dogWeight: {
    fontSize: 12,
    color: Colors.textLight,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error || '#FF6B6B',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  distanceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textAlign: 'center',
    overflow: 'hidden',
  },
  eventCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 6,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  eventDetails: {
    gap: 6,
  },
  eventInfo: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
    lineHeight: 18,
  },
  eventDescription: {
    fontSize: 14,
    color: Colors.text,
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});