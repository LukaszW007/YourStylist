
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  Cloudy,
  Moon,
  Sun,
  Thermometer,
  Umbrella,
} from 'lucide-react';
import React from 'react';

interface WeatherIconProps extends React.HTMLAttributes<SVGElement> {
  symbolCode: string;
}

/**
 * Maps a MET.no weather symbol code to a Lucide icon.
 * @param {string} symbolCode - The weather symbol code (e.g., 'clearsky_day', 'rain').
 * @returns A React component for the corresponding icon, or a default.
 */
export const WeatherIcon: React.FC<WeatherIconProps> = ({ symbolCode, ...props }) => {
  switch (symbolCode) {
    case 'clearsky_day':
      return <Sun {...props} />;
    case 'clearsky_night':
      return <Moon {...props} />;
    case 'fair_day':
      return <CloudSun {...props} />;
    case 'fair_night':
      return <CloudSun {...props} />; // No specific fair_night icon in lucide
    case 'partlycloudy_day':
      return <Cloudy {...props} />;
    case 'partlycloudy_night':
      return <Cloudy {...props} />;
    case 'cloudy':
      return <Cloud {...props} />;
    case 'rainshowers_day':
    case 'rainshowers_night':
    case 'lightrain':
      return <CloudDrizzle {...props} />;
    case 'rain':
      return <CloudRain {...props} />;
    case 'heavyrain':
      return <CloudRainWind {...props} />;
    case 'sleet':
    case 'lightsleet':
    case 'heavysleet':
      return <CloudHail {...props} />;
    case 'snow':
    case 'lightsnow':
      return <CloudSnow {...props} />;
    case 'heavysnow':
      return <CloudSnow {...props} />;
    case 'fog':
      return <CloudFog {...props} />;
    case 'thundershower_day':
    case 'thundershower_night':
      return <CloudLightning {...props} />;
    default:
      return <Thermometer {...props} />;
  }
};
