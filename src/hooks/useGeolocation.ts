
'use client';

import { useEffect } from 'react';
import { useWeatherStore, useWeatherActions } from '@/store/useWeatherStore';
import { getWeatherForLocation } from '@/app/actions/weather';

/**
 * A custom hook to handle fetching user's geolocation and updating weather state.
 * It runs once on mount.
 */
export function useGeolocation() {
  const { setError, setLocation, setWeatherData, setLoading } = useWeatherActions();

  useEffect(() => {
    // Prevent fetching if location is already set
    if (useWeatherStore.getState().location) {
        setLoading(false);
        return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    const handleSuccess = async (position: GeolocationPosition) => {
      const { latitude: lat, longitude: lon } = position.coords;
      
      const result = await getWeatherForLocation(lat, lon);

      if (result.error) {
        setError(result.error);
      } else if (result.location && result.currentWeather && result.forecast) {
        setLocation(result.location);
        setWeatherData({
            currentWeather: result.currentWeather,
            forecast: result.forecast
        });
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = 'An unknown error occurred.';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Geolocation permission was denied. Please enable it in your browser settings to see local weather.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'The request to get user location timed out.';
          break;
      }
      setError(errorMessage);
    };
    
    // Initial fetch
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: false,
      timeout: 10000,
    });

  }, [setError, setLocation, setWeatherData, setLoading]);
}
