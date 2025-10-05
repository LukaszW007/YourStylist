import { RotateCcw, Save, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useState } from "react";

interface VirtualFittingScreenProps {
  newItem: any;
  onSaveOutfit: (outfit: any) => void;
  onGoToPurchase: () => void;
  onBackToShopping: () => void;
}

const wardrobeCategories = {
  tops: [
    {
      id: 1,
      name: "White Oxford Shirt",
      image: "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx3aGl0ZSUyMHNoaXJ0JTIwb3V0Zml0fGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: 2,
      name: "Gray T-Shirt",
      image: "https://images.unsplash.com/photo-1693901257178-b5fcb8f036a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NjkxMjQzfDA&ixlib=rb-4.1.0&q-80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: 3,
      name: "Navy Sweater",
      image: "https://images.unsplash.com/photo-1693901257178-b5fcb8f036a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NjkxMjQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ],
  bottoms: [
    {
      id: 4,
      name: "Dark Wash Jeans",
      image: "https://images.unsplash.com/photo-1756009531697-51da316bfa3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxiZWlnZSUyMGNoaW5vcyUyMHBhbnRzfGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: 5,
      name: "Khaki Chinos",
      image: "https://images.unsplash.com/photo-1756009531697-51da316bfa3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxiZWlnZSUyMGNoaW5vcyUyMHBhbnRzfGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: 6,
      name: "Black Dress Pants",
      image: "https://images.unsplash.com/photo-1756009531697-51da316bfa3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxiZWlnZSUyMGNoaW5vcyUyMHBhbnRzfGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ],
  shoes: [
    {
      id: 7,
      name: "Brown Leather Boots",
      image: "https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NTk5NDI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: 8,
      name: "White Sneakers",
      image: "https://images.unsplash.com/photo-1693901257178-b5fcb8f036a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NjkxMjQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: 9,
      name: "Black Dress Shoes",
      image: "https://images.unsplash.com/photo-1576792741377-eb0f4f6d1a47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NjM2MDk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ]
};

export function VirtualFittingScreen({ newItem, onSaveOutfit, onGoToPurchase, onBackToShopping }: VirtualFittingScreenProps) {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<'tops' | 'bottoms' | 'shoes'>('tops');

  const handleItemSelect = (item: any) => {
    const existingIndex = selectedItems.findIndex(selected => 
      wardrobeCategories.tops.includes(selected) && wardrobeCategories.tops.includes(item) ||
      wardrobeCategories.bottoms.includes(selected) && wardrobeCategories.bottoms.includes(item) ||
      wardrobeCategories.shoes.includes(selected) && wardrobeCategories.shoes.includes(item)
    );

    if (existingIndex !== -1) {
      // Replace item in same category
      const newSelectedItems = [...selectedItems];
      newSelectedItems[existingIndex] = item;
      setSelectedItems(newSelectedItems);
    } else {
      // Add new item
      setSelectedItems(prev => [...prev, item]);
    }
  };

  const handleRemoveItem = (itemId: number) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleClearAll = () => {
    setSelectedItems([]);
  };

  const handleSaveCombo = () => {
    const outfit = {
      name: `Outfit with ${newItem.name}`,
      newItem: newItem,
      existingItems: selectedItems,
      createdDate: new Date().toLocaleDateString()
    };
    onSaveOutfit(outfit);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-6 border-b">
        <Button variant="ghost" onClick={onBackToShopping} className="mb-3">
          ← Back to shopping
        </Button>
        <h1 className="text-xl mb-1">Virtual Fitting Room</h1>
        <p className="text-sm text-muted-foreground">
          See how "{newItem.name}" works with your wardrobe
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* New Item Preview */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
              <ImageWithFallback
                src={newItem.image}
                alt={newItem.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-base mb-1">{newItem.name}</h3>
              <Badge className="bg-blue-600 text-white">New Item</Badge>
              <p className="text-sm text-muted-foreground mt-1">{newItem.price}</p>
            </div>
          </div>
        </Card>

        {/* Outfit Creator */}
        <div className="grid grid-cols-2 gap-6">
          {/* Virtual Outfit Preview */}
          <div className="space-y-4">
            <h3 className="text-lg">Your Outfit</h3>
            <Card className="aspect-[3/4] p-4 border-2 border-dashed">
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                {/* New Item (Always Shown) */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-blue-100 border-2 border-blue-500">
                  <ImageWithFallback
                    src={newItem.image}
                    alt={newItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Selected Items */}
                {selectedItems.map((item, index) => (
                  <div key={item.id} className="relative">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted border-2 border-primary">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}

                {selectedItems.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Select items from your wardrobe to see the complete outfit
                  </p>
                )}
              </div>
            </Card>

            {/* Outfit Actions */}
            <div className="space-y-2">
              <Button 
                onClick={handleClearAll}
                variant="outline" 
                size="sm" 
                className="w-full"
                disabled={selectedItems.length === 0}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>

          {/* Wardrobe Items */}
          <div className="space-y-4">
            <h3 className="text-lg">Your Wardrobe</h3>
            
            {/* Category Tabs */}
            <div className="flex gap-1">
              {Object.keys(wardrobeCategories).map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category as any)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {wardrobeCategories[activeCategory].map((item) => (
                <Card 
                  key={item.id}
                  className={`p-3 cursor-pointer transition-all ${
                    selectedItems.some(selected => selected.id === item.id)
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleItemSelect(item)}
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-center line-clamp-2">{item.name}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* AI Compatibility */}
        {selectedItems.length > 0 && (
          <Card className="p-4 bg-green-50 border-green-200">
            <h4 className="text-sm mb-2">AI Style Analysis</h4>
            <p className="text-xs text-muted-foreground">
              Great combination! The {newItem.name} works well with your selected pieces. 
              This creates a balanced, versatile look that's perfect for multiple occasions.
            </p>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleSaveCombo}
            className="w-full h-12"
            disabled={selectedItems.length === 0}
          >
            <Save className="w-5 h-5 mr-2" />
            Save This Outfit Combo
          </Button>
          
          <Button 
            onClick={onGoToPurchase}
            variant="outline"
            className="w-full h-12"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Purchase {newItem.name}
          </Button>
        </div>
      </div>
    </div>
  );
}