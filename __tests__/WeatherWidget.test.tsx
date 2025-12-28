import { render, screen } from "@testing-library/react";
import WeatherWidget from "@/components/WeatherWidget";
import { useWeatherStore } from "@/store/useWeatherStore";
import { vi } from "vitest";

// Mock the useGeolocation hook as it's not needed for these tests
vi.mock("@/hooks/useGeolocation", () => ({
	useGeolocation: () => {},
}));

describe("WeatherWidget", () => {
	it("should render loading state", () => {
		// @ts-ignore
		useWeatherStore.setState({
			isLoading: true,
			error: null,
			location: null,
			currentWeather: null,
		});

		render(<WeatherWidget lang="en" />);
		expect(screen.getByText("Loading weather...")).toBeInTheDocument();
	});

	it("should render error state", () => {
		// @ts-ignore
		useWeatherStore.setState({
			isLoading: false,
			error: "Test error",
			location: null,
			currentWeather: null,
		});

		render(<WeatherWidget lang="en" />);
		expect(screen.getByText("Test error")).toBeInTheDocument();
	});

	it("should render weather information", () => {
		// @ts-ignore
		useWeatherStore.setState({
			isLoading: false,
			error: null,
			location: { city: "Test City", lat: 0, lon: 0 },
			currentWeather: {
				temp: 25,
				symbolCode: "clearsky_day",
			},
		});

		render(<WeatherWidget lang="en" />);
		expect(screen.getByText("Test City")).toBeInTheDocument();
		expect(screen.getByText("25°C")).toBeInTheDocument();
	});

	it('should render weather information inline', () => {
		// @ts-ignore
		useWeatherStore.setState({
			isLoading: false,
			error: null,
			location: { city: 'Test City', lat: 0, lon: 0 },
			currentWeather: {
				temp: 25,
				symbolCode: 'clearsky_day',
			},
		});

		render(<WeatherWidget lang="en" variant="inline" />);
		expect(screen.getByText('Test City')).toBeInTheDocument();
		expect(screen.getByText('25°C')).toBeInTheDocument();
		expect(screen.getByText('EN')).toBeInTheDocument();
	});
});
