import { Star, AlertTriangle, Lightbulb } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface HitsAndMissesScreenProps {
  onInspireMe: (item: any) => void;
  onBackToDashboard: () => void;
}

const mostWornItems = [
  {
    id: 1,
    name: "White Oxford Shirt",
    image: "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx3aGl0ZSUyMHNoaXJ0JTIwb3V0Zml0fGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    wearCount: 23,
    costPerWear: "$2.17",
    category: "Tops"
  },
  {
    id: 2,
    name: "Dark Wash Jeans",
    image: "https://images.unsplash.com/photo-1756009531697-51da316bfa3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxiZWlnZSUyMGNoaW5vcyUyMHBhbnRzfGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    wearCount: 19,
    costPerWear: "$3.16",
    category: "Bottoms"
  },
  {
    id: 3,
    name: "Brown Leather Boots",
    image: "https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NTk5NDI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    wearCount: 16,
    costPerWear: "$8.75",
    category: "Shoes"
  },
  {
    id: 4,
    name: "Navy Wool Blazer",
    image: "https://images.unsplash.com/photo-1626872640220-e5f4454198b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3dlYXJ8ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    wearCount: 14,
    costPerWear: "$20.00",
    category: "Outerwear"
  },
  {
    id: 5,
    name: "Gray Wool Sweater",
    image: "https://images.unsplash.com/photo-1693901257178-b5fcb8f036a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NjkxMjQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    wearCount: 12,
    costPerWear: "$7.50",
    category: "Tops"
  }
];

const forgottenItems = [
  {
    id: 6,
    name: "Yellow Summer Shirt",
    image: "https://images.unsplash.com/photo-1649003918140-d5e0daad6050?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHQlMjBzaGlydCUyMG1lbnN3ZWFyfGVufDF8fHx8MTc1ODYzNjA5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    lastWorn: "14 months ago",
    reason: "Bold color, hard to match",
    category: "Tops"
  },
  {
    id: 7,
    name: "Formal Black Suit",
    image: "https://images.unsplash.com/photo-1758518730264-9235a1e5416b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb2IlMjBpbnRlcnZpZXclMjBvdXRmaXR8ZW58MXx8fHwxNzU4Njk4MDQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    lastWorn: "18 months ago",
    reason: "Too formal for daily occasions",
    category: "Outerwear"
  },
  {
    id: 8,
    name: "Red Leather Shoes",
    image: "https://images.unsplash.com/photo-1576792741377-eb0f4f6d1a47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NjM2MDk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    lastWorn: "20 months ago",
    reason: "Unique color, limited matching options",
    category: "Shoes"
  },
  {
    id: 9,
    name: "Patterned Tie",
    image: "https://images.unsplash.com/photo-1742631193849-acc045ea5890?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwZWxlZ2FudCUyMGZhc2hpb258ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    lastWorn: "2 years ago",
    reason: "Complex pattern, hard to style",
    category: "Accessories"
  }
];

export function HitsAndMissesScreen({ onInspireMe, onBackToDashboard }: HitsAndMissesScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-6 border-b">
        <Button variant="ghost" onClick={onBackToDashboard} className="mb-3">
          ← Back to dashboard
        </Button>
        <h1 className="text-xl">Your Hits and Misses</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Discover your wardrobe patterns and unlock hidden potential
        </p>
      </div>

      <div className="p-6 space-y-8">
        {/* Most Worn Items */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg">Most Worn (Last 3 Months)</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Your wardrobe MVPs - these items are working hard for you!
          </p>
          
          <div className="space-y-3">
            {mostWornItems.map((item, index) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-sm mb-1">{item.name}</h3>
                    <div className="flex gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      <Badge className="text-xs bg-green-100 text-green-800">
                        #{index + 1} Most Worn
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Worn {item.wearCount} times • {item.costPerWear} per wear
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Forgotten Items */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg">Forgotten in the Closet</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            These items need some love - let's find new ways to style them!
          </p>
          
          <div className="space-y-3">
            {forgottenItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-sm mb-1">{item.name}</h3>
                    <div className="flex gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
                        Last worn: {item.lastWorn}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Why it's forgotten: {item.reason}
                    </p>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onInspireMe(item)}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <Lightbulb className="w-3 h-3 mr-2" />
                      Inspire Me
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Summary Card */}
        <Card className="p-6 bg-blue-50">
          <h3 className="text-base mb-2">Wardrobe Efficiency Score</h3>
          <div className="text-3xl mb-2">73%</div>
          <p className="text-sm text-muted-foreground">
            You're making good use of your wardrobe! Try incorporating some forgotten items to boost your score.
          </p>
        </Card>
      </div>
    </div>
  );
}