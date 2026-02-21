
import { create } from 'zustand';

// Note: Ensure you have 'zustand' installed in your project (e.g., npm install zustand)

// Define interfaces for our weather data to ensure type safety
interface LocationData {
  lat: number;
  lon: number;
  city: string;
}

interface WeatherData {
  temp: number;
  feels_like?: number;
  wind_speed_kph?: number;
  symbolCode: string;
  precipitation: number;
  description: string;
}

// Define the state structure for our store
interface WeatherState {
  location: LocationData | null;
  currentWeather: WeatherData | null;
  forecast: WeatherData | null; // For tomorrow at 12:00 PM
  isLoading: boolean;
  error: string | null;
  actions: {
    setLocation: (location: LocationData) => void;
    setWeatherData: (data: { currentWeather: WeatherData; forecast: WeatherData }) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
  };
}

const initialState = {
  location: null,
  currentWeather: null,
  forecast: null,
  isLoading: true,
  error: null,
};

// Create the Zustand store
export const useWeatherStore = create<WeatherState>((set) => ({
  ...initialState,
  actions: {
    setLocation: (location) => set({ location, isLoading: true, error: null }),
    setWeatherData: (data) => set({ ...data, isLoading: false, error: null }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error, isLoading: false }),
    reset: () => set(initialState),
  }
}));

// Export actions for convenience
export const useWeatherActions = () => useWeatherStore((state) => state.actions);
