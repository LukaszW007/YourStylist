import React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Star, Sparkles, Crown } from "lucide-react";

interface SpecialButtonScreenProps {
  onGetStyleGuide: () => void;
  onBack: () => void;
}

export function SpecialButtonScreen({ onGetStyleGuide, onBack }: SpecialButtonScreenProps) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <h1 className="text-lg font-medium">Make an Impression</h1>
        <div className="w-12" />
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div className="text-center space-y-2">
          <Crown className="h-16 w-16 mx-auto text-primary" />
          <h2 className="text-xl">Feel Special Today</h2>
          <p className="text-muted-foreground">
            Let's create a standout look that reflects your confidence
          </p>
        </div>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="text-center space-y-4">
            <Sparkles className="h-12 w-12 mx-auto text-purple-600" />
            <h3 className="text-lg font-medium">Showstopper Mode</h3>
            <p className="text-sm text-muted-foreground">
              We'll suggest bold, stylish combinations that make you stand out
            </p>
            <Button
              onClick={onGetStyleGuide}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Star className="mr-2 h-4 w-4" />
              Surprise Me
            </Button>
          </div>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          Perfect for when you want to feel extraordinary
        </div>
      </div>
    </div>
  );
}