import { Check, Plus } from "lucide-react";
import { Progress } from "../ui/progress";

interface EssentialsListScreenProps {
  selectedStyle: string;
  onItemClick: (item: string) => void;
}

const essentialsData = {
  'smart-casual': {
    owned: [
      'White Shirt',
      'Dark Jeans',
      'Brown Leather Belt',
      'White Sneakers'
    ],
    missing: [
      'Navy Blazer',
      'Beige Chinos',
      'Leather Shoes',
      'Polo Shirt',
      'Canvas Sneakers',
      'Casual Watch'
    ]
  },
  'minimalism': {
    owned: [
      'Black T-shirt',
      'White T-shirt',
      'Gray Hoodie'
    ],
    missing: [
      'Black Jeans',
      'White Sneakers',
      'Black Jacket',
      'Minimal Watch',
      'Canvas Bag',
      'White Shirt',
      'Gray Pants'
    ]
  },
  'classic-elegance': {
    owned: [
      'Navy Suit',
      'White Dress Shirt'
    ],
    missing: [
      'Black Leather Shoes',
      'Silk Tie',
      'Pocket Square',
      'Leather Belt',
      'Dress Watch',
      'Cashmere Scarf',
      'Wool Overcoat',
      'Cufflinks'
    ]
  }
};

const styleNames = {
  'smart-casual': 'Smart Casual',
  'minimalism': 'Minimalism',
  'classic-elegance': 'Classic Elegance'
};

export function EssentialsListScreen({ selectedStyle, onItemClick }: EssentialsListScreenProps) {
  const data = essentialsData[selectedStyle as keyof typeof essentialsData];
  const totalItems = data.owned.length + data.missing.length;
  const completedItems = data.owned.length;
  const progressPercentage = (completedItems / totalItems) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-xl mb-4">Capsule Wardrobe: {styleNames[selectedStyle as keyof typeof styleNames]}</h1>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{completedItems} of {totalItems} items completed</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* You've Got It Section */}
        {data.owned.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg text-green-600">You've Got It!</h2>
            <div className="space-y-2">
              {data.owned.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-green-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Up for Grabs Section */}
        <div className="space-y-4">
          <h2 className="text-lg">Up for grabs</h2>
          <div className="space-y-2">
            {data.missing.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => onItemClick(item)}
              >
                <Plus className="w-5 h-5 text-primary flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}