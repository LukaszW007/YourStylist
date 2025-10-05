import { Thermometer, Sun, Cloud, CloudRain } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

interface CapsuleSuggestionScreenProps {
  tripData: any;
  onViewPackingList: () => void;
}

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain
};

const packingRecommendations = {
  business: {
    description: "Professional wardrobe for business meetings and corporate events",
    items: [
      { category: "Suits", count: 2, description: "One navy, one charcoal" },
      { category: "Dress Shirts", count: 4, description: "Mix of white and light blue" },
      { category: "Ties", count: 3, description: "Conservative patterns" },
      { category: "Dress Shoes", count: 2, description: "Black and brown leather" },
      { category: "Casual Outfit", count: 1, description: "For downtime" }
    ]
  },
  leisure: {
    description: "Comfortable and versatile pieces for sightseeing and relaxation",
    items: [
      { category: "Casual Pants", count: 3, description: "Chinos and comfortable jeans" },
      { category: "T-shirts", count: 5, description: "Mix of colors and styles" },
      { category: "Casual Shirts", count: 2, description: "Button-downs for nicer dinners" },
      { category: "Comfortable Shoes", count: 2, description: "Walking shoes and casual sneakers" },
      { category: "Light Jacket", count: 1, description: "For cooler evenings" }
    ]
  },
  active: {
    description: "Performance gear and versatile pieces for outdoor activities",
    items: [
      { category: "Athletic Wear", count: 4, description: "Moisture-wicking shirts and shorts" },
      { category: "Hiking Pants", count: 2, description: "Quick-dry material" },
      { category: "Athletic Shoes", count: 2, description: "Trail shoes and cross-trainers" },
      { category: "Base Layers", count: 3, description: "For temperature regulation" },
      { category: "Weather Protection", count: 1, description: "Waterproof jacket" }
    ]
  }
};

export function CapsuleSuggestionScreen({ tripData, onViewPackingList }: CapsuleSuggestionScreenProps) {
  const recommendations = packingRecommendations[tripData.tripType as keyof typeof packingRecommendations];
  
  // Mock weather data
  const weatherForecast = [
    { day: "Mon", temp: "22°C", condition: "sunny" },
    { day: "Tue", temp: "18°C", condition: "cloudy" },
    { day: "Wed", temp: "15°C", condition: "rainy" },
    { day: "Thu", temp: "20°C", condition: "sunny" },
    { day: "Fri", temp: "19°C", condition: "cloudy" }
  ];

  const totalItems = recommendations.items.reduce((sum, item) => sum + item.count, 0);
  const avgTemp = "19°C";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-xl">Packing Suggestions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {tripData.destination} • {tripData.startDate} to {tripData.endDate}
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Weather Forecast */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Thermometer className="w-5 h-5 text-blue-600" />
            <h3 className="text-base">Weather Forecast</h3>
          </div>
          <div className="flex justify-between text-center">
            {weatherForecast.slice(0, 5).map((day, index) => {
              const WeatherIcon = weatherIcons[day.condition as keyof typeof weatherIcons];
              return (
                <div key={index} className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">{day.day}</p>
                  <WeatherIcon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs">{day.temp}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t text-center">
            <p className="text-sm text-muted-foreground">
              Average temperature: {avgTemp} • Pack layers for variable weather
            </p>
          </div>
        </Card>

        {/* Capsule Wardrobe Suggestion */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg mb-2">Your Travel Capsule</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {recommendations.description}
            </p>
            <Badge variant="outline" className="mb-4">
              {totalItems} items total • Maximum outfit combinations
            </Badge>
          </div>

          {/* Packing Categories */}
          <div className="space-y-3">
            {recommendations.items.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm mb-1">{item.category}</h4>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm text-primary">{item.count}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* View Packing List Button */}
        <Button 
          onClick={onViewPackingList}
          className="w-full h-12"
          size="lg"
        >
          View Interactive Packing List
        </Button>
      </div>
    </div>
  );
}