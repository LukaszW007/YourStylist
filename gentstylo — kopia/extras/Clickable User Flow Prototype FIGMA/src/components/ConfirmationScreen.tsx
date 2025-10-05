import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ClothingItem {
  id: number;
  image: string;
  type: string;
  color: string;
}

interface ConfirmationScreenProps {
  onAddToCloset: () => void;
}

const mockClothingItems: ClothingItem[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1618453292459-53424b66bb6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHQtc2hpcnQlMjBjbG90aGluZ3xlbnwxfHx8fDE3NTg2OTA5NzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    type: "T-shirt",
    color: "Black"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1713880442898-0f151fba5e16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVlJTIwamVhbnMlMjBkZW5pbXxlbnwxfHx8fDE3NTg2Nzk1NDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    type: "Jeans",
    color: "Blue"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1578314921455-34dd4626b38d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHNuZWFrZXJzJTIwc2hvZXN8ZW58MXx8fHwxNzU4NTkxNjczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    type: "Sneakers",
    color: "White"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1509300936132-65ad921bad41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmF5JTIwc3dlYXRzaGlydCUyMGhvb2RpZXxlbnwxfHx8fDE3NTg2OTA5NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    type: "Sweatshirt",
    color: "Gray"
  }
];

export function ConfirmationScreen({ onAddToCloset }: ConfirmationScreenProps) {
  const [items, setItems] = useState<ClothingItem[]>(mockClothingItems);

  const typeOptions = ["T-shirt", "Shirt", "Tank Top", "Jeans", "Pants", "Shorts", "Sneakers", "Dress Shoes", "Sandals", "Sweatshirt", "Hoodie", "Jacket"];
  const colorOptions = ["Black", "White", "Gray", "Blue", "Red", "Green", "Yellow", "Purple", "Orange", "Brown"];

  const updateItem = (id: number, field: 'type' | 'color', value: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl mb-2">We've identified 4 items of clothing. Confirm.</h1>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {items.map((item) => (
            <Card key={item.id} className="p-3 space-y-3">
              {/* Item Image */}
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <ImageWithFallback
                  src={item.image}
                  alt={`${item.color} ${item.type}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Labels */}
              <div className="space-y-2">
                {/* Type Label */}
                <div className="relative">
                  <select
                    value={item.type}
                    onChange={(e) => updateItem(item.id, 'type', e.target.value)}
                    className="w-full appearance-none bg-secondary border border-border rounded-md px-3 py-1.5 pr-8 text-sm cursor-pointer hover:bg-secondary/80 transition-colors"
                  >
                    {typeOptions.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>

                {/* Color Label */}
                <div className="relative">
                  <select
                    value={item.color}
                    onChange={(e) => updateItem(item.id, 'color', e.target.value)}
                    className="w-full appearance-none bg-secondary border border-border rounded-md px-3 py-1.5 pr-8 text-sm cursor-pointer hover:bg-secondary/80 transition-colors"
                  >
                    {colorOptions.map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Add Button */}
        <Button 
          onClick={onAddToCloset}
          className="w-full h-12"
          size="lg"
        >
          Add all to my closet
        </Button>
      </div>
    </div>
  );
}