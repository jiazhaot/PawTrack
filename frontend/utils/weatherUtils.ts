import { WeatherApiResponse, WeatherDisplayData } from '../types/weather';

export function formatWeatherData(weatherResponse: WeatherApiResponse): WeatherDisplayData {
  const { current, hourly } = weatherResponse.data;

  // Get next 2 hours of forecast (skip hours that are not in the future)
  const currentHour = new Date().getHours();
  let startIndex = 0;

  // Find the first hour that's actually in the future
  for (let i = 0; i < hourly.length; i++) {
    const hourDate = new Date((hourly[i].dt + weatherResponse.data.timezone_offset) * 1000);
    const hourOfDay = hourDate.getUTCHours();
    if (hourOfDay > currentHour) {
      startIndex = i;
      break;
    }
  }

  const twoHourForecast = hourly.slice(startIndex, startIndex + 2).map(hour => ({
    time: formatTime(hour.dt, weatherResponse.data.timezone_offset),
    temp: Math.round(hour.temp - 273.15), // Convert from Kelvin to Celsius
    condition: hour.weather[0].main,
    icon: hour.weather[0].icon,
  }));

  return {
    temperature: Math.round(current.temp - 273.15), // Convert from Kelvin to Celsius
    humidity: current.humidity,
    windSpeed: current.wind_speed,
    uvIndex: current.uvi,
    condition: current.weather[0].main,
    icon: current.weather[0].icon,
    twoHourForecast,
  };
}

function formatTime(timestamp: number, timezoneOffset: number): string {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function getWeatherIconName(iconCode: string): string {
  const iconMap: { [key: string]: string } = {
    '01d': 'weather-sunny',
    '01n': 'weather-night',
    '02d': 'weather-partly-cloudy',
    '02n': 'weather-night-partly-cloudy',
    '03d': 'weather-cloudy',
    '03n': 'weather-cloudy',
    '04d': 'weather-cloudy',
    '04n': 'weather-cloudy',
    '09d': 'weather-rainy',
    '09n': 'weather-rainy',
    '10d': 'weather-pouring',
    '10n': 'weather-pouring',
    '11d': 'weather-lightning',
    '11n': 'weather-lightning',
    '13d': 'weather-snowy',
    '13n': 'weather-snowy',
    '50d': 'weather-fog',
    '50n': 'weather-fog',
  };

  return iconMap[iconCode] || 'weather-cloudy';
}

export function getUVIndexLevel(uvi: number): { level: string; color: string } {
  if (uvi < 3) {
    return { level: 'Low', color: '#4CAF50' };
  } else if (uvi < 6) {
    return { level: 'Moderate', color: '#FFC107' };
  } else if (uvi < 8) {
    return { level: 'High', color: '#FF9800' };
  } else if (uvi < 11) {
    return { level: 'Very High', color: '#F44336' };
  } else {
    return { level: 'Extreme', color: '#9C27B0' };
  }
}

export function getWindDirection(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

export interface WalkingCondition {
  status: 'perfect' | 'good' | 'caution' | 'poor';
  message: string;
  emoji: string;
  color: string;
  reasons: string[];
}

export function evaluateWalkingConditions(
  temp: number,
  humidity: number,
  windSpeed: number,
  uvIndex: number
): WalkingCondition {
  const issues: string[] = [];
  let status: 'perfect' | 'good' | 'caution' | 'poor' = 'perfect';

  // Temperature evaluation (Celsius) - Critical factors
  if (temp > 30 || temp < 5) {
    issues.push(temp > 30 ? 'Too hot' : 'Too cold');
    status = 'poor';
  } else if (temp > 27 || temp < 10) {
    issues.push(temp > 27 ? 'Quite warm' : 'Bit chilly');
    if (status === 'perfect') status = 'caution';
  }

  // Humidity evaluation - Critical factor
  if (humidity > 80) {
    issues.push('Very humid');
    status = 'poor';
  } else if (humidity > 70) {
    issues.push('Humid');
    if (status === 'perfect') status = 'caution';
  } else if (humidity < 20) {
    issues.push('Very dry');
    if (status === 'perfect') status = 'good';
  }

  // Wind speed evaluation (m/s) - Critical factor
  if (windSpeed > 10) {
    issues.push('Very windy');
    status = 'poor';
  } else if (windSpeed > 7) {
    issues.push('Windy');
    if (status === 'perfect') status = 'caution';
  }

  // UV Index evaluation - Critical factor (matching getUVIndexLevel ranges)
  if (uvIndex >= 11) {
    issues.push('Extreme UV');
    status = 'poor';
  } else if (uvIndex >= 8) {
    issues.push('Very High UV');
    status = 'poor';
  } else if (uvIndex >= 6) {
    issues.push('High UV');
    if (status === 'perfect') status = 'caution';
  } else if (uvIndex >= 3) {
    issues.push('Moderate UV');
    if (status === 'perfect') status = 'good';
  }

  // Return result based on final status
  switch (status) {
    case 'perfect':
      return {
        status: 'perfect',
        message: 'Perfect for walking!',
        emoji: '🌟',
        color: '#4CAF50',
        reasons: []
      };
    case 'good':
      return {
        status: 'good',
        message: 'Good walking weather',
        emoji: '✅',
        color: '#8BC34A',
        reasons: issues
      };
    case 'caution':
      return {
        status: 'caution',
        message: 'Walk with caution',
        emoji: '⚠️',
        color: '#FF9800',
        reasons: issues
      };
    case 'poor':
      return {
        status: 'poor',
        message: 'Not ideal for walking',
        emoji: '❌',
        color: '#F44336',
        reasons: issues
      };
  }
}

export function getWalkingTips(condition: WalkingCondition, temp: number, uvIndex: number): string[] {
  const tips: string[] = [];

  if (temp > 27) {
    tips.push('Bring water for your dog');
    tips.push('Avoid hot pavement');
    tips.push('Walk in shaded areas');
  } else if (temp < 10) {
    tips.push('Consider a dog jacket');
    tips.push('Keep walk shorter');
  }

  if (uvIndex > 6) {
    tips.push('Walk during early morning or evening');
    tips.push('Seek shaded routes');
  }

  if (condition.reasons.includes('Very humid')) {
    tips.push('Take frequent breaks');
    tips.push('Watch for overheating signs');
  }

  if (condition.reasons.includes('Very windy')) {
    tips.push('Keep dog on secure leash');
    tips.push('Avoid open areas');
  }


  return tips;
}