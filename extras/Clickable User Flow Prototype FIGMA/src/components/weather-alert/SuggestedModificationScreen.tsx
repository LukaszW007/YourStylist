import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ArrowRight, Thermometer, CheckCircle } from "lucide-react";

interface SuggestedModificationScreenProps {
  onAcceptChanges: () => void;
  onDeclineChanges: () => void;
}

export function SuggestedModificationScreen({ onAcceptChanges, onDeclineChanges }: SuggestedModificationScreenProps) {
  const originalOutfit = [
    { name: "Light Blazer", image: "https://images.unsplash.com/photo-1740710748146-a15d840d6f40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3xlbnwxfHx8fDE3NTg3MDAwMDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Cotton Shirt", image: "https://images.unsplash.com/photo-1628263516427-a82107586790?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGRyZXNzJTIwc2hpcnR8ZW58MXx8fHwxNzU4NTk1MTIxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Dark Jeans", image: "https://images.unsplash.com/photo-1639949141928-66c8112fe6fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwamVhbnMlMjBtZW5zfGVufDF8fHx8MTc1ODcwMDAxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Leather Shoes", image: "https://images.unsplash.com/photo-1559826884-dbcc4a21caed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm93biUyMGNodWtrYSUyMGJvb3RzfGVufDF8fHx8MTc1ODcwMDA0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
  ];

  const suggestedOutfit = [
    { name: "Wool Coat", image: "https://images.unsplash.com/photo-1706001736137-40f564a7702f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29sJTIwY29hdCUyMG1lbnMlMjB3aW50ZXJ8ZW58MXx8fHwxNzU4NzAwMjM2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", isNew: true },
    { name: "Wool Scarf", image: "https://images.unsplash.com/photo-1572371179162-9c0141483610?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29sJTIwc2NhcmYlMjBtZW5zfGVufDF8fHx8MTc1ODcwMDIzOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", isNew: true },
    { name: "Cotton Shirt", image: "https://images.unsplash.com/photo-1628263516427-a82107586790?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGRyZXNzJTIwc2hpcnR8ZW58MXx8fHwxNzU4NTk1MTIxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Dark Jeans", image: "https://images.unsplash.com/photo-1639949141928-66c8112fe6fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwamVhbnMlMjBtZW5zfGVufDF8fHx8MTc1ODcwMDAxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Leather Boots", image: "https://images.unsplash.com/photo-1559826884-dbcc4a21caed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm93biUyMGNodWtrYSUyMGJvb3RzfGVufDF8fHx8MTc1ODcwMDA0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" onClick={onDeclineChanges}>
          ← Back
        </Button>
        <h1 className="text-lg font-medium">Suggested Changes</h1>
        <div className="w-12" />
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="text-center space-y-2">
          <h2 className="text-xl">Weather-Adapted Outfit</h2>
          <p className="text-muted-foreground">
            Keep your style, add the warmth you need
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-3 flex items-center space-x-2">
              <span>Original Outfit</span>
              <Badge variant="destructive" className="text-xs">Too Cold</Badge>
            </h3>
            <Card className="p-3">
              <div className="grid grid-cols-4 gap-2">
                {originalOutfit.map((item, index) => (
                  <div key={index} className="text-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-16 object-cover rounded mb-1 opacity-60"
                    />
                    <p className="text-xs text-muted-foreground">{item.name}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="h-6 w-6 text-primary" />
          </div>

          <div>
            <h3 className="font-medium mb-3 flex items-center space-x-2">
              <span>Suggested Outfit</span>
              <Badge variant="default" className="text-xs bg-green-600">Perfect for -1°C</Badge>
            </h3>
            <Card className="p-3">
              <div className="grid grid-cols-3 gap-2">
                {suggestedOutfit.slice(0, 3).map((item, index) => (
                  <div key={index} className="text-center relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-20 object-cover rounded mb-1"
                    />
                    {item.isNew && (
                      <Badge className="absolute top-1 right-1 text-xs bg-orange-500">
                        SWAP
                      </Badge>
                    )}
                    <p className="text-xs font-medium">{item.name}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {suggestedOutfit.slice(3).map((item, index) => (
                  <div key={index + 3} className="text-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-16 object-cover rounded mb-1"
                    />
                    <p className="text-xs">{item.name}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2 flex items-center space-x-2">
            <Thermometer className="h-4 w-4" />
            <span>What Changed</span>
          </h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Blazer → Wool coat (much warmer, wind-resistant)</li>
            <li>• Added wool scarf (protects neck from cold)</li>
            <li>• Kept your shirt and jeans (same style base)</li>
            <li>• Upgraded to insulated boots (better for snow)</li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onDeclineChanges}
            variant="outline"
          >
            Keep Original
          </Button>
          <Button
            onClick={onAcceptChanges}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Accept Changes</span>
          </Button>
        </div>
      </div>
    </div>
  );
}