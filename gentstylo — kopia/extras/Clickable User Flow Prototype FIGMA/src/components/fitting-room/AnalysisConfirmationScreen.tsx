import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { CheckCircle, Loader2, Edit3 } from "lucide-react";

interface AnalysisConfirmationScreenProps {
  onConfirmItem: (item: any) => void;
}

export function AnalysisConfirmationScreen({ onConfirmItem }: AnalysisConfirmationScreenProps) {
  const [analyzing, setAnalyzing] = useState(true);
  const [detectedItem, setDetectedItem] = useState<any>(null);

  useEffect(() => {
    // Simulate AI analysis
    const timer = setTimeout(() => {
      setAnalyzing(false);
      setDetectedItem({
        name: "Green Bomber Jacket",
        color: "Forest Green",
        material: "Cotton blend",
        style: "Classic bomber",
        price: "$89",
        brand: "Modern Essentials",
        image: "https://images.unsplash.com/photo-1629353689974-af4d5c70440f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGJvbWJlciUyMGphY2tldCUyMG1lbnN8ZW58MXx8fHwxNzU4NzAwMTM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleConfirm = () => {
    onConfirmItem(detectedItem);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-center p-4 border-b">
        <h1 className="text-lg font-medium">Item Analysis</h1>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {analyzing ? (
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="font-medium">Analyzing item...</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Identifying style, color, and material
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Item Recognized!</span>
            </div>

            <Card className="p-4">
              <img
                src={detectedItem.image}
                alt={detectedItem.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-medium">{detectedItem.name}</h3>
                  <p className="text-muted-foreground">{detectedItem.brand}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Color</span>
                    <p className="font-medium">{detectedItem.color}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Style</span>
                    <p className="font-medium">{detectedItem.style}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Material</span>
                    <p className="font-medium">{detectedItem.material}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Price</span>
                    <p className="font-medium text-green-600">{detectedItem.price}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Casual</Badge>
                  <Badge variant="secondary">Versatile</Badge>
                  <Badge variant="secondary">Layering piece</Badge>
                </div>
              </div>
            </Card>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Is this correct? We'll use this information to find matching pieces 
                in your wardrobe.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Details</span>
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Looks Right</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}