import React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { CloudRain, AlertTriangle, Thermometer, ArrowLeft } from "lucide-react";

interface WeatherChangeScreenProps {
  onWeatherUpdate: (change: any) => void;
  onBack: () => void;
}

export function WeatherChangeScreen({ onWeatherUpdate, onBack }: WeatherChangeScreenProps) {
  const originalWeather = {
    temp: 18,
    condition: "Partly Cloudy",
    icon: "☁️"
  };

  const currentWeather = {
    temp: -1,
    condition: "Light Snow",
    icon: "❄️"
  };

  const plannedOutfit = {
    items: [
      { name: "Light Blazer", image: "https://images.unsplash.com/photo-1740710748146-a15d840d6f40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3xlbnwxfHx8fDE3NTg3MDAwMDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
      { name: "Cotton Shirt", image: "https://images.unsplash.com/photo-1628263516427-a82107586790?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGRyZXNzJTIwc2hpcnR8ZW58MXx8fHwxNzU4NTk1MTIxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
      { name: "Dark Jeans", image: "https://images.unsplash.com/photo-1639949141928-66c8112fe6fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwamVhbnMlMjBtZW5zfGVufDF8fHx8MTc1ODcwMDAxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
      { name: "Leather Shoes", image: "https://images.unsplash.com/photo-1559826884-dbcc4a21caed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm93biUyMGNodWtrYSUyMGJvb3RzfGVufDF8fHx8MTc1ODcwMDA0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
    ]
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center p-4 border-b bg-orange-50">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-3">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-2 text-orange-600">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-medium">Weather Alert</h1>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center space-x-3 mb-3">
            <CloudRain className="h-6 w-6 text-red-600" />
            <div>
              <h2 className="text-lg font-medium text-red-800">Weather Changed!</h2>
              <p className="text-sm text-red-600">Temperature dropped significantly overnight</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-1">{originalWeather.icon}</div>
              <p className="text-sm text-muted-foreground">Yesterday's Forecast</p>
              <p className="font-medium">{originalWeather.temp}°C</p>
              <p className="text-sm">{originalWeather.condition}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">{currentWeather.icon}</div>
              <p className="text-sm text-muted-foreground">Current Weather</p>
              <p className="font-medium text-red-600">{currentWeather.temp}°C</p>
              <p className="text-sm">{currentWeather.condition}</p>
            </div>
          </div>
        </Card>

        <div>
          <h3 className="font-medium mb-3">Your Planned Outfit</h3>
          <Card className="p-4">
            <div className="grid grid-cols-4 gap-3 mb-3">
              {plannedOutfit.items.map((item, index) => (
                <div key={index} className="text-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-16 object-cover rounded mb-1"
                  />
                  <p className="text-xs">{item.name}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-orange-600">Too light for current weather</span>
            </div>
          </Card>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Weather Impact</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Temperature drop of 19°C from forecast</li>
            <li>• Light precipitation expected</li>
            <li>• Wind chill may make it feel even colder</li>
            <li>• Your blazer won't provide enough warmth</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => onWeatherUpdate({ type: 'cold', temperature: -1 })}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            See Weather-Appropriate Suggestion
          </Button>
          <Button
            onClick={onBack}
            variant="outline"
            className="w-full"
          >
            Keep Original Outfit
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Powered by real-time weather data • Updated 6:00 AM
        </div>
      </div>
    </div>
  );
}