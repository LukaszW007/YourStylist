import { Sun, Cloud, Menu, Shirt, Sparkles, User } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface HomeScreenProps {
  onShowSuggestion: () => void;
  onBack: () => void;
}

export function HomeScreen({ onShowSuggestion, onBack }: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 pt-3 pb-6">
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-foreground rounded-full"></div>
          <div className="w-1 h-1 bg-foreground rounded-full"></div>
          <div className="w-1 h-1 bg-foreground rounded-full"></div>
          <div className="w-1 h-1 bg-foreground rounded-full"></div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 border border-foreground rounded-sm">
            <div className="w-3 h-1 bg-foreground rounded-sm m-0.5"></div>
          </div>
          <Sun className="w-4 h-4" />
          <div className="w-6 h-3 border border-foreground rounded">
            <div className="w-4 h-1 bg-foreground rounded m-0.5"></div>
          </div>
        </div>
      </div>

      {/* Weather Widget */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
          <Cloud className="w-5 h-5" />
          <span>London, 18°C</span>
        </div>
        
        {/* Brand Header */}
        <h1 className="text-brand text-2xl text-primary mb-8">MERRIWEATHER - DZIŚ</h1>
        
        {/* Main CTA Button */}
        <div className="px-6 mb-8">
          <Button 
            onClick={onShowSuggestion}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
            size="lg"
          >
            Co na siebie włożej?
          </Button>
        </div>
      </div>

      {/* Outfit Card */}
      <div className="px-6 mb-8">
        <Card className="p-6 bg-card border-2 border-primary/20 rounded-lg">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-6 rounded-lg overflow-hidden bg-muted">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1626872640220-e5f4454198b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVucyUyMGJ1c2luZXNzJTIwY2FzdWFsfGVufDF8fHx8MTc1ODgzMDM3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Navy blazer outfit"
                className="w-full h-full object-cover"
              />
            </div>
            
            <h2 className="text-xl font-brand mb-3 text-primary">TWÓJ OUTFIT DNIA</h2>
            
            <p className="text-muted-foreground text-sm leading-relaxed">
              Elegancki minimalizm na spotkanie businessowe. Spodnie w kant, biała koszula, granatiowa marynarka
            </p>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="px-6 mb-8">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" className="py-3 rounded-lg">
            Twoja Szafa
          </Button>
          <Button variant="secondary" className="py-3 rounded-lg">
            Inspiracje
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <Menu className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Strona Główn</span>
            </div>
            <div className="text-center">
              <Shirt className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Szafa</span>
            </div>
            <div className="text-center">
              <User className="w-5 h-5 mx-auto mb-1 text-primary" />
              <span className="text-xs text-primary">Stylista</span>
            </div>
            <div className="text-center" onClick={onBack}>
              <Sparkles className="w-5 h-5 mx-auto mb-1 text-muted-foreground cursor-pointer" />
              <span className="text-xs text-muted-foreground">Profil</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}