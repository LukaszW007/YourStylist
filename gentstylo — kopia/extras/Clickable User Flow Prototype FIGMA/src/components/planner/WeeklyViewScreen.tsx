import { Plus, Sun, Cloud, CloudRain } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Header } from "../Header";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface WeeklyViewScreenProps {
  onAddOutfit: (day: string) => void;
  onBack: () => void;
}

const weekData = [
  {
    date: 'Mon, Sep 24',
    weather: { temp: '18°C', icon: Sun, desc: 'Sunny' },
    outfit: null
  },
  {
    date: 'Tue, Sep 25',
    weather: { temp: '16°C', icon: Cloud, desc: 'Cloudy' },
    outfit: {
      image: 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHNoaXJ0JTIwb3V0Zml0fGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      name: 'Smart Casual'
    }
  },
  {
    date: 'Wed, Sep 26',
    weather: { temp: '14°C', icon: CloudRain, desc: 'Rainy' },
    outfit: null
  },
  {
    date: 'Thu, Sep 27',
    weather: { temp: '19°C', icon: Sun, desc: 'Sunny' },
    outfit: null
  },
  {
    date: 'Fri, Sep 28',
    weather: { temp: '17°C', icon: Cloud, desc: 'Cloudy' },
    outfit: {
      image: 'https://images.unsplash.com/photo-1758518730264-9235a1e5416b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb2IlMjBpbnRlcnZpZXclMjBvdXRmaXR8ZW58MXx8fHwxNzU4Njk4MDQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      name: 'Business Formal'
    }
  },
  {
    date: 'Sat, Sep 29',
    weather: { temp: '21°C', icon: Sun, desc: 'Sunny' },
    outfit: null
  },
  {
    date: 'Sun, Sep 30',
    weather: { temp: '20°C', icon: Sun, desc: 'Sunny' },
    outfit: null
  }
];

export function WeeklyViewScreen({ onAddOutfit, onBack }: WeeklyViewScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header title="Weekly Outfit Planner" onBack={onBack} />
      
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl mb-2">This Week</h2>
          <p className="text-muted-foreground text-sm">
            Plan your outfits in advance and never worry about what to wear
          </p>
        </div>

        {/* Weekly Calendar */}
        <div className="space-y-3">
          {weekData.map((day, index) => {
            const WeatherIcon = day.weather.icon;
            return (
              <Card key={index} className="p-4">
                <div className="flex items-center gap-4">
                  {/* Date and Weather */}
                  <div className="flex-1">
                    <h3 className="text-sm mb-1">{day.date}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <WeatherIcon className="w-4 h-4" />
                      <span>{day.weather.temp}</span>
                      <span>{day.weather.desc}</span>
                    </div>
                  </div>

                  {/* Outfit */}
                  <div className="flex items-center gap-3">
                    {day.outfit ? (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                          <ImageWithFallback
                            src={day.outfit.image}
                            alt={day.outfit.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{day.outfit.name}</span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => onAddOutfit(day.date)}
                        variant="outline"
                        size="sm"
                        className="w-12 h-12 rounded-lg p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Weekly Stats */}
        <Card className="mt-6 p-4 bg-blue-50">
          <div className="text-center">
            <h3 className="text-sm mb-1">Week Progress</h3>
            <p className="text-xs text-muted-foreground">
              2 of 7 days planned • You'll get daily notifications for planned outfits
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}