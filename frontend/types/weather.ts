export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  temp: number;
  humidity: number;
  uvi: number;
  wind_speed: number;
  wind_deg: number;
  weather: WeatherCondition[];
  dt: number;
}

export interface HourlyWeather {
  dt: number;
  temp: number;
  weather: WeatherCondition[];
  pop: number; // probability of precipitation
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyWeather[];
  timezone: string;
  timezone_offset: number;
}

export interface WeatherApiResponse {
  code: number;
  data: WeatherData;
  message: string;
}

export interface WeatherDisplayData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  condition: string;
  icon: string;
  twoHourForecast: {
    time: string;
    temp: number;
    condition: string;
    icon: string;
  }[];
}