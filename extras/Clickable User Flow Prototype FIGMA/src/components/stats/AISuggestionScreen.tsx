import { Sparkles, Heart, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface AISuggestionScreenProps {
  forgottenItem: any;
  onSaveOutfit: (outfit: any) => void;
  onPlanOutfit: (outfit: any) => void;
  onBackToStats: () => void;
}

const suggestions = [
  {
    id: 1,
    title: "Casual Weekend Vibes",
    description: "Pair your yellow shirt with dark jeans and white sneakers for a relaxed, approachable look.",
    items: [
      { name: "Yellow Summer Shirt", image: "https://images.unsplash.com/photo-1649003918140-d5e0daad6050?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHQlMjBzaGlydCUyMG1lbnN3ZWFyfGVufDF8fHx8MTc1ODYzNjA5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", isFeatured: true },
      { name: "Dark Wash Jeans", image: "https://images.unsplash.com/photo-1756009531697-51da316bfa3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxiZWlnZSUyMGNoaW5vcyUyMHBhbnRzfGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
      { name: "White Sneakers", image: "https://images.unsplash.com/photo-1693901257178-b5fcb8f036a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NjkxMjQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
    ],
    occasion: "Weekend casual, coffee dates, outdoor activities"
  },
  {
    id: 2,
    title: "Smart Casual Confidence",
    description: "Layer under a navy blazer with chinos for a sophisticated pop of color that's still professional.",
    items: [
      { name: "Yellow Summer Shirt", image: "https://images.unsplash.com/photo-1649003918140-d5e0daad6050?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHQlMjBzaGlydCUyMG1lbnN3ZWFyfGVufDF8fHx8MTc1ODYzNjA5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", isFeatured: true },
      { name: "Navy Wool Blazer", image: "https://images.unsplash.com/photo-1626872640220-e5f4454198b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3dlYXJ8ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
      { name: "Khaki Chinos", image: "https://images.unsplash.com/photo-1756009531697-51da316bfa3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxiZWlnZSUyMGNoaW5vcyUyMHBhbnRzfGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
      { name: "Brown Leather Boots", image: "https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NTk5NDI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
    ],
    occasion: "Work meetings, casual Fridays, lunch dates"
  },
  {
    id: 3,
    title: "Summer Festival Ready",
    description: "Embrace the boldness! Pair with white shorts and canvas shoes for a fun, festival-appropriate look.",
    items: [
      { name: "Yellow Summer Shirt", image: "https://images.unsplash.com/photo-1649003918140-d5e0daad6050?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHQlMjBzaGlydCUyMG1lbnN3ZWFyfGVufDF8fHx8MTc1ODYzNjA5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", isFeatured: true },
      { name: "White Shorts", image: "https://images.unsplash.com/photo-1756009531697-51da316bfa3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxiZWlnZSUyMGNoaW5vcyUyMHBhbnRzfGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
      { name: "Canvas Sneakers", image: "https://images.unsplash.com/photo-1693901257178-b5fcb8f036a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NjkxMjQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
    ],
    occasion: "Summer festivals, beach trips, outdoor events"
  }
];

export function AISuggestionScreen({ forgottenItem, onSaveOutfit, onPlanOutfit, onBackToStats }: AISuggestionScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-6 border-b">
        <Button variant="ghost" onClick={onBackToStats} className="mb-3">
          ← Back to stats
        </Button>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl">AI Styling Suggestions</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Fresh ways to style your {forgottenItem.name}
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Featured Item */}
        <Card className="p-4 bg-blue-50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
              <ImageWithFallback
                src={forgottenItem.image}
                alt={forgottenItem.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-base mb-1">{forgottenItem.name}</h3>
              <Badge className="bg-blue-600 text-white">Featured Item</Badge>
              <p className="text-xs text-muted-foreground mt-2">
                Last worn: {forgottenItem.lastWorn}
              </p>
            </div>
          </div>
        </Card>

        {/* Styling Suggestions */}
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className="overflow-hidden">
            <div className="p-6 space-y-4">
              {/* Suggestion Header */}
              <div>
                <h3 className="text-lg mb-2">{suggestion.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {suggestion.description}
                </p>
                <Badge variant="outline" className="text-xs">
                  Perfect for: {suggestion.occasion}
                </Badge>
              </div>

              {/* Outfit Items */}
              <div className="grid grid-cols-3 gap-3">
                {suggestion.items.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className={`aspect-square rounded-lg overflow-hidden bg-muted mb-2 relative ${
                      item.isFeatured ? 'ring-2 ring-blue-500' : ''
                    }`}>
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      {item.isFeatured && (
                        <div className="absolute top-1 right-1">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.name}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => onSaveOutfit(suggestion)}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Save Outfit
                </Button>
                
                <Button 
                  size="sm"
                  className="flex-1"
                  onClick={() => onPlanOutfit(suggestion)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Plan for This Week
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {/* Styling Tip */}
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm mb-1">Pro Tip</h4>
              <p className="text-xs text-muted-foreground">
                Bold colors like yellow work best when balanced with neutrals. Don't be afraid to make it the star of your outfit!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}