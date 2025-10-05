import { Check, RefreshCw, Package } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useState } from "react";

interface InteractivePackingScreenProps {
  tripData: any;
  onBackToMenu: () => void;
}

const packingItems = [
  {
    id: 1,
    name: "Navy Business Suit",
    category: "Suits",
    image: "https://images.unsplash.com/photo-1758518730264-9235a1e5416b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb2IlMjBpbnRlcnZpZXclMjBvdXRmaXR8ZW58MXx8fHwxNzU4Njk4MDQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alternatives: ["Charcoal Suit", "Dark Gray Suit"]
  },
  {
    id: 2,
    name: "White Dress Shirt",
    category: "Dress Shirts",
    image: "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHNoaXJ0JTIwb3V0Zml0fGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alternatives: ["Light Blue Shirt", "Striped Shirt"]
  },
  {
    id: 3,
    name: "Navy Silk Tie",
    category: "Ties",
    image: "https://images.unsplash.com/photo-1742631193849-acc045ea5890?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwZWxlZ2FudCUyMGZhc2hpb258ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alternatives: ["Red Tie", "Patterned Tie"]
  },
  {
    id: 4,
    name: "Black Leather Shoes",
    category: "Dress Shoes",
    image: "https://images.unsplash.com/photo-1576792741377-eb0f4f6d1a47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwZHJlc3MlMjBzaG9lc3xlbnwxfHx8fDE3NTg2MzYwOTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alternatives: ["Brown Oxford Shoes", "Derby Shoes"]
  },
  {
    id: 5,
    name: "Dark Jeans",
    category: "Casual",
    image: "https://images.unsplash.com/photo-1756009531697-51da316bfa3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWlnZSUyMGNoaW5vcyUyMHBhbnRzfGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alternatives: ["Khaki Chinos", "Black Jeans"]
  },
  {
    id: 6,
    name: "White Sneakers",
    category: "Casual",
    image: "https://images.unsplash.com/photo-1693901257178-b5fcb8f036a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwc3R5bGUlMjBjbG90aGluZ3xlbnwxfHx8fDE3NTg2OTEyNDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alternatives: ["Canvas Sneakers", "Running Shoes"]
  }
];

export function InteractivePackingScreen({ tripData, onBackToMenu }: InteractivePackingScreenProps) {
  const [packedItems, setPackedItems] = useState<number[]>([]);
  const [substitutions, setSubstitutions] = useState<Record<number, string>>({});

  const handleItemCheck = (itemId: number, checked: boolean) => {
    if (checked) {
      setPackedItems(prev => [...prev, itemId]);
    } else {
      setPackedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleSubstitution = (itemId: number, alternative: string) => {
    setSubstitutions(prev => ({ ...prev, [itemId]: alternative }));
  };

  const packedCount = packedItems.length;
  const totalItems = packingItems.length;
  const completionPercentage = Math.round((packedCount / totalItems) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-xl">Interactive Packing List</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {tripData.destination} • {tripData.tripType} trip
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Progress Card */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <h3 className="text-base">Packing Progress</h3>
            </div>
            <Badge variant={completionPercentage === 100 ? "default" : "outline"}>
              {packedCount}/{totalItems} items
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {completionPercentage}% complete
          </p>
        </Card>

        {/* Packing Items */}
        <div className="space-y-3">
          {packingItems.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <Checkbox
                  checked={packedItems.includes(item.id)}
                  onCheckedChange={(checked) => handleItemCheck(item.id, checked)}
                  className="mt-1"
                />

                {/* Item Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm mb-1 ${packedItems.includes(item.id) ? 'line-through text-muted-foreground' : ''}`}>
                    {substitutions[item.id] || item.name}
                  </h4>
                  <Badge variant="outline" className="text-xs mb-2">
                    {item.category}
                  </Badge>

                  {/* Alternatives */}
                  {item.alternatives.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Alternatives:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.alternatives.map((alt, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleSubstitution(item.id, alt)}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            {alt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Completion Actions */}
        {completionPercentage === 100 && (
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-800">All packed!</p>
                <p className="text-xs text-green-600">You're ready for your trip to {tripData.destination}!</p>
              </div>
            </div>
          </Card>
        )}

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