"use client";

import { useEffect, useState } from "react";
import { useWeatherStore, useWeatherActions } from "@/store/useWeatherStore";
import { getWeatherForLocation } from "@/app/actions/weather";

/**
 * A custom hook to handle fetching user's geolocation and updating weather state.
 * It runs once on mount.
 */

export function useGeolocation() {
	// UWAGA: Mialeś kolizję nazw zmiennych (setLocation było deklarowane 2 razy).
	// Używajmy tylko tego z actions, jeśli actions obsługują store.
	const { setError, setLocation, setWeatherData, setLoading } = useWeatherActions();

	// const { setLocation, setLocationError } = useWeatherStore(); // TO USUŃ, bo masz to wyżej
	const [isLocating, setIsLocating] = useState(true);

	useEffect(() => {
		// 1. Sprawdź czy lokalizacja już jest, żeby nie pobierać w kółko
		if (useWeatherStore.getState().location) {
			setLoading(false);
			setIsLocating(false);
			return;
		}

		// Funkcja pomocnicza do pobierania pogody (użyjemy jej dla GPS i dla Fallbacku)
		const fetchWeather = async (lat: number, lon: number, isFallback = false) => {
			const result = await getWeatherForLocation(lat, lon);

			if (result.error) {
				setError(result.error);
			} else if (result.location && result.currentWeather && result.forecast) {
				// Jeśli to fallback, nadpisz nazwę miasta, żeby użytkownik wiedział
				const finalLocation = isFallback ? { ...result.location, city: "Warszawa (Domyślne)" } : result.location;

				setLocation(finalLocation);
				setWeatherData({
					currentWeather: result.currentWeather,
					forecast: result.forecast,
				});
			}
			setLoading(false);
		};

		if (!navigator.geolocation) {
			// Zamiast błędu -> Fallback
			console.warn("Geolocation not supported - using fallback");
			fetchWeather(52.2297, 21.0122, true);
			return;
		}

		const handleSuccess = async (position: GeolocationPosition) => {
			const { latitude: lat, longitude: lon } = position.coords;
			await fetchWeather(lat, lon);
			setIsLocating(false);
		};

		const handleError = async (error: GeolocationPositionError) => {
			let errorMessage = "An unknown error occurred.";
			// Logujemy błąd do konsoli dla developera, ale nie straszymy usera
			switch (error.code) {
				case error.PERMISSION_DENIED:
					errorMessage = "Geolocation permission denied.";
					break;
				case error.POSITION_UNAVAILABLE:
					errorMessage = "Location information unavailable.";
					break;
				case error.TIMEOUT:
					errorMessage = "Request timed out.";
					break;
			}
			console.warn(`${errorMessage} Loading default location (Warsaw).`);

			// KLUCZOWA ZMIANA: Zamiast setError, ładujemy domyślną pogodę (Warszawa)
			// Dzięki temu widget zawsze coś wyświetli.
			await fetchWeather(52.2297, 21.0122, true);

			setIsLocating(false);
		};

		// Initial fetch
		navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
			enableHighAccuracy: false, // False jest szybsze i wystarczające dla pogody
			timeout: 10000,
		});
	}, [setError, setLocation, setWeatherData, setLoading]);

	return { isLocating };
}
