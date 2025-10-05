import React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Heart, Info } from "lucide-react";

interface SuggestionsScreenProps {
  selectedItems: any[];
  onOutfitSelect: (outfit: any) => void;
}

export function SuggestionsScreen({ selectedItems, onOutfitSelect }: SuggestionsScreenProps) {
  const outfitSuggestions = [
    {
      id: 1,
      name: "Smart Casual Classic",
      items: [
        ...selectedItems,
        {
          name: "Navy Chinos",
          image: "https://images.unsplash.com/photo-1584865288642-42078afe6942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlub3MlMjBwYW50cyUyMG1lbnN8ZW58MXx8fHwxNzU4NzAwMDc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
          category: "Pants"
        }
      ],
      description: "Perfect for casual Fridays or weekend brunches",
      occasion: "Casual Business"
    },
    {
      id: 2,
      name: "Weekend Relaxed",
      items: [
        ...selectedItems,
        {
          name: "Dark Wash Jeans",
          image: "https://images.unsplash.com/photo-1639949141928-66c8112fe6fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwamVhbnMlMjBtZW5zfGVufDF8fHx8MTc1ODcwMDAxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
          category: "Pants"
        }
      ],
      description: "Comfortable yet put-together for casual outings",
      occasion: "Weekend Casual"
    },
    {
      id: 3,
      name: "Elevated Evening",
      items: [
        ...selectedItems,
        {
          name: "Navy Blazer",
          image: "https://images.unsplash.com/photo-1740710748146-a15d840d6f40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3xlbnwxfHx8fDE3NTg3MDAwMDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
          category: "Jackets"
        },
        {
          name: "Grey Trousers",
          image: "https://images.unsplash.com/photo-1584865288642-42078afe6942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlub3MlMjBwYW50cyUyMG1lbnN8ZW58MXx8fHwxNzU4NzAwMDc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
          category: "Pants"
        }
      ],
      description: "Sophisticated look for dinner dates or networking events",
      occasion: "Semi-Formal"
    },
    {
      id: 4,
      name: "Minimalist Modern",
      items: [
        ...selectedItems,
        {
          name: "Black Jeans",
          image: "https://images.unsplash.com/photo-1639949141928-66c8112fe6fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwamVhbnMlMjBtZW5zfGVufDF8fHx8MTc1ODcwMDAxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
          category: "Pants"
        }
      ],
      description: "Clean, contemporary style with subtle sophistication",
      occasion: "Urban Casual"
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-center p-4 border-b">
        <h1 className="text-lg font-medium">Outfit Suggestions</h1>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="text-center space-y-2">
          <h2 className="text-xl">Complete Your Look</h2>
          <p className="text-muted-foreground">
            Here are 4 ways to complete your outfit with {selectedItems.map(item => item.name).join(" and ")}
          </p>
        </div>

        <div className="space-y-4">
          {outfitSuggestions.map(outfit => (
            <Card key={outfit.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium">{outfit.name}</h3>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {outfit.occasion}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOutfitSelect(outfit)}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3">
                {outfit.items.slice(0, 4).map((item, index) => (
                  <div key={index} className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-16 object-cover rounded"
                    />
                    {selectedItems.some(selected => selected.name === item.name) && (
                      <div className="absolute inset-0 bg-primary/20 rounded flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <Heart className="h-3 w-3 fill-current" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {outfit.description}
              </p>

              <Button
                onClick={() => onOutfitSelect(outfit)}
                variant="outline"
                className="w-full"
              >
                View Details
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}