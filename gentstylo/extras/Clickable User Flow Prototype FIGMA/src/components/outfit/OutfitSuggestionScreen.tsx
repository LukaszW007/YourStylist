import { Sun } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface OutfitSuggestionScreenProps {
  onShowAnother: () => void;
  onLikeIt: () => void;
}

const outfitItems = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHNoaXJ0JTIwb3V0Zml0fGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    name: "White T-shirt"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1756009531697-51da316bfa3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWlnZSUyMGNoaW5vcyUyMHBhbnRzfGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    name: "Navy Blue Chinos"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1578314921455-34dd4626b38d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHNuZWFrZXJzJTIwc2hvZXN8ZW58MXx8fHwxNzU4NTkxNjczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    name: "White Sneakers"
  }
];

export function OutfitSuggestionScreen({ onShowAnother, onLikeIt }: OutfitSuggestionScreenProps) {
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

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-brand text-2xl text-primary mb-2">TWOJA PROPOZYCJA</h1>
        <p className="text-muted-foreground">Na dziś, 25 września</p>
      </div>

      {/* Outfit Display */}
      <div className="px-6 mb-8">
        <Card className="p-8 bg-card border-2 border-primary/20 rounded-lg">
          <div className="text-center">
            <div className="w-48 h-48 mx-auto mb-6 rounded-lg overflow-hidden bg-muted">
              <ImageWithFallback
                src={outfitItems[0].image}
                alt={outfitItems[0].name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <h2 className="text-xl font-brand mb-3 text-primary">SMART CASUAL</h2>
            
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Idealny na spotkanie biznesowe lub wieczór w mieście. Klasyka w nowoczesnym wydaniu.
            </p>

            {/* Outfit Items Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {outfitItems.map((item) => (
                <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="px-6 mb-8">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={onShowAnother}
            variant="secondary"
            className="py-3 rounded-lg"
          >
            Pokaż inne
          </Button>
          
          <Button 
            onClick={onLikeIt}
            className="py-3 rounded-lg bg-primary hover:bg-primary/90"
          >
            Podoba mi się!
          </Button>
        </div>
      </div>
    </div>
  );
}