
'use server';

import { unstable_noStore as noStore } from 'next/cache';

// ========== TYPE DEFINITIONS ==========

// Details for a single point in time from Met.no
interface MetApiInstantDetails {
  air_temperature: number;
  wind_speed: number; // m/s
  relative_humidity: number; // %
}

// A single entry in the Met.no timeseries
interface MetApiTimeseries {
  time: string;
  data: {
    instant: {
      details: MetApiInstantDetails;
    };
    next_1_hours?: {
      summary: {
        symbol_code: string;
      };
      details: {
        precipitation_amount: number; // mm
      };
    };
  };
}

// The overall structure of the Met.no API response
interface MetApiResponse {
  properties: {
    timeseries: MetApiTimeseries[];
  };
}

// The structured weather data returned by our action
interface ProcessedWeatherData {
    temp: number;
    feels_like: number;
    wind_speed_kph: number;
    isRaining: boolean;
    precipitation: number;
    symbolCode: string;
    description: string;
}

// Nominatim API response structure (for reverse geocoding)
interface NominatimApiResponse {
  address?: { city?: string; town?: string; village?: string; suburb?: string; hamlet?: string; };
  display_name: string;
}

// ========== HELPER FUNCTIONS ==========

/**
 * Calculates the apparent temperature ('feels like') using Wind Chill or Heat Index formulas.
 * @param temp - Air temperature in Celsius.
 * @param windSpeedMps - Wind speed in meters per second.
 * @param humidity - Relative humidity in percent.
 * @returns The calculated apparent temperature in Celsius.
 */
function calculateApparentTemperature(temp: number, windSpeedMps: number, humidity: number): number {
    const windSpeedKmh = windSpeedMps * 3.6;

    // 1. Wind Chill Calculation (if temp <= 10°C and wind > 4.8 km/h)
    if (temp <= 10 && windSpeedKmh > 4.8) {
        const T = temp;
        const V = windSpeedKmh;
        const windChill = 13.12 + 0.6215 * T - 11.37 * Math.pow(V, 0.16) + 0.3965 * T * Math.pow(V, 0.16);
        return Math.round(windChill);
    }

    // 2. Heat Index Calculation (if temp >= 27°C)
    // Using the Steadman formula approximation
    if (temp >= 27) {
        const T = temp;
        const RH = humidity;
        const heatIndex = -8.78469475556 + 1.61139411 * T + 2.33854883889 * RH - 0.14611605 * T * RH - 0.012308094 * (T**2) - 0.0164248277778 * (RH**2) + 0.002211732 * (T**2) * RH + 0.00072546 * T * (RH**2) - 0.000003582 * (T**2) * (RH**2);
        return Math.round(heatIndex);
    }
    
    // 3. Default: return air temperature
    return Math.round(temp);
}

/**
 * Converts Met.no symbol code to human-readable description.
 * Uses smart camelCase/compound word splitting instead of hardcoded mapping.
 * Examples:
 *   - "clearsky_day" → "Clear sky"
 *   - "partlycloudy_night" → "Partly cloudy"
 *   - "heavyrainandthunder_day" → "Heavy rain and thunder"
 * 
 * @param symbolCode - The symbol code from Met.no API
 * @returns Human-readable description
 */
function getWeatherDescription(symbolCode: string): string {
    // Remove _day/_night/_polartwilight suffix
    let cleaned = symbolCode.replace(/_(day|night|polartwilight)$/i, '');
    
    // Split on known weather term boundaries (instead of all underscores)
    // This handles compound words like "clearsky", "partlycloudy", "rainshowers"
    const weatherTerms = [
        'clear', 'partly', 'cloudy', 'fair', 'rain', 'heavy', 'light',
        'showers', 'thunder', 'sleet', 'snow', 'fog', 'and'
    ];
    
    // Insert spaces before known terms (but not at start)
    weatherTerms.forEach(term => {
        const regex = new RegExp(`(?<!^)(${term})`, 'gi');
        cleaned = cleaned.replace(regex, ' $1');
    });
    
    // Replace any remaining underscores with spaces
    cleaned = cleaned.replace(/_/g, ' ');
    
    // Capitalize first letter of each word
    const capitalized = cleaned
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .trim();
    
    return capitalized || 'Unknown';
}

/**
 * Processes a single timeseries entry from the Met.no API into our desired format.
 * @param entry - A timeseries object from the Met.no response.
 * @returns A structured object with processed weather data.
 */
function processTimeseriesEntry(entry: MetApiTimeseries): ProcessedWeatherData {
    const details = entry.data.instant.details;
    const temp = details.air_temperature;
    
    const precipitation = entry.data.next_1_hours?.details.precipitation_amount ?? 0;
    
    const feels_like = calculateApparentTemperature(
        temp,
        details.wind_speed,
        details.relative_humidity
    );

    const symbolCode = entry.data.next_1_hours?.summary.symbol_code || 'unknown';
    const description = getWeatherDescription(symbolCode);
    
    // Log to help debug what's coming from API
    // console.log(`[Weather API] Symbol: "${symbolCode}" → Description: "${description}"`);

    return {
        temp: Math.round(temp),
        feels_like,
        wind_speed_kph: Math.round(details.wind_speed * 3.6), // m/s → km/h
        isRaining: precipitation > 0,
        precipitation,
        symbolCode: symbolCode,
        description: description,
    };
}


async function getCityName(lat: number, lon: number): Promise<string> {
	const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
	try {
		const response = await fetch(url, { headers: { 'User-Agent': 'GentStylo/1.0 (https://github.com/your-repo)' } });
		if (!response.ok) {
			console.error('Nominatim API request failed:', response.statusText);
			return 'Unknown Location';
		}
		const data: NominatimApiResponse = await response.json();
		return data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || data.address?.hamlet || 'Unknown Location';
	} catch (error) {
		console.error('Error fetching city name:', error);
		return 'Unknown Location';
	}
}

// ========== SERVER ACTION ==========

export async function getWeatherForLocation(lat: number, lon: number) {
  noStore();
  const weatherUrl = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;

  try {
    const [weatherResponse, cityName] = await Promise.all([
      fetch(weatherUrl, { headers: { 'User-Agent': 'GentStylo/1.0 (https://github.com/your-repo)' } }),
      getCityName(lat, lon),
    ]);

    if (!weatherResponse.ok) {
      return { error: `Failed to fetch weather data: ${weatherResponse.statusText}` };
    }

    const weatherData: MetApiResponse = await weatherResponse.json();
    const { timeseries } = weatherData.properties;

    if (!timeseries || timeseries.length === 0) {
      return { error: 'No weather timeseries data available.' };
    }

    const currentWeather = processTimeseriesEntry(timeseries[0]);

    // Find the forecast for tomorrow at 12:00 PM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(12, 0, 0, 0);
    const tomorrowNoonISO = tomorrow.toISOString().split(':')[0] + ':00:00Z';
    const noonForecastEntry = timeseries.find(entry => entry.time === tomorrowNoonISO);

    if (!noonForecastEntry) {
      return { error: "Could not find tomorrow's noon forecast." };
    }

    const forecast = processTimeseriesEntry(noonForecastEntry);

    // console.log('Weather data:', {
    //   currentWeather,
    //   forecast,
    // });
    return {
      location: { lat, lon, city: cityName },
      currentWeather,
      forecast,
    };
  } catch (error: unknown) {
    let errorMessage = 'An unexpected error occurred while fetching weather data.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    console.error('Error in getWeatherForLocation server action:', errorMessage);
    return { error: errorMessage };
  }
}

