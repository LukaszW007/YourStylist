import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface ReplacementScreenProps {
  unavailableItem: string;
  onBackToChecklist: () => void;
}

export function ReplacementScreen({ unavailableItem, onBackToChecklist }: ReplacementScreenProps) {
  const alternatives = [
    "Navy Polo Shirt",
    "Light Blue Oxford",
    "Casual Button-Down"
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-center p-4 border-b">
        <h1 className="text-lg font-medium">Find Replacement</h1>
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl">Replace {unavailableItem}</h2>
          <p className="text-muted-foreground">Here are some alternatives from your wardrobe</p>
        </div>

        <div className="space-y-3">
          {alternatives.map(alt => (
            <Card key={alt} className="p-4">
              <h4 className="font-medium">{alt}</h4>
              <Button className="mt-2 w-full" onClick={onBackToChecklist}>
                Use This Instead
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}