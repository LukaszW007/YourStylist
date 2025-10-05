import { ShoppingBag, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface OutfitSuggestionsScreenProps {
  context: any;
  onBackToMenu: () => void;
  onGoShopping: () => void;
}

const outfitSuggestions = {
  wedding: [
    {
      id: 1,
      title: "Classic Guest Look",
      description: "This outfit is elegant but safe. Remember not to outshine the groom. You can skip the tie if the wedding is more casual.",
      fromWardrobe: true,
      items: [
        { name: "Navy Suit", image: "https://images.unsplash.com/photo-1739526169655-0378b9aae5ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwZm9ybWFsJTIwZHJlc3N8ZW58MXx8fHwxNzU4Njk4MDQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
        { name: "White Dress Shirt", image: "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHNoaXJ0JTIwb3V0Zml0fGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
        { name: "Leather Dress Shoes", image: "https://images.unsplash.com/photo-1576792741377-eb0f4f6d1a47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwZHJlc3MlMjBzaG9lc3xlbnwxfHx8fDE3NTg2MzYwOTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
      ]
    },
    {
      id: 2,
      title: "Elevated Look",
      description: "Step up your wedding guest game with this refined ensemble. Perfect for important occasions.",
      fromWardrobe: false,
      newItem: "Silk Pocket Square",
      items: [
        { name: "Navy Suit", image: "https://images.unsplash.com/photo-1739526169655-0378b9aae5ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwZm9ybWFsJTIwZHJlc3N8ZW58MXx8fHwxNzU4Njk4MDQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
        { name: "Silk Pocket Square", image: "https://images.unsplash.com/photo-1742631193849-acc045ea5890?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwZWxlZ2FudCUyMGZhc2hpb258ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", isNew: true }
      ]
    }
  ],
  interview: [
    {
      id: 1,
      title: "Professional Power Look",
      description: "Conveys confidence and professionalism. The clean lines and neutral colors keep the focus on you.",
      fromWardrobe: true,
      items: [
        { name: "Navy Suit", image: "https://images.unsplash.com/photo-1758518730264-9235a1e5416b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb2IlMjBpbnRlcnZpZXclMjBvdXRmaXR8ZW58MXx8fHwxNzU4Njk4MDQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
        { name: "White Oxford Shirt", image: "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHNoaXJ0JTIwb3V0Zml0fGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
        { name: "Silk Tie", image: "https://images.unsplash.com/photo-1742631193849-acc045ea5890?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwZWxlZ2FudCUyMGZhc2hpb258ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
      ]
    }
  ],
  date: [
    {
      id: 1,
      title: "Smart Casual Date",
      description: "Relaxed yet put-together. Shows you made an effort without being overdressed.",
      fromWardrobe: true,
      items: [
        { name: "Dark Jeans", image: "https://images.unsplash.com/photo-1650118653814-482455dd4263?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRlJTIwbmlnaHQlMjBvdXRmaXR8ZW58MXx8fHwxNzU4Njk4MDQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
        { name: "White Oxford Shirt", image: "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHNoaXJ0JTIwb3V0Zml0fGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
        { name: "Brown Leather Shoes", image: "https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwYm9vdHMlMjBzaG9lc3xlbnwxfHx8fDE3NTg1OTk0MjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
      ]
    }
  ]
};

export function OutfitSuggestionsScreen({ context, onBackToMenu, onGoShopping }: OutfitSuggestionsScreenProps) {
  const suggestions = outfitSuggestions[context.occasion as keyof typeof outfitSuggestions] || outfitSuggestions.wedding;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-xl">Outfit Suggestions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Perfect looks for your {context.occasion}
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Outfit Cards */}
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className="overflow-hidden">
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg mb-1">{suggestion.title}</h3>
                  <div className="flex items-center gap-2">
                    {suggestion.fromWardrobe ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Check className="w-3 h-3 mr-1" />
                        From your wardrobe
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        <ShoppingBag className="w-3 h-3 mr-1" />
                        Needs: {suggestion.newItem}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Outfit Items */}
              <div className="grid grid-cols-3 gap-3">
                {suggestion.items.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-2 relative">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      {item.isNew && (
                        <div className="absolute top-1 right-1 w-3 h-3 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.name}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {suggestion.description}
              </p>

              {/* Action Button */}
              {!suggestion.fromWardrobe && (
                <Button 
                  onClick={onGoShopping}
                  variant="outline" 
                  className="w-full"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Find {suggestion.newItem}
                </Button>
              )}
            </div>
          </Card>
        ))}

        {/* Back to Menu */}
        <Button 
          onClick={onBackToMenu}
          variant="ghost"
          className="w-full"
        >
          Back to menu
        </Button>
      </div>
    </div>
  );
}