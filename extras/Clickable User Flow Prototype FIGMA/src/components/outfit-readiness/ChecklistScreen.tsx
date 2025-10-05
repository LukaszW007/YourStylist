import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Checkbox } from "../ui/checkbox";

interface ChecklistScreenProps {
  onItemNeedsReplacement: (item: string) => void;
  onBackToMenu: () => void;
}

export function ChecklistScreen({ onItemNeedsReplacement, onBackToMenu }: ChecklistScreenProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  const items = [
    "Navy Blazer", "White Dress Shirt", "Grey Trousers", "Black Jeans",
    "Cotton T-Shirt", "Wool Sweater", "Brown Leather Shoes", "White Sneakers"
  ];

  const toggleItem = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-center p-4 border-b">
        <h1 className="text-lg font-medium">Weekly Checklist</h1>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="text-center space-y-2">
          <h2 className="text-xl">Check Your Items</h2>
          <p className="text-muted-foreground">Mark items that are clean and ready to wear</p>
        </div>

        <div className="space-y-3">
          {items.map(item => (
            <Card key={item} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={checkedItems[item] || false}
                    onCheckedChange={() => toggleItem(item)}
                  />
                  <span className="font-medium">{item}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onItemNeedsReplacement(item)}
                  className="text-xs"
                >
                  Need Replacement
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Button onClick={onBackToMenu} className="w-full">
          Complete Checklist
        </Button>
      </div>
    </div>
  );
}