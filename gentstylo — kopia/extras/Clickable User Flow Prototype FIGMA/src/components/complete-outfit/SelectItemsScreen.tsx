import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Check } from "lucide-react";

interface SelectItemsScreenProps {
  onItemsSelected: (items: any[]) => void;
  onBack: () => void;
}

export function SelectItemsScreen({ onItemsSelected, onBack }: SelectItemsScreenProps) {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  const wardrobeItems = [
    {
      id: 1,
      name: "Pink Dress Shirt",
      category: "Shirts",
      image: "https://images.unsplash.com/photo-1631089890996-552018602b68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaW5rJTIwZHJlc3MlMjBzaGlydCUyMG1lbnN8ZW58MXx8fHwxNzU4NzAwMDQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: 2,
      name: "Brown Chukka Boots",
      category: "Shoes",
      image: "https://images.unsplash.com/photo-1559826884-dbcc4a21caed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm93biUyMGNodWtrYSUyMGJvb3RzfGVufDF8fHx8MTc1ODcwMDA0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: 3,
      name: "Navy Blazer",
      category: "Jackets",
      image: "https://images.unsplash.com/photo-1740710748146-a15d840d6f40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3xlbnwxfHx8fDE3NTg3MDAwMDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: 4,
      name: "White Oxford Shirt",
      category: "Shirts",
      image: "https://images.unsplash.com/photo-1628263516427-a82107586790?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGRyZXNzJTIwc2hpcnR8ZW58MXx8fHwxNzU4NTk1MTIxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      id: 5,
      name: "Dark Wash Jeans",
      category: "Pants",
      image: "https://images.unsplash.com/photo-1639949141928-66c8112fe6fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwamVhbnMlMjBtZW5zfGVufDF8fHx8MTc1ODcwMDAxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  const categories = ["All", "Shirts", "Pants", "Jackets", "Shoes"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredItems = selectedCategory === "All" 
    ? wardrobeItems 
    : wardrobeItems.filter(item => item.category === selectedCategory);

  const toggleItem = (item: any) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.id === item.id);
      if (isSelected) {
        return prev.filter(i => i.id !== item.id);
      } else if (prev.length < 2) {
        return [...prev, item];
      }
      return prev;
    });
  };

  const isSelected = (item: any) => selectedItems.some(i => i.id === item.id);

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <h1 className="text-lg font-medium">Complete My Outfit</h1>
        <div className="w-12" />
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="text-center space-y-2">
          <h2 className="text-xl">Choose 1-2 Items</h2>
          <p className="text-muted-foreground">
            Select the pieces you want to wear, and we'll suggest complete outfits
          </p>
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map(item => (
            <Card
              key={item.id}
              className={`p-3 cursor-pointer transition-all ${
                isSelected(item) ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => toggleItem(item)}
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-32 object-cover rounded"
                />
                {isSelected(item) && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="mt-2">
                <h3 className="font-medium text-sm">{item.name}</h3>
                <Badge variant="secondary" className="text-xs mt-1">
                  {item.category}
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        {selectedItems.length > 0 && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Selected Items ({selectedItems.length}/2)</h4>
            <div className="flex space-x-2">
              {selectedItems.map(item => (
                <Badge key={item.id} variant="default" className="text-xs">
                  {item.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={() => onItemsSelected(selectedItems)}
          disabled={selectedItems.length === 0}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Find Matching Outfits ({selectedItems.length} items selected)
        </Button>
      </div>
    </div>
  );
}