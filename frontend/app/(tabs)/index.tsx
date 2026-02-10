import React from 'react';
import { useAuth } from '@/context/auth';
import { ScrollView, View, Text, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme/Colors';
import { WeatherCard } from '@/components/WeatherCard';
import { SimpleWalkCard } from '@/components/walk/SimpleWalkCard';
import { useWeather } from '@/hooks/useWeather';

export default function HomeScreen() {
  const { weatherData, loading, error, refresh } = useWeather();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Get dynamic greeting based on current time
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return 'Good Morning! 🌅';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon! ☀️';
    } else if (hour >= 17 && hour < 21) {
      return 'Good Evening! 🌆';
    } else {
      return 'Good Night! 🌙';
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>{getTimeBasedGreeting()}</Text>
        </View>

        <View style={styles.content}>
          {/* Weather Component */}
          <WeatherCard weatherData={weatherData} loading={loading} error={error} />

          {/* Walk Card Component */}
          <SimpleWalkCard />

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
});