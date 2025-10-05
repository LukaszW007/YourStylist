import { MapPin, Calendar, Briefcase } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { Header } from "../Header";
import { useState } from "react";

interface TripConfigurationScreenProps {
  onContinue: (tripData: any) => void;
  onBack: () => void;
}

const tripTypes = [
  { id: 'business', name: 'Business', icon: Briefcase },
  { id: 'leisure', name: 'Leisure', icon: MapPin },
  { id: 'active', name: 'Active', icon: Calendar }
];

export function TripConfigurationScreen({ onContinue, onBack }: TripConfigurationScreenProps) {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tripType, setTripType] = useState('');

  const canContinue = destination && startDate && endDate && tripType;

  const handleContinue = () => {
    onContinue({
      destination,
      startDate,
      endDate,
      tripType
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Pack My Suitcase" onBack={onBack} />
      
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl">Plan Your Trip</h2>
          <p className="text-muted-foreground text-sm">
            Tell us about your trip and we'll create the perfect packing list
          </p>
        </div>

        {/* Trip Configuration Form */}
        <div className="space-y-6">
          {/* Destination */}
          <div className="space-y-2">
            <Label htmlFor="destination">Destination City</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="destination"
                placeholder="e.g., Paris, London, Tokyo"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Departure Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Return Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Trip Type */}
          <div className="space-y-3">
            <Label>Type of Trip</Label>
            <div className="grid grid-cols-3 gap-3">
              {tripTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <Card
                    key={type.id}
                    className={`p-4 cursor-pointer transition-all ${
                      tripType === type.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setTripType(type.id)}
                  >
                    <div className="text-center space-y-2">
                      <IconComponent className="w-6 h-6 mx-auto text-muted-foreground" />
                      <p className="text-sm">{type.name}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <Button 
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full h-12"
          size="lg"
        >
          Create Packing List
        </Button>
      </div>
    </div>
  );
}