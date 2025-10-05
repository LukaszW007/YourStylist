import React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Calendar, Heart, Share } from "lucide-react";

interface FinalSelectionScreenProps {
  selectedOutfit: any;
  onSaveOutfit: () => void;
  onPlanForToday: () => void;
  onBackToMenu: () => void;
}

export function FinalSelectionScreen({ 
  selectedOutfit, 
  onSaveOutfit, 
  onPlanForToday, 
  onBackToMenu 
}: FinalSelectionScreenProps) {
  const styleExplanations = {
    1: "The pink shirt creates a fresh, approachable look while the brown boots add warmth and texture. Navy chinos provide the perfect neutral base that doesn't compete with the shirt's personality.",
    2: "This combination strikes the perfect balance between comfort and style. The pink shirt softens the ruggedness of dark jeans, while brown boots tie everything together with earthy sophistication.",
    3: "The pink shirt under a navy blazer creates an unexpected but harmonious color story. Brown boots ground the look with natural texture, making it perfect for occasions that call for polished confidence.",
    4: "A modern take on classic menswear - the pink shirt adds a contemporary pop against the sleek black jeans, while brown boots prevent the look from becoming too stark or formal."
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" onClick={onBackToMenu}>
          ← Back
        </Button>
        <h1 className="text-lg font-medium">Outfit Details</h1>
        <Button variant="ghost" size="sm">
          <Share className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="text-center space-y-2">
          <h2 className="text-xl">{selectedOutfit.name}</h2>
          <Badge variant="secondary">{selectedOutfit.occasion}</Badge>
        </div>

        <Card className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {selectedOutfit.items.map((item: any, index: number) => (
              <div key={index} className="text-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <h4 className="font-medium text-sm">{item.name}</h4>
                <Badge variant="outline" className="text-xs mt-1">
                  {item.category}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Why This Works</h3>
          <p className="text-sm text-muted-foreground">
            {styleExplanations[selectedOutfit.id as keyof typeof styleExplanations]}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Styling Tips</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>Roll up your sleeves slightly for a more relaxed, confident appearance</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>Keep accessories minimal - a simple watch or wedding band works perfectly</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>Ensure your shirt is properly fitted at the shoulders for the best silhouette</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onSaveOutfit}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Heart className="h-4 w-4" />
            <span>Save Outfit</span>
          </Button>
          <Button
            onClick={onPlanForToday}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Calendar className="h-4 w-4" />
            <span>Wear Today</span>
          </Button>
        </div>

        <div className="text-center">
          <Button
            onClick={onBackToMenu}
            variant="ghost"
            className="text-muted-foreground"
          >
            Back to Menu
          </Button>
        </div>
      </div>
    </div>
  );
}