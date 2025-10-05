import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ShoppingCart, Heart, Star } from "lucide-react";

interface InstantSuggestionsScreenProps {
  scannedItem: any;
  onPurchase: () => void;
  onBackToMenu: () => void;
}

export function InstantSuggestionsScreen({ scannedItem, onPurchase, onBackToMenu }: InstantSuggestionsScreenProps) {
  const matchingOutfits = [
    {
      id: 1,
      name: "Casual Street Style",
      items: [
        { name: "White T-Shirt", image: "https://images.unsplash.com/photo-1628263516427-a82107586790?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGRyZXNzJTIwc2hpcnR8ZW58MXx8fHwxNzU4NTk1MTIxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
        { name: "Black Jeans", image: "https://images.unsplash.com/photo-1639949141928-66c8112fe6fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwamVhbnMlMjBtZW5zfGVufDF8fHx8MTc1ODcwMDAxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
        { name: "White Sneakers", image: "https://images.unsplash.com/photo-1559826884-dbcc4a21caed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm93biUyMGNodWtrYSUyMGJvb3RzfGVufDF8fHx8MTc1ODcwMDA0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
      ]
    },
    {
      id: 2,
      name: "Smart Casual",
      items: [
        { name: "Navy Sweater", image: "https://images.unsplash.com/photo-1740710748146-a15d840d6f40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3xlbnwxfHx8fDE3NTg3MDAwMDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
        { name: "Grey Chinos", image: "https://images.unsplash.com/photo-1584865288642-42078afe6942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaGlub3MlMjBwYW50cyUyMG1lbnN8ZW58MXx8fHwxNzU4NzAwMDc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
        { name: "Brown Loafers", image: "https://images.unsplash.com/photo-1559826884-dbcc4a21caed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm93biUyMGNodWtrYSUyMGJvb3RzfGVufDF8fHx8MTc1ODcwMDA0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
      ]
    },
    {
      id: 3,
      name: "Weekend Relaxed",
      items: [
        { name: "Henley Shirt", image: "https://images.unsplash.com/photo-1628263516427-a82107586790?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGRyZXNzJTIwc2hpcnR8ZW58MXx8fHwxNzU4NTk1MTIxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
        { name: "Dark Jeans", image: "https://images.unsplash.com/photo-1639949141928-66c8112fe6fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwamVhbnMlMjBtZW5zfGVufDF8fHx8MTc1ODcwMDAxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
        { name: "Canvas Sneakers", image: "https://images.unsplash.com/photo-1559826884-dbcc4a21caed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm93biUyMGNodWtrYSUyMGJvb3RzfGVufDF8fHx8MTc1ODcwMDA0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
      ]
    },
    {
      id: 4,
      name: "Layered Look",
      items: [
        { name: "White Button Down", image: "https://images.unsplash.com/photo-1628263516427-a82107586790?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGRyZXNzJTIwc2hpcnR8ZW58MXx8fHwxNzU4NTk1MTIxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
        { name: "Navy Chinos", image: "https://images.unsplash.com/photo-1584865288642-42078afe6942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaGlub3MlMjBwYW50cyUyMG1lbnN8ZW58MXx8fHwxNzU4NzAwMDc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
        { name: "Leather Boots", image: "https://images.unsplash.com/photo-1559826884-dbcc4a21caed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm93biUyMGNodWtrYSUyMGJvb3RzfGVufDF8fHx8MTc1ODcwMDA0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
      ]
    },
    {
      id: 5,
      name: "Urban Contemporary",
      items: [
        { name: "Black Turtleneck", image: "https://images.unsplash.com/photo-1740710748146-a15d840d6f40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3xlbnwxfHx8fDE3NTg3MDAwMDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
        { name: "Black Jeans", image: "https://images.unsplash.com/photo-1639949141928-66c8112fe6fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwamVhbnMlMjBtZW5zfGVufDF8fHx8MTc1ODcwMDAxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
        { name: "Black Boots", image: "https://images.unsplash.com/photo-1559826884-dbcc4a21caed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm93biUyMGNodWtrYSUyMGJvb3RzfGVufDF8fHx8MTc1ODcwMDA0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
      ]
    }
  ];

  const stats = {
    totalMatches: 8,
    pantsMatches: 5,
    shirtMatches: 8
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" onClick={onBackToMenu}>
          ← Back
        </Button>
        <h1 className="text-lg font-medium">Instant Suggestions</h1>
        <div className="w-12" />
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="text-center space-y-2">
          <h2 className="text-xl">Perfect Match!</h2>
          <p className="text-muted-foreground">
            Your {scannedItem.name} pairs beautifully with your wardrobe
          </p>
        </div>

        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
              <Star className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-green-800">Great Buy!</h3>
              <p className="text-sm text-green-700">
                Matches {stats.pantsMatches} pairs of pants and {stats.shirtMatches} shirts in your wardrobe
              </p>
            </div>
          </div>
        </Card>

        <div>
          <h3 className="font-medium mb-3">5 Ways to Style This Piece</h3>
          <div className="space-y-3">
            {matchingOutfits.map(outfit => (
              <Card key={outfit.id} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{outfit.name}</h4>
                  <Button variant="ghost" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <div className="text-xs text-muted-foreground mb-1">NEW</div>
                    <div className="text-xs font-medium">{scannedItem.name}</div>
                  </div>
                  {outfit.items.map((item, index) => (
                    <div key={index} className="text-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-12 object-cover rounded mb-1"
                      />
                      <div className="text-xs">{item.name}</div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={onBackToMenu}
            className="flex items-center space-x-2"
          >
            <span>Keep Browsing</span>
          </Button>
          <Button
            onClick={onPurchase}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Buy Now</span>
          </Button>
        </div>
      </div>
    </div>
  );
}