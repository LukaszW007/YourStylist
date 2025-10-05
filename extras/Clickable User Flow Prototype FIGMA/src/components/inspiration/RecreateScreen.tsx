import { Check, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface RecreateScreenProps {
  inspirationLook: any;
  onGoShopping: () => void;
  onSaveOutfit: () => void;
  onBackToInspiration: () => void;
}

const recreatedOutfit = {
  ownedItems: [
    {
      name: "Navy Wool Blazer",
      image: "https://images.unsplash.com/photo-1626872640220-e5f4454198b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3dlYXJ8ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      status: "owned"
    },
    {
      name: "White Oxford Shirt",
      image: "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx3aGl0ZSUyMHNoaXJ0JTIwb3V0Zml0fGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      status: "owned"
    },
    {
      name: "Dark Wash Jeans",
      image: "https://images.unsplash.com/photo-1756009531697-51da316bfa3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxiZWlnZSUyMGNoaW5vcyUyMHBhbnRzfGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      status: "owned"
    }
  ],
  missingItem: {
    name: "Brown Leather Dress Shoes",
    image: "https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NTk5NDI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "missing",
    price: "$120-180",
    alternatives: ["Black Dress Shoes", "Brown Casual Shoes"]
  }
};

export function RecreateScreen({ inspirationLook, onGoShopping, onSaveOutfit, onBackToInspiration }: RecreateScreenProps) {
  const totalItems = recreatedOutfit.ownedItems.length + 1;
  const ownedItems = recreatedOutfit.ownedItems.length;
  const completionRate = Math.round((ownedItems / totalItems) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-6 border-b">
        <Button variant="ghost" onClick={onBackToInspiration} className="mb-3">
          ← Back to inspiration
        </Button>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl">Recreate This Look</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Based on "{inspirationLook.title}"
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Original vs Recreated */}
        <div className="grid grid-cols-2 gap-4">
          {/* Original Look */}
          <Card className="overflow-hidden">
            <div className="aspect-[3/4] relative">
              <ImageWithFallback
                src={inspirationLook.image}
                alt="Original inspiration"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2">
                <Badge className="w-full justify-center bg-black/70 text-white">
                  Original
                </Badge>
              </div>
            </div>
          </Card>

          {/* Your Version */}
          <Card className="overflow-hidden border-2 border-dashed border-primary">
            <div className="aspect-[3/4] p-4 flex flex-col justify-center items-center space-y-3">
              <div className="text-6xl">👔</div>
              <div className="text-center">
                <p className="text-sm mb-1">Your Version</p>
                <Badge className="bg-green-600 text-white">
                  {completionRate}% ready
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Completion Status */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base">Outfit Progress</h3>
            <span className="text-sm text-muted-foreground">
              {ownedItems}/{totalItems} items
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            You have most of what you need to recreate this look!
          </p>
        </Card>

        {/* Items Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg">Items You Need</h3>
          
          {/* Owned Items */}
          <div className="space-y-2">
            {recreatedOutfit.ownedItems.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm">{item.name}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Owned
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Missing Item */}
          <Card className="p-3 border-orange-200 bg-orange-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                <ImageWithFallback
                  src={recreatedOutfit.missingItem.image}
                  alt={recreatedOutfit.missingItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-sm mb-1">{recreatedOutfit.missingItem.name}</h4>
                <p className="text-xs text-muted-foreground">
                  Estimated: {recreatedOutfit.missingItem.price}
                </p>
              </div>
              <Badge className="bg-orange-100 text-orange-800 text-xs">
                Missing
              </Badge>
            </div>
            
            {/* Alternatives */}
            <div className="mt-3 pt-3 border-t border-orange-200">
              <p className="text-xs text-muted-foreground mb-2">You could also use:</p>
              <div className="flex gap-2">
                {recreatedOutfit.missingItem.alternatives.map((alt, index) => (
                  <span key={index} className="text-xs bg-white px-2 py-1 rounded border">
                    {alt}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={onGoShopping}
            className="w-full h-12"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Find {recreatedOutfit.missingItem.name}
          </Button>
          
          <Button 
            onClick={onSaveOutfit}
            variant="outline"
            className="w-full h-12"
          >
            <Check className="w-5 h-5 mr-2" />
            Save This Outfit Idea
          </Button>
        </div>

        {/* Styling Tip */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm mb-1">Styling Tip</h4>
              <p className="text-xs text-muted-foreground">
                Even without the exact shoes, you can recreate this look's essence with what you have. The key is in the clean, structured silhouette.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}