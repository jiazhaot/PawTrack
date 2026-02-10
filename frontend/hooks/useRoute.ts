import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { RouteApiService, Route, RouteDetail } from "@/services/routeApi";

export function useRoute() {
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoute = useCallback(
    async (dogId: number): Promise<Route | null> => {
      setLoading(true);
      setError(null);

      try {
        const route = await RouteApiService.createRoute(dogId);
        console.log("route:" + JSON.stringify(route));
        setCurrentRoute(route);
        return route;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create route";
        setError(errorMessage);
        Alert.alert("Error", errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateRouteLocation = useCallback(
    async (
      routeId: number,
      longitude: number,
      latitude: number
    ): Promise<boolean> => {
      try {
        await RouteApiService.updateRouteLocation(routeId, longitude, latitude);
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update location";
        console.error("Route location update error:", errorMessage);
        return false;
      }
    },
    []
  );

  const fetchRoutes = useCallback(async (): Promise<void> => {
    // console.log('🔄 useRoute: Starting to fetch routes');
    setLoading(true);
    setError(null);

    try {
      const fetchedRoutes = await RouteApiService.listAllRoutes();
      // console.log('✅ useRoute: Routes fetched successfully:', fetchedRoutes.length, 'routes');
      // console.log('📋 useRoute: Routes data:', fetchedRoutes);
      setRoutes(fetchedRoutes);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch routes";
      console.error("❌ useRoute: Error fetching routes:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
      // console.log('🏁 useRoute: Fetch routes completed');
    }
  }, []);

  const getRouteDetail = useCallback(
    async (routeId: number): Promise<RouteDetail | null> => {
      // Don't set main loading state to avoid interference with route fetching
      setError(null);

      try {
        const routeDetail = await RouteApiService.getRouteDetail(routeId);
        return routeDetail;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch route detail";
        setError(errorMessage);
        console.error("Route detail error:", errorMessage); // Use console.error instead of Alert for less disruption
        return null;
      }
    },
    []
  );

  const clearCurrentRoute = useCallback(() => {
    setCurrentRoute(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    currentRoute,
    routes,
    loading,
    error,
    createRoute,
    updateRouteLocation,
    fetchRoutes,
    getRouteDetail,
    clearCurrentRoute,
    clearError,
  };
}
