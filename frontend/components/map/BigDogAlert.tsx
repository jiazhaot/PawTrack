import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { euclideanDistanceMeters } from '@/utils/distance';
import { computeDogSize } from '@/utils/size';

import { YStack, XStack, Text, Theme } from 'tamagui';
import { AnimatePresence, MotiView } from 'moti'; 

interface BigDog {
  id: string;
  breed: string;
  weight: number;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  distance: number;
  size: string;
  lastUpdated?: Date; // When the dog's location was last updated
  minutesAgo?: number; // Minutes since last update
}

interface BigDogAlertProps {
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  mapRef: React.RefObject<MapView | null>;
}

export default function BigDogAlert({ currentLocation, mapRef }: BigDogAlertProps) {
  const [useFakeData, setUseFakeData] = useState(false); // Toggle for testing

  const [isOn, setIsOn] = useState(true); // Alert state
  const [bigDogs, setBigDogs] = useState<BigDog[]>([]); // Nearby big dogs
  const timerRef = useRef<number | null>(null); // Timer reference

  const apiBase = 'https://pawtrack.xyz';
  const checkInterval = 30000; // Check every 30 seconds
  const radius = 200; // 200 meters radius
  const maxMinutesOld = 2; // Only show dogs updated within last 2 minutes

  // Clear timer
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Fetch big dog data
  async function fetchDogData() {
    // Clear previous markers before fetching new data
    setBigDogs([]);
    
    try {
      let dogs: any[] = [];

      if (useFakeData) {
        // For testing - simulate dogs at different time points
        const now = new Date();
        const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
        const sixMinutesAgo = new Date(now.getTime() - 6 * 60 * 1000);
        
        dogs = [
          {
            ID: '1',
            breed: 'Rottweiler',
            weight: 45.0,
            latitude: currentLocation.latitude + 0.0005,
            longitude: currentLocation.longitude + 0.0005,
            locationUpdatedTime: now.toISOString(), // Just updated - will show
          },
          {
            ID: '2',
            breed: 'German Shepherd',
            weight: 38.5,
            latitude: currentLocation.latitude + 0.0010,
            longitude: currentLocation.longitude + 0.0010,
            locationUpdatedTime: twoMinutesAgo.toISOString(), // 2 minutes ago - will show
          },
          {
            ID: '3',
            breed: 'Golden Retriever',
            weight: 32.0,
            latitude: currentLocation.latitude - 0.0008,
            longitude: currentLocation.longitude - 0.0008,
            locationUpdatedTime: sixMinutesAgo.toISOString(), // 6 minutes ago - will NOT show (filtered out)
          },
        ];

        } else {
          // const res = await fetch(`${apiBase}/api/auth/login`, {
          //   method: 'POST',
          //   headers: {
          //     'Content-Type': 'application/json',
          //     Accept: 'application/json',
          //   },

          //   body: JSON.stringify({ username: 'hx', password: '12345678' }),
          // });

          // const body = await res.json();
          // const accessToken: string | undefined =
          //   body?.data?.accessToken ?? body?.accessToken;

          // if (!accessToken) {
          //   console.warn('login response missing accessToken');
          //   return;
          // }

          // await AsyncStorage.setItem('token', accessToken);

          const raw =
            (await AsyncStorage.getItem('token')) ??
            (await AsyncStorage.getItem('accessToken'));

          if (!raw) {
            console.warn('No auth token found in storage');
            return;
          }

          const bearerValue = raw.trim().replace(/^"|"$/g, '');

          console.log('Auth =', `Bearer ${bearerValue}`.slice(0, 80));

          const response = await fetch(`${apiBase}/api/dog/listCurrentDog`, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${bearerValue}`,
            },
          });

          if (!response.ok) {
            const errText = await response.text();
            console.warn('Fetch dog data failed:', response.status, errText.slice(0, 200));
            return;
        }
        
          const contentType = response.headers.get('content-type') ?? '';
          const bodyText = await response.text();

          if (!contentType.includes('application/json')) {
            console.warn('Non-JSON response:', bodyText.slice(0, 200));
            return;
          }

          let json: any;
          try {
            json = JSON.parse(bodyText);
          } catch (e) {
            console.warn('JSON parsing failed, original text (first 200 chars):', bodyText.slice(0, 200));
            throw e;
          }

          dogs = Array.isArray(json?.data) ? json.data : [];
        }


      // Filter out invalid coordinates
      const validDogs = dogs.filter(
        (d: any) =>
          typeof d.latitude === 'number' &&
          typeof d.longitude === 'number' &&
          d.latitude >= -90 &&
          d.latitude <= 90 &&
          d.longitude >= -180 &&
          d.longitude <= 180
      );

      // Current time for comparison
      const now = new Date();

      // Compute distance, filter for "big dogs" and recent updates
      const nearbyBigDogs = validDogs
        .map((d: any) => {
          const distance = euclideanDistanceMeters(
            currentLocation.latitude,
            currentLocation.longitude,
            d.latitude,
            d.longitude
          );
          
          // Parse last updated time
          const lastUpdated = d.locationUpdatedTime ? new Date(d.locationUpdatedTime) : null;
          const minutesAgo = lastUpdated 
            ? Math.floor((now.getTime() - lastUpdated.getTime()) / 1000 / 60)
            : 999; // If no timestamp, treat as very old

          return {
            id: String(d.ID),
            breed: d.breed,
            weight: d.weight,
            coordinate: { latitude: d.latitude, longitude: d.longitude },
            distance: distance,
            size: computeDogSize(d.breed, d.weight),
            lastUpdated: lastUpdated || undefined,
            minutesAgo: minutesAgo,
          };
        })
        .filter((d: BigDog) => 
          d.size === 'big' && 
          d.distance <= radius &&
          (d.minutesAgo ?? 999) <= maxMinutesOld // Only show recent dogs
        );

      setBigDogs(nearbyBigDogs);
      console.log('Dog Found:', nearbyBigDogs.length, 'big dogs nearby (updated in last', maxMinutesOld, 'minutes)');
    } catch (err) {
      console.log('Fetch dog data failed:', err);
      setBigDogs([]);
    }
  }

  // Click button to toggle switch
  const toggleAlert = async () => {
    if (isOn) {
      setIsOn(false);
      clearTimer();
      setBigDogs([]);
    } else {
      setIsOn(true);
      await fetchDogData(); // Fetch once immediately
      timerRef.current = setInterval(fetchDogData, checkInterval);
    }
  };

  // Initialize: fetch data if isOn is true, clear when isOn is false
  useEffect(() => {
    if (isOn) {
      fetchDogData();
      timerRef.current = setInterval(fetchDogData, checkInterval);
    } else {
      clearTimer();
      setBigDogs([]); // Clear markers when turned off
    }
    return () => clearTimer();
  }, [isOn]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {/* Button to toggle alert */}
        <TouchableOpacity
          style={[styles.button, isOn && styles.buttonOn]}
          onPress={toggleAlert}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.buttonText}>{isOn ? '🔍' : '🐕'}</Text>
            {isOn && bigDogs.length > 0 && <View style={styles.activeIndicator} />}
          </View>
        </TouchableOpacity>

        {/* Show markers */}
        {isOn &&
        bigDogs.map((dog) => (
          <Marker
            key={dog.id}
            coordinate={dog.coordinate}
          >
            <View
              style={{
                backgroundColor: '#ffd451',
                borderRadius: 20,
                padding: 6,
                borderWidth: 2,
                borderColor: '#fff',
                shadowColor: '#000',
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 6,
              }}
            >
              <Text style={{ fontSize: 16 }}>🐕</Text>
            </View>
            <Callout tooltip>
              <Theme name="light">
                <MotiView
                  from={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'timing', duration: 150 }}
                >
                  <YStack
                    backgroundColor="#fff"
                    borderRadius={20}
                    padding={10}
                    shadowColor="rgba(0,0,0,0.25)"
                    shadowOffset={{ width: 0, height: 2 }}
                    shadowOpacity={0.1}
                    shadowRadius={20}
                    elevation={5}
                    alignItems="center"
                    minWidth={150}
                  >
                    <Text
                      style={{
                        fontWeight: '600',
                        fontSize: 16,
                        color: '#5a4a49',
                        textAlign: 'center',
                      }}
                    >
                      {dog.breed || 'Big Dog'}
                    </Text>

                    <Text
                        style={{
                        fontWeight: '500',
                        fontSize: 12,
                        color: '#8b8179',
                        marginTop: 4,
                        textAlign: 'center',
                      }}
                    >
                      🐾 Around {Math.round(dog.distance)} meters away!
                    </Text>

                    {dog.minutesAgo !== undefined && (
                      <Text
                        style={{
                          fontWeight: '500',
                          fontSize: 12,
                          color: dog.minutesAgo <= 2 ? '#4CAF50' : '#ff9800',
                          marginTop: 2,
                          textAlign: 'center',
                        }}
                      >
                        ⏱️ {dog.minutesAgo === 0 ? 'Just now' : `${dog.minutesAgo} min ago`}
                      </Text>
                    )}
                  </YStack>
                </MotiView>
              </Theme>
            </Callout>
          </Marker>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 620,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 3,
    borderColor: '#f0f0f0',
  },
  buttonOn: {
    backgroundColor: '#ffd451',
    borderColor: '#ffbf00',
    shadowColor: '#ffd451',
    shadowOpacity: 0.5,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 28,
    fontFamily: 'Inter',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff9800',
    borderWidth: 2,
    borderColor: '#fff',
  },
  descriptionText: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#444',
  },
});
