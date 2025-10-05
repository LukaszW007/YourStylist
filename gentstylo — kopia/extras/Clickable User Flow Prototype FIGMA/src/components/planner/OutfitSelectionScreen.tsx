import { Sparkles, Heart } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface OutfitSelectionScreenProps {
  selectedDay: string;
  onOutfitSelect: (outfit: any) => void;
}

const savedOutfits = [
  {
    id: 1,
    name: "Smart Casual Monday",
    image: "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHNoaXJ0JTIwb3V0Zml0fGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isFavorite: true,
    weatherMatch: true
  },
  {
    id: 2,
    name: "Business Professional",
    image: "https://images.unsplash.com/photo-1758518730264-9235a1e5416b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb2IlMjBpbnRlcnZpZXclMjBvdXRmaXR8ZW58MXx8fHwxNzU4Njk4MDQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isFavorite: false,
    weatherMatch: true
  },
  {
    id: 3,
    name: "Weekend Casual",
    image: "https://images.unsplash.com/photo-1650118653814-482455dd4263?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRlJTIwbmlnaHQlMjBvdXRmaXR8ZW58MXx8fHwxNzU4Njk4MDQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isFavorite: true,
    weatherMatch: false
  }
];

const aiSuggestions = [
  {
    id: 4,
    name: "Weather-Perfect Look",
    image: "https://images.unsplash.com/photo-1626872640220-e5f4454198b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3dlYXJ8ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isAiSuggestion: true,
    weatherMatch: true,
    reason: "Perfect for 18°C sunny weather"
  },
  {
    id: 5,
    name: "Seasonal Favorite",
    image: "https://images.unsplash.com/photo-1693901257178-b5fcb8f036a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwc3R5bGUlMjBjbG90aGluZ3xlbnwxfHx8fDE3NTg2OTEyNDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isAiSuggestion: true,
    weatherMatch: true,
    reason: "Based on your style preferences"
  }
];

export function OutfitSelectionScreen({ selectedDay, onOutfitSelect }: OutfitSelectionScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-xl">Select Outfit</h1>
        <p className="text-sm text-muted-foreground mt-1">
          For {selectedDay} • 18°C Sunny
        </p>
      </div>

      <div className="p-6 space-y-8">
        {/* AI Suggestions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg">AI Suggestions</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Outfits that match today's weather and your style
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {aiSuggestions.map((outfit) => (
              <Card 
                key={outfit.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onOutfitSelect(outfit)}
              >
                <div className="aspect-square relative">
                  <ImageWithFallback
                    src={outfit.image}
                    alt={outfit.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-blue-600 text-white text-xs">AI</Badge>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm mb-1">{outfit.name}</h3>
                  <p className="text-xs text-muted-foreground">{outfit.reason}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Saved Outfits */}
        <div className="space-y-4">
          <h2 className="text-lg">Your Saved Outfits</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {savedOutfits.map((outfit) => (
              <Card 
                key={outfit.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onOutfitSelect(outfit)}
              >
                <div className="aspect-square relative">
                  <ImageWithFallback
                    src={outfit.image}
                    alt={outfit.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {outfit.isFavorite && (
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <Heart className="w-3 h-3 text-white fill-current" />
                      </div>
                    )}
                    {outfit.weatherMatch && (
                      <Badge className="bg-green-600 text-white text-xs">Weather Match</Badge>
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm">{outfit.name}</h3>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}