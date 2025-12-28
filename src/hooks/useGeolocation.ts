"use client";

import { useEffect, useState } from "react";
import { useWeatherStore, useWeatherActions } from "@/store/useWeatherStore";
import { getWeatherForLocation } from "@/app/actions/weather";

export function useGeolocation() {
	// Pobieramy akcje ze store
	const { setError, setLocation, setWeatherData, setLoading } = useWeatherActions();
	const [isLocating, setIsLocating] = useState(true);

	useEffect(() => {
		// 1. Sprawdź obecną lokalizację w Store
		const currentLocation = useWeatherStore.getState().location;

		// FIX: Logika "Smart Check".
		// Przerywamy (return) TYLKO WTEDY, gdy mamy lokalizację I NIE JEST to domyślna Warszawa.
		// Jeśli lokalizacji brak (null) LUB jest to "Warszawa (Default)", kod idzie dalej i próbuje GPS.
		const isDefaultLocation =
			currentLocation?.city?.includes("Warszawa") || currentLocation?.city?.includes("Warsaw") || currentLocation?.city?.includes("Default");

		if (currentLocation && !isDefaultLocation) {
			setLoading(false);
			setIsLocating(false);
			return;
		}

		// Funkcja pomocnicza do pobierania pogody
		const fetchWeather = async (lat: number, lon: number, isFallback = false) => {
			const result = await getWeatherForLocation(lat, lon);

			if (result.error) {
				setError(result.error);
			} else if (result.location && result.currentWeather && result.forecast) {
				// Jeśli to fallback, oznaczamy miasto jako domyślne
				const finalLocation = isFallback ? { ...result.location, city: "Warsaw (Default)" } : result.location;

				setLocation(finalLocation);
				setWeatherData({
					currentWeather: result.currentWeather,
					forecast: result.forecast,
				});
			}
			setLoading(false);
		};

		// 2. Sprawdzenie obsługi GPS w przeglądarce
		if (!navigator.geolocation) {
			console.warn("Geolocation not supported - using fallback");
			fetchWeather(52.2297, 21.0122, true);
			return;
		}

		// 3. Obsługa sukcesu (Użytkownik zezwolił)
		const handleSuccess = async (position: GeolocationPosition) => {
			const { latitude: lat, longitude: lon } = position.coords;
			// Pobieramy pogodę dla PRAWDZIWEJ lokalizacji (isFallback = false)
			await fetchWeather(lat, lon, false);
			setIsLocating(false);
		};

		// 4. Obsługa błędu (Odmowa / Timeout)
		const handleError = async (error: GeolocationPositionError) => {
			let errorMessage = "An unknown error occurred.";
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

			// W razie błędu ładujemy Warszawę jako fallback
			await fetchWeather(52.2297, 21.0122, true);
			setIsLocating(false);
		};

		// 5. Inicjalizacja pobierania
		// Timeout 10s daje czas urządzeniu mobilnemu na złapanie fixa GPS
		navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
			enableHighAccuracy: false,
			timeout: 10000,
			maximumAge: 0,
		});
	}, [setError, setLocation, setWeatherData, setLoading]);

	return { isLocating };
}
