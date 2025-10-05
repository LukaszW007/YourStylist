import React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ShoppingBag, Heart, Calendar, ArrowLeft } from "lucide-react";

interface YourVersionScreenProps {
  analyzedOutfits: any[];
  onSaveOutfit: (outfit: any) => void;
  onBack: () => void;
  onBackToMenu: () => void;
}

export function YourVersionScreen({ analyzedOutfits, onSaveOutfit, onBack, onBackToMenu }: YourVersionScreenProps) {
  const inspirationImage = "https://images.unsplash.com/photo-1658874761235-8d56cbd5da2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmfHwxNzU4Njk5OTkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

  const userItems = [
    {
      name: "Navy Blazer",
      image: "https://images.unsplash.com/photo-1740710748146-a15d840d6f40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3xlbnwxfHx8fDE3NTg3MDAwMDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      match: 85
    },
    {
      name: "White Oxford Shirt",
      image: "https://images.unsplash.com/photo-1628263516427-a82107586790?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGRyZXNzJTIwc2hpcnR8ZW58MXx8fHwxNzU4NTk1MTIxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      match: 95
    },
    {
      name: "Dark Wash Jeans",
      image: "https://images.unsplash.com/photo-1639949141928-66c8112fe6fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwamVhbnMlMjBtZW5zfGVufDF8fHx8MTc1ODcwMDAxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      match: 90
    }
  ];

  const missingItems = [
    "Beige Trench Coat",
    "Brown Leather Boots"
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" onClick={onBackToMenu}>
          ← Back
        </Button>
        <h1 className="text-lg font-medium">Your Version</h1>
        <div className="w-12" />
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Original Inspiration</h3>
            <Card className="p-2">
              <img
                src={inspirationImage}
                alt="Original outfit"
                className="w-full h-32 object-cover rounded"
              />
            </Card>
          </div>
          <div>
            <h3 className="font-medium mb-2">Your Version</h3>
            <Card className="p-2 bg-muted/50">
              <div className="grid grid-cols-2 gap-1 h-32">
                {userItems.slice(0, 4).map((item, index) => (
                  <img
                    key={index}
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded"
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">Perfect Matches from Your Wardrobe</h3>
          <div className="space-y-3">
            {userItems.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {item.match}% match
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {missingItems.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">Missing Pieces</h3>
            <Card className="p-4 border-dashed border-orange-200 bg-orange-50">
              <div className="space-y-2">
                {missingItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{item}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => console.log('Find Similar clicked')}
                      className="text-xs"
                    >
                      Find Similar
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Outfit Compatibility</h4>
          <p className="text-sm text-green-700">
            Great news! You can recreate 60% of this look with your current wardrobe. 
            The navy blazer and white shirt combination will give you that same sophisticated 
            casual vibe.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => onSaveOutfit({})}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Heart className="h-4 w-4" />
            <span>Save Outfit</span>
          </Button>
          <Button
            onClick={() => console.log('Complete Look clicked')}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Complete Look</span>
          </Button>
        </div>
      </div>
    </div>
  );
}