
'use client';

import React from 'react';
import { useWeatherStore } from '@/store/useWeatherStore';
import { cn } from '@/lib/utils';
import { AlertTriangle, ArrowRight, Shirt, Wind } from 'lucide-react';
import { WeatherIcon } from './ui/WeatherIcon';

// Mock data for demonstration purposes, as requested.
const originalWeather = {
  temp: 15, // The temperature for which the outfit was originally planned
  symbolCode: 'fair_day',
};

const plannedOutfit = {
  top: { name: 'Lightweight Jacket', icon: <Shirt className="h-8 w-8" /> },
  suggestion: 'Consider swapping your jacket for a simple sweater.',
};

/**
 * A component to show how a change in weather affects a planned outfit.
 * It compares the live weather against a fixed "original" weather forecast.
 */
export function WeatherChangeScreen() {
  const { currentWeather, isLoading, error } = useWeatherStore();

  // Don't render until weather data is available
  if (isLoading || error || !currentWeather) {
    return null;
  }

  const tempDifference = currentWeather.temp - originalWeather.temp;
  const isWarmer = tempDifference > 0;
  const significantChange = Math.abs(tempDifference) > 3; // e.g., a change of more than 3°C

  return (
    <div className="rounded-lg border border-slate-300/60 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
      <h3 className="mb-3 text-lg font-semibold">Outfit Weather Check</h3>
      
      {/* Weather Comparison Section */}
      <div className="flex items-center justify-around rounded-md bg-slate-100 p-3 dark:bg-slate-800">
        <div className="flex flex-col items-center">
          <span className="text-sm text-muted-foreground">Planned</span>
          <div className="flex items-center gap-2">
            <WeatherIcon symbolCode={originalWeather.symbolCode} className="h-6 w-6" />
            <span className="text-xl font-bold">{originalWeather.temp}°C</span>
          </div>
        </div>

        <ArrowRight className="h-6 w-6 text-muted-foreground" />

        <div className="flex flex-col items-center">
          <span className="text-sm text-muted-foreground">Current</span>
           <div className="flex items-center gap-2">
            <WeatherIcon symbolCode={currentWeather.symbolCode} className="h-6 w-6" />
            <span className="text-xl font-bold">{Math.round(currentWeather.temp)}°C</span>
          </div>
        </div>
      </div>

      {/* Suggestion Section */}
      {significantChange && (
        <div
          className={cn(
            'mt-4 flex items-start gap-3 rounded-lg p-3 text-sm',
            isWarmer ? 'bg-amber-100/70 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200' : 'bg-sky-100/70 text-sky-900 dark:bg-sky-900/30 dark:text-sky-200'
          )}
        >
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">
              It's {Math.abs(Math.round(tempDifference))}°C {isWarmer ? 'warmer' : 'colder'} than planned.
            </p>
            <p>{plannedOutfit.suggestion}</p>
          </div>
        </div>
      )}

      {/* Planned Outfit Display */}
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">Planned Top:</p>
        <div className="flex items-center gap-3">
          {plannedOutfit.top.icon}
          <span>{plannedOutfit.top.name}</span>
        </div>
      </div>
    </div>
  );
}
