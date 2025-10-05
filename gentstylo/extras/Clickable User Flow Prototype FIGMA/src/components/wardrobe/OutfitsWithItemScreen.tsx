import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface OutfitsWithItemScreenProps {
  item: any;
  onBackToDetails: () => void;
}

const outfitsWithItem = [
  {
    id: 1,
    name: "Smart Casual Office",
    items: [
      { name: "Navy Wool Blazer", image: "https://images.unsplash.com/photo-1626872640220-e5f4454198b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3dlYXJ8ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", isSelected: true },
      { name: "White Oxford Shirt", image: "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx3aGl0ZSUyMHNoaXJ0JTIwb3V0Zml0fGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
      { name: "Dark Wash Jeans", image: "https://images.unsplash.com/photo-1756009531697-51da316bfa3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxiZWlnZSUyMGNoaW5vcyUyMHBhbnRzfGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
      { name: "Brown Leather Boots", image: "https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NTk5NDI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
    ],
    isFavorite: true,
    lastWorn: "2 days ago"
  },
  {
    id: 2,
    name: "Weekend Casual",
    items: [
      { name: "Navy Wool Blazer", image: "https://images.unsplash.com/photo-1626872640220-e5f4454198b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3dlYXJ8ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", isSelected: true },
      { name: "Gray T-Shirt", image: "https://images.unsplash.com/photo-1693901257178-b5fcb8f036a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NjkxMjQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
      { name: "Dark Wash Jeans", image: "https://images.unsplash.com/photo-1756009531697-51da316bfa3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxiZWlnZSUyMGNoaW5vcyUyMHBhbnRzfGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
      { name: "White Sneakers", image: "https://images.unsplash.com/photo-1693901257178-b5fcb8f036a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NjkxMjQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
    ],
    isFavorite: false,
    lastWorn: "1 week ago"
  },
  {
    id: 3,
    name: "Date Night Look",
    items: [
      { name: "Navy Wool Blazer", image: "https://images.unsplash.com/photo-1626872640220-e5f4454198b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3dlYXJ8ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", isSelected: true },
      { name: "Black T-Shirt", image: "https://images.unsplash.com/photo-1649003918140-d5e0daad6050?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHQlMjBzaGlydCUyMG1lbnN3ZWFyfGVufDF8fHx8MTc1ODYzNjA5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
      { name: "Black Chinos", image: "https://images.unsplash.com/photo-1756009531697-51da316bfa3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxiZWlnZSUyMGNoaW5vcyUyMHBhbnRzfGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
      { name: "Black Dress Shoes", image: "https://images.unsplash.com/photo-1576792741377-eb0f4f6d1a47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NjM2MDk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
    ],
    isFavorite: true,
    lastWorn: "Never"
  }
];

export function OutfitsWithItemScreen({ item, onBackToDetails }: OutfitsWithItemScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-6 border-b">
        <Button variant="ghost" onClick={onBackToDetails} className="mb-3">
          ← Back to details
        </Button>
        <h1 className="text-xl">Outfits with {item.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {outfitsWithItem.length} saved outfits featuring this item
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Outfits List */}
        {outfitsWithItem.map((outfit) => (
          <Card key={outfit.id} className="overflow-hidden">
            <div className="p-6">
              {/* Outfit Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base mb-1">{outfit.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Last worn: {outfit.lastWorn}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {outfit.isFavorite && (
                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                  )}
                </div>
              </div>

              {/* Outfit Items */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {outfit.items.map((outfitItem, index) => (
                  <div key={index} className="text-center">
                    <div className={`aspect-square rounded-lg overflow-hidden bg-muted mb-2 relative ${
                      outfitItem.isSelected ? 'ring-2 ring-primary' : ''
                    }`}>
                      <ImageWithFallback
                        src={outfitItem.image}
                        alt={outfitItem.name}
                        className="w-full h-full object-cover"
                      />
                      {outfitItem.isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Badge className="text-xs">Featured</Badge>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {outfitItem.name}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    // In a real app, this would save to favorites
                    console.log("Toggled favorite for outfit:", outfit.id);
                  }}
                >
                  <Heart className={`w-4 h-4 mr-2 ${outfit.isFavorite ? 'fill-current text-red-500' : ''}`} />
                  {outfit.isFavorite ? 'Unfavorite' : 'Favorite'}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    // In a real app, this would open outfit planner
                    console.log("Planning outfit:", outfit.id);
                  }}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Wear Today
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {/* No Outfits State */}
        {outfitsWithItem.length === 0 && (
          <Card className="p-8 text-center">
            <h3 className="text-lg mb-2">No outfits yet</h3>
            <p className="text-muted-foreground mb-4">
              This item hasn't been used in any saved outfits yet.
            </p>
            <Button>Create First Outfit</Button>
          </Card>
        )}
      </div>
    </div>
  );
}