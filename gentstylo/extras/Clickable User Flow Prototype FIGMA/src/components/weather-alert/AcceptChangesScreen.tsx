import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { CheckCircle, Calendar, Clock } from "lucide-react";

interface AcceptChangesScreenProps {
  onBackToMenu: () => void;
  onOpenPlanner: () => void;
}

export function AcceptChangesScreen({ onBackToMenu, onOpenPlanner }: AcceptChangesScreenProps) {
  const updatedOutfit = [
    { name: "Wool Coat", image: "https://images.unsplash.com/photo-1706001736137-40f564a7702f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29sJTIwY29hdCUyMG1lbnMlMjB3aW50ZXJ8ZW58MXx8fHwxNzU4NzAwMjM2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Wool Scarf", image: "https://images.unsplash.com/photo-1572371179162-9c0141483610?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29sJTIwc2NhcmYlMjBtZW5zfGVufDF8fHx8MTc1ODcwMDIzOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Cotton Shirt", image: "https://images.unsplash.com/photo-1628263516427-a82107586790?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGRyZXNzJTIwc2hpcnR8ZW58MXx8fHwxNzU4NTk1MTIxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Dark Jeans", image: "https://images.unsplash.com/photo-1639949141928-66c8112fe6fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwamVhbnMlMjBtZW5zfGVufDF8fHx8MTc1ODcwMDAxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { name: "Leather Boots", image: "https://images.unsplash.com/photo-1559826884-dbcc4a21caed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm93biUyMGNodWtrYSUyMGJvb3RzfGVufDF8fHx8MTc1ODcwMDA0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-center p-4 border-b bg-green-50">
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <h1 className="text-lg font-medium">Outfit Updated!</h1>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="text-center space-y-2">
          <h2 className="text-xl">You're All Set!</h2>
          <p className="text-muted-foreground">
            Your outfit has been updated for today's weather
          </p>
        </div>

        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-800">Smart Weather Protection</h3>
              <p className="text-sm text-green-700">Perfect for -1°C with light snow</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            {updatedOutfit.slice(0, 3).map((item, index) => (
              <div key={index} className="text-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-20 object-cover rounded mb-1"
                />
                <p className="text-xs font-medium">{item.name}</p>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {updatedOutfit.slice(3).map((item, index) => (
              <div key={index + 3} className="text-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-16 object-cover rounded mb-1"
                />
                <p className="text-xs">{item.name}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Preparation Checklist</h4>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Wool coat is clean and ready</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Scarf located in closet</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Boots are waterproofed</span>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Weather Forecast</h4>
            <div className="flex justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Today: -1°C to 3°C</span>
              </div>
              <Badge variant="secondary">Light Snow</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Temperature will rise throughout the day. You can remove the scarf by afternoon.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onOpenPlanner}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>View Week</span>
          </Button>
          <Button
            onClick={onBackToMenu}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Done
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          We'll alert you again if weather changes significantly
        </div>
      </div>
    </div>
  );
}