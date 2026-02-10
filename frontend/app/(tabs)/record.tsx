import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";

import { Colors } from "@/constants/theme/Colors";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { useRoute } from "@/hooks/useRoute";
import { useDog } from "@/hooks/useDog";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { useMapStyle } from "@/hooks/useMapStyle";
import { RoutePoint } from "@/utils/geoUtils";

const { width, height } = Dimensions.get("window");

export default function RecordScreen() {
  const mapRef = useRef<MapView>(null);
  const { currentRoute, createRoute, updateRouteLocation } = useRoute();
  const { dogProfile } = useDog();

  // Use ref to store current route ID for immediate access
  const currentRouteId = useRef<number | null>(null);

  // Update ref when currentRoute changes
  useEffect(() => {
    currentRouteId.current = currentRoute?.ID || null;
  }, [currentRoute]);

  // Handle when a new route point is added
  const handleRoutePointAdded = React.useCallback(
    (point: RoutePoint) => {
      const routeId = currentRouteId.current;
      console.log(`🔥 POINT ADDED - Route: ${routeId || "NULL"}`);

      // Update route location via API if we have a current route
      if (routeId) {
        updateRouteLocation(routeId, point.longitude, point.latitude).then(
          (success) => {
            console.log(`💾 API RESULT: ${success ? "SUCCESS" : "FAILED"}`);
          }
        );
      } else {
        console.log("❌ NO ROUTE - Point not saved to API");
      }
    },
    [updateRouteLocation]
  );

  // Use the new location tracking hook
  const {
    isTracking,
    currentLocation,
    routePoints,
    totalDistance,
    startTracking,
    stopTracking,
    clearRoute,
  } = useLocationTracking({
    onLocationUpdate: handleLocationUpdate,
    onRoutePointAdded: handleRoutePointAdded,
  });
  
  // Local state for initial location (before tracking starts)
  const [initialLocation, setInitialLocation] =
    useState<Location.LocationObject | null>(null);

  const [recordStartTime, setRecordStartTime] = useState<Date | null>(null);
  const [recordDuration, setRecordDuration] = useState(0);

  // Use currentLocation from tracking, or initialLocation if not tracking yet
  const displayLocation = currentLocation || initialLocation;

  // Use simplified map style (always standard)
  const { mapStyle } = useMapStyle();

  // Handle location updates from the tracking hook
  function handleLocationUpdate(
    location: Location.LocationObject,
    shouldSave: boolean
  ) {
    // Update map region if tracking
    if (isTracking && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  }

  useEffect(() => {
    initializeLocation();
  }, []);

  useEffect(() => {
    console.log("Current Route Updated:", currentRoute);
  }, [currentRoute]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isTracking && recordStartTime) {
      interval = setInterval(() => {
        setRecordDuration(
          Math.floor((Date.now() - recordStartTime.getTime()) / 1000)
        );
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTracking, recordStartTime]);

  const initializeLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Location permission is required for recording"
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setInitialLocation(location);

      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000
        );
      }
    } catch (error) {
      console.error("Failed to initialize location:", error);
    }
  };

  const startRecording = async () => {
    if (!dogProfile?.ID) {
      Alert.alert(
        "Error",
        "Dog profile not found. Please set up your dog profile first."
      );
      return;
    }

    // Clear previous route data first
    clearRoute();
    setRecordDuration(0);
    setRecordStartTime(new Date());

    // Create route
    const route = await createRoute(dogProfile.ID);
    if (!route) {
      Alert.alert("Error", "Failed to create route. Please try again.");
      return;
    }
    console.log(`🚀 RECORDING STARTED - Route ID: ${route.ID}`);

    // Start location tracking
    const success = await startTracking();
    if (success) {
      console.log("🚀 Recording started successfully");
    } else {
      Alert.alert("Error", "Failed to start location tracking");
    }
  };

  const stopRecording = () => {
    stopTracking();
    setRecordStartTime(null);

    Alert.alert(
      "Recording Completed!",
      `Duration: ${formatDuration(recordDuration)}\nDistance: ${(
        totalDistance / 1000
      ).toFixed(2)} km`,
      [{ text: "OK" }]
    );
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  if (!displayLocation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          mapType={mapStyle}
          style={styles.map}
          initialRegion={{
            latitude: displayLocation.coords.latitude,
            longitude: displayLocation.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          followsUserLocation={isTracking}
          userInterfaceStyle="light"
          showsCompass={false}
          toolbarEnabled={false}
        >
          {routePoints.length > 1 && (
            <Polyline
              coordinates={routePoints.map((point) => ({
                latitude: point.latitude,
                longitude: point.longitude,
              }))}
              strokeColor={Colors.primary}
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
              geodesic={true}
            />
          )}

          {routePoints.length > 0 && (
            <Marker
              coordinate={{
                latitude: routePoints[0].latitude,
                longitude: routePoints[0].longitude,
              }}
              title="Start"
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.startMarker}>
                <Text style={styles.startText}>🚩</Text>
              </View>
            </Marker>
          )}

  
        </MapView>

        {isTracking && (
          <View style={styles.statsOverlay}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatDuration(recordDuration)}
                </Text>
                <Text style={styles.statLabel}>TIME</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {(totalDistance / 1000).toFixed(2)}
                </Text>
                <Text style={styles.statLabel}>KM</Text>
              </View>
            </View>
          </View>
        )}

        {/* Controls Overlay */}
        <View style={styles.controlsOverlay}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              isTracking && styles.recordButtonActive,
            ]}
            onPress={isTracking ? stopRecording : startRecording}
          >
            <View
              style={[
                styles.recordButtonInner,
                isTracking && styles.recordButtonInnerActive,
              ]}
            >
              {isTracking ? (
                <IconSymbol name="stop.fill" size={32} color={Colors.error} />
              ) : (
                <IconSymbol
                  name="play.fill"
                  size={32}
                  color={Colors.textOnPrimary}
                />
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.recordButtonLabel}>
            {isTracking ? "Stop Recording" : "Start Recording"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
  startMarker: {
    backgroundColor: Colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  startText: {
    fontSize: 16,
  },
  statsOverlay: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 16,
    padding: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFE55C",
  },
  statLabel: {
    fontSize: 12,
    color: "#FFE55C",
    marginTop: 4,
  },
  controlsOverlay: {
    position: "absolute",
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonActive: {
    backgroundColor: Colors.surface,
    borderWidth: 4,
    borderColor: Colors.error,
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  recordButtonInnerActive: {
    backgroundColor: Colors.surface,
  },
  recordButtonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFE55C",
    marginTop: 12,
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
});
