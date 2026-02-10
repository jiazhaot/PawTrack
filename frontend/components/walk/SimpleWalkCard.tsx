import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import MapView, { Polyline, PROVIDER_DEFAULT } from "react-native-maps";

import { Colors } from "@/constants/theme/Colors";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { useDog } from "@/hooks/useDog";
import { useRoute } from "@/hooks/useRoute";
import { useMapStyle } from "@/hooks/useMapStyle";
import { calculateTotalDistance } from "@/utils/geoUtils";

export function SimpleWalkCard() {
  const router = useRouter();
  const { dogProfile } = useDog();
  const { routes, fetchRoutes, getRouteDetail } = useRoute();
  const { mapStyle } = useMapStyle();
  const [latestRouteDetail, setLatestRouteDetail] = useState<any>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  // Calculate walk stats from route points
  const walkStats = React.useMemo(() => {
    if (!latestRouteDetail?.routePoints || latestRouteDetail.routePoints.length === 0) {
      return null;
    }

    const points = latestRouteDetail.routePoints;

    // Convert API route points to format expected by calculateTotalDistance
    const routePoints = points.map((point: any) => ({
      latitude: point.latitude,
      longitude: point.longitude,
      timestamp: new Date(point.createdTime),
    }));

    // Calculate distance using same function as record.tsx
    const totalDistance = calculateTotalDistance(routePoints);

    // Calculate duration from first to last point
    const startTime = new Date(points[0].createdTime).getTime();
    const endTime = new Date(points[points.length - 1].createdTime).getTime();
    const duration = Math.floor((endTime - startTime) / 1000); // seconds

    return {
      distance: totalDistance,
      duration: duration,
    };
  }, [latestRouteDetail]);

  // Format duration same as record.tsx
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  useEffect(() => {
    // console.log('🏁 SimpleWalkCard mounted, fetching routes...');
    fetchRoutes();
  }, []);

  // Auto-refresh routes every 30 seconds to catch new walks
  // DISABLED for debugging - too noisy
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     console.log('🔄 Auto-refreshing routes...');
  //     fetchRoutes();
  //   }, 30000); // 30 seconds

  //   return () => clearInterval(interval);
  // }, [fetchRoutes]);

  // Refresh routes when user returns to this screen
  useFocusEffect(
    useCallback(() => {
      fetchRoutes();
    }, [fetchRoutes])
  );

  useEffect(() => {
    if (routes.length > 0) {
      loadLatestRouteDetail();
    }
  }, [routes]);

  const loadLatestRouteDetail = async () => {
    if (routes.length === 0) {
      console.log("No routes available yet");
      return;
    }

    try {
      setRouteLoading(true);
      console.log("🚀 Starting to find today's latest route with points");
      console.log("📊 Total routes available:", routes.length);

      // Get today's date range
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      console.log("📅 Today's date range:", todayStart.toISOString(), "to", todayEnd.toISOString());

      // Filter routes to only today's routes
      const todaysRoutes = routes.filter(route => {
        const routeDate = new Date(route.createdTime);
        return routeDate >= todayStart && routeDate < todayEnd;
      });

      console.log("📊 Today's routes:", todaysRoutes.length);

      if (todaysRoutes.length === 0) {
        console.log("😞 No routes found for today");
        setLatestRouteDetail(null);
        return;
      }

      // Try today's routes from newest to oldest to find one with points
      for (let i = todaysRoutes.length - 1; i >= 0; i--) {
        const route = todaysRoutes[i];
        console.log(`🔍 Checking today's route ${route.ID} (${i + 1}/${todaysRoutes.length})`);

        try {
          const routeDetail = await getRouteDetail(route.ID);
          console.log(`📍 Route ${route.ID} has ${routeDetail?.routePoints?.length || 0} points`);

          if (
            routeDetail &&
            routeDetail.routePoints &&
            routeDetail.routePoints.length > 0
          ) {
            console.log(`✅ Found today's route ID ${route.ID} with ${routeDetail.routePoints.length} points`);
            setLatestRouteDetail(routeDetail);
            return; // Exit early when we find a route with points
          }
        } catch (error) {
          console.error(`❌ Error loading route ${route.ID}:`, error);
          continue; // Try next route if this one fails
        }
      }

      // If we get here, no today's routes have points
      console.log("😞 No today's routes with points found");
      setLatestRouteDetail(null);
    } catch (error) {
      console.error("❌ Error in loadLatestRouteDetail:", error);
      setLatestRouteDetail(null);
    } finally {
      setRouteLoading(false);
    }
  };

  const handleStartWalk = () => {
    router.push("/(tabs)/record" as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>
          {dogProfile?.name
            ? `Ready to Walk ${dogProfile.name}?`
            : "Ready to Walk Your Puppy?"}
        </Text>
        <Text style={styles.walkIcon}>🐕‍🦺</Text>
      </View>

      <View style={styles.cardContent}>
        <TouchableOpacity style={styles.startButton} onPress={handleStartWalk}>
          <IconSymbol name="play.fill" size={20} color={Colors.textOnPrimary} />
          <Text style={styles.startButtonText}>Start Walk</Text>
        </TouchableOpacity>
      </View>

      {/* Latest Route Map */}
      <View style={styles.mapContainer}>
        <View style={styles.mapHeader}>
          <Text style={styles.mapTitle}>Latest Walk Today</Text>
          {latestRouteDetail ? (
            <View>
              <Text style={styles.mapSubtitle}>
                {new Date(
                  latestRouteDetail.route.createdTime
                ).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Text>
              {walkStats && (
                <Text style={styles.walkStatsText}>
                  Distance: {(walkStats.distance / 1000).toFixed(2)} km • Time: {formatDuration(walkStats.duration)}
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.mapSubtitle}>
              {routeLoading
                ? "Loading..."
                : routes.length === 0
                ? "No routes found"
                : "No walks today"}
            </Text>
          )}
        </View>

        {latestRouteDetail?.routePoints &&
        latestRouteDetail.routePoints.length > 0 ? (
          <MapView
            provider={PROVIDER_DEFAULT}
            mapType={mapStyle}
            style={styles.map}
            region={{
              latitude: latestRouteDetail.routePoints[0].latitude,
              longitude: latestRouteDetail.routePoints[0].longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            showsCompass={false}
            showsScale={false}
            showsBuildings={false}
            showsTraffic={false}
            showsIndoors={false}
            showsPointsOfInterest={false}
            toolbarEnabled={false}
            userInterfaceStyle="light"
          >
            <Polyline
              coordinates={latestRouteDetail.routePoints.map((point: any) => ({
                latitude: point.latitude,
                longitude: point.longitude,
              }))}
              strokeColor={Colors.primary}
              strokeWidth={3}
              lineCap="round"
              lineJoin="round"
              geodesic={true}
            />
          </MapView>
        ) : (
          <View style={styles.noRouteContainer}>
            <Text style={styles.noRouteIcon}>🐕</Text>
            <Text style={styles.noRouteText}>
              {routeLoading
                ? "Loading your walks..."
                : "Start your walk to see the route here!"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    flex: 1,
  },
  walkIcon: {
    fontSize: 24,
  },
  cardContent: {
    gap: 12,
  },
  walkText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "600",
  },
  walkDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  walkStatus: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  startButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
    marginTop: 8,
  },
  startButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  mapContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginTop: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  mapHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  mapSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  walkStatsText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
    marginTop: 2,
  },
  map: {
    height: 200,
    width: "100%",
  },
  noRouteContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    padding: 20,
  },
  noRouteIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  noRouteText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
