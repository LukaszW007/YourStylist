import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Star, Heart } from "lucide-react";

interface ShowstopperScreenProps {
  onViewGuide: () => void;
  onTryAnother: () => void;
}

export function ShowstopperScreen({ onViewGuide, onTryAnother }: ShowstopperScreenProps) {
  const outfit = [
    { name: "Burgundy Velvet Blazer", image: "https://images.unsplash.com/photo-1740710748146-a15d840d6f40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3xlbnwxfHx8fDE3NTg3MDAwMDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Crisp White Shirt", image: "https://images.unsplash.com/photo-1628263516427-a82107586790?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGRyZXNzJTIwc2hpcnR8ZW58MXx8fHwxNzU4NTk1MTIxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Black Dress Pants", image: "https://images.unsplash.com/photo-1584865288642-42078afe6942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaGlub3MlMjBwYW50cyUyMG1lbnN8ZW58MXx8fHwxNzU4NzAwMDc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Patent Leather Loafers", image: "https://images.unsplash.com/photo-1559826884-dbcc4a21caed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm93biUyMGNodWtrYSUyMGJvb3RzfGVufDF8fHx8MTc1ODcwMDA0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-center p-4 border-b">
        <h1 className="text-lg font-medium">Showstopper Look</h1>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="text-center space-y-2">
          <Star className="h-8 w-8 mx-auto text-yellow-500" />
          <h2 className="text-xl">Bold & Sophisticated</h2>
          <Badge className="bg-purple-600">Confidence Level: Maximum</Badge>
        </div>

        <Card className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {outfit.map((item, index) => (
              <div key={index} className="text-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-24 object-cover rounded mb-2"
                />
                <h4 className="font-medium text-sm">{item.name}</h4>
              </div>
            ))}
          </div>
        </Card>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-medium text-purple-800 mb-2">Why This Works</h4>
          <p className="text-sm text-purple-700">
            The burgundy velvet blazer is the star piece - luxurious and eye-catching.
            Paired with classic black and white, it creates sophisticated drama.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onTryAnother}>
            <Heart className="mr-2 h-4 w-4" />
            Try Another
          </Button>
          <Button onClick={onViewGuide} className="bg-purple-600 hover:bg-purple-700">
            Style Guide
          </Button>
        </div>
      </div>
    </div>
  );
}