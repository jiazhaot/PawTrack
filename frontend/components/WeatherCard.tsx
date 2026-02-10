import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WeatherDisplayData } from '../types/weather';
import {
  getWeatherIconName,
  getUVIndexLevel,
  evaluateWalkingConditions
} from '../utils/weatherUtils';
import { Colors } from '../constants/theme/Colors';

interface WeatherCardProps {
  weatherData: WeatherDisplayData | null;
  loading: boolean;
  error: string | null;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weatherData, loading, error }) => {
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Unable to load weather</Text>
      </View>
    );
  }

  if (!weatherData) {
    return null;
  }

  const uvInfo = getUVIndexLevel(weatherData.uvIndex);
  const walkingCondition = evaluateWalkingConditions(
    weatherData.temperature,
    weatherData.humidity,
    weatherData.windSpeed,
    weatherData.uvIndex
  );

  return (
    <View style={styles.container}>
      {/* Walking Condition Assessment */}
      <View style={[styles.walkingAssessment, { backgroundColor: walkingCondition.color + '20' }]}>
        <View style={styles.walkingHeader}>
          <Text style={styles.walkingEmoji}>{walkingCondition.emoji}</Text>
          <Text style={[styles.walkingMessage, { color: walkingCondition.color }]}>
            {walkingCondition.message}
          </Text>
        </View>
        {walkingCondition.reasons.length > 0 && (
          <View style={styles.walkingReasons}>
            {walkingCondition.reasons.map((reason, index) => (
              <Text key={index} style={styles.reasonText}>• {reason}</Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.currentWeather}>
        <View style={styles.mainInfo}>
          <MaterialCommunityIcons
            name={getWeatherIconName(weatherData.icon) as any}
            size={48}
            color={Colors.primary}
          />
          <View style={styles.tempContainer}>
            <Text style={styles.temperature}>{weatherData.temperature}°C</Text>
            <Text style={styles.condition}>{weatherData.condition}</Text>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="water-percent" size={20} color={Colors.secondary} />
            <Text style={styles.detailLabel}>Humidity</Text>
            <Text style={styles.detailValue}>{weatherData.humidity}%{'\n'}</Text>
          </View>

          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="weather-windy" size={20} color={Colors.secondary} />
            <Text style={styles.detailLabel}>Wind</Text>
            <Text style={styles.detailValue}>{weatherData.windSpeed.toFixed(1)} m/s{'\n'}</Text>
          </View>

          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="white-balance-sunny" size={20} color={Colors.secondary} />
            <Text style={styles.detailLabel}>UV Index</Text>
            <Text style={[styles.detailValue, { color: uvInfo.color }]}>
              {weatherData.uvIndex.toFixed(1)}{'\n'}({uvInfo.level})
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.forecastContainer}>
        <Text style={styles.forecastTitle}>Next 2 Hours</Text>
        <View style={styles.forecastItems}>
          {weatherData.twoHourForecast.map((item, index) => (
            <View key={index} style={styles.forecastItem}>
              <Text style={styles.forecastTime}>{item.time}</Text>
              <MaterialCommunityIcons
                name={getWeatherIconName(item.icon) as any}
                size={24}
                color={Colors.secondary}
              />
              <Text style={styles.forecastTemp}>{item.temp}°C</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  currentWeather: {
    marginBottom: 16,
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tempContainer: {
    marginLeft: 16,
  },
  temperature: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text,
  },
  condition: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 2,
    textAlign: 'center',
  },
  forecastContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 12,
  },
  forecastTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  forecastItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  forecastItem: {
    alignItems: 'center',
  },
  forecastTime: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  forecastTemp: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 4,
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
  },
  walkingAssessment: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  walkingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  walkingEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  walkingMessage: {
    fontSize: 16,
    fontWeight: '600',
  },
  walkingReasons: {
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginVertical: 2,
  },
});