'use client';

import { useGeolocation } from '@/hooks/useGeolocation';
import { useWeatherStore } from '@/store/useWeatherStore';
import { cn } from '@/lib/utils';
import { Loader, AlertCircle } from 'lucide-react';
import { WeatherIcon } from '@/components/ui/WeatherIcon';

type WeatherWidgetProps = {
  lang: string;
  variant?: 'card' | 'inline';
  className?: string;
};

export default function WeatherWidget({ lang, variant = 'card', className }: WeatherWidgetProps) {
  // This custom hook triggers geolocation and weather fetching on mount.
  useGeolocation();

  const { location, currentWeather, isLoading, error } = useWeatherStore();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader className="h-4 w-4 animate-spin" />
          <span>Loading weather...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          <span className="flex-1">{error}</span>
        </div>
      );
    }

    if (location && currentWeather) {
      const { city } = location;
      const { temp, symbolCode } = currentWeather;
      const roundedTemp = Math.round(temp);

      if (variant === 'inline') {
        return (
          <p className={cn('flex items-center justify-center gap-2 text-sm text-muted-foreground', className)}>
            <WeatherIcon symbolCode={symbolCode} className="h-4 w-4" />
            <span className="font-medium text-foreground">{city}</span>
            <span aria-hidden="true">•</span>
            <span>{roundedTemp}°C</span>
            {currentWeather.feels_like !== undefined && (
                <>
                    <span aria-hidden="true" className="opacity-50">|</span>
                    <span className="text-xs" title="Feels like">Feels {Math.round(currentWeather.feels_like)}°</span>
                </>
            )}
          </p>
        );
      }

      return (
        <div className="flex items-center justify-between">
            <div className="flex flex-col">
                 <div className="text-sm opacity-80">{city}</div>
                 <div className="text-2xl font-bold">{roundedTemp}°C</div>
                 {currentWeather.feels_like !== undefined && (
                    <div className="text-xs text-muted-foreground">Feels like: {Math.round(currentWeather.feels_like)}°C</div>
                 )}
            </div>
            <WeatherIcon symbolCode={symbolCode} className="h-10 w-10" />
        </div>
      );
    }

    return null;
  };

  return (
    <section className={cn(
      'rounded-xl border border-slate-300/60 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5',
      variant === 'inline' ? 'border-none bg-transparent p-0' : '',
      className
    )}>
      {renderContent()}
    </section>
  );
}
