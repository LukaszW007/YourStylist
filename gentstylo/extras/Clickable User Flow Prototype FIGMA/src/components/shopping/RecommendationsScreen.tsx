import { ExternalLink, Star } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface RecommendationsScreenProps {
  filters: any;
  onBackToMenu: () => void;
}

const recommendations = [
  {
    id: 1,
    name: "Classic Navy Wool Blazer",
    brand: "Hugo Boss",
    price: "$280",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1626872640220-e5f4454198b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3dlYXJ8ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    reason: "Perfect fit for smart casual style. High-quality wool blend that matches your capsule wardrobe aesthetic.",
    store: "Hugo Boss Official"
  },
  {
    id: 2,
    name: "Tailored Navy Blazer",
    brand: "Zara",
    price: "$129",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwYm9vdHMlMjBzaG9lc3xlbnwxfHx8fDE3NTg1OTk0MjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    reason: "Great value for money. Modern cut that works well for both office and casual settings.",
    store: "Zara Online"
  },
  {
    id: 3,
    name: "Premium Navy Blazer",
    brand: "Uniqlo",
    price: "$89",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHNoaXJ0JTIwb3V0Zml0fGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    reason: "Excellent quality-to-price ratio. Versatile design that pairs well with your existing wardrobe.",
    store: "Uniqlo"
  }
];

export function RecommendationsScreen({ filters, onBackToMenu }: RecommendationsScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-xl">Personalized Recommendations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {recommendations.length} results for "{filters.query}"
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Recommendations List */}
        {recommendations.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="p-4">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.brand}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg">{item.price}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current text-yellow-500" />
                        <span className="text-sm">{item.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendation */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Why we recommend this:</p>
                    <p className="text-sm">{item.reason}</p>
                  </div>

                  {/* Store Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      // In a real app, this would open the store link
                      console.log(`Opening ${item.store} for ${item.name}`);
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Go to {item.store}
                  </Button>
                </div>
              </div>
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