export interface Pollutants {
  pm2_5?: number; // PM2.5 (μg/m³)
  pm10?: number;  // PM10 (μg/m³)
  co?: number;    // Carbon Monoxide (μg/m³)
  no2?: number;   // Nitrogen Dioxide (μg/m³)
  o3?: number;    // Ozone (μg/m³)
}

export interface AQIDataPoint {
  date: string; // YYYY-MM-DD
  aqi: number;
  status: string; // e.g., "Good", "Moderate", "Unhealthy"
  description: string;
  pollutants?: Pollutants;
}

export interface ForecastResponse {
  city: string;
  country: string;
  forecast: AQIDataPoint[];
  sources: Array<{ title: string; uri: string }>;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}