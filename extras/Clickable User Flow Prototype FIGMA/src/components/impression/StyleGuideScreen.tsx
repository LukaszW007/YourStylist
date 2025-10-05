import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Quote, Crown, ArrowUp } from "lucide-react";

interface StyleGuideScreenProps {
  onBackToMenu: () => void;
  onSaveOutfit: () => void;
}

export function StyleGuideScreen({ onBackToMenu, onSaveOutfit }: StyleGuideScreenProps) {
  const tips = [
    "Stand tall with shoulders back - confidence starts with posture",
    "The velvet texture catches light beautifully - embrace the spotlight",
    "Keep accessories minimal - let the blazer be the statement piece",
    "A slight smile goes a long way - you're wearing something special"
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" onClick={onBackToMenu}>← Back</Button>
        <h1 className="text-lg font-medium">Style Guide</h1>
        <div className="w-12" />
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="text-center space-y-2">
          <Crown className="h-8 w-8 mx-auto text-purple-600" />
          <h2 className="text-xl">Virtual Stylist Guide</h2>
          <Badge variant="secondary">Confidence Building</Badge>
        </div>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-start space-x-3">
            <Quote className="h-6 w-6 text-purple-600 mt-1" />
            <div>
              <p className="font-medium text-purple-800 mb-1">Personal Stylist Says:</p>
              <p className="text-sm text-purple-700">
                "This combination is bold, yet incredibly stylish. The key is the contrast 
                of textures between your velvet blazer and crisp cotton shirt. This look 
                communicates confidence and sophistication."
              </p>
            </div>
          </div>
        </Card>

        <div>
          <h3 className="font-medium mb-3">Confidence Tips</h3>
          <div className="space-y-3">
            {tips.map((tip, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-start space-x-3">
                  <ArrowUp className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm">{tip}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-2">Remember</h4>
          <p className="text-sm text-yellow-700">
            The best accessory is confidence. You chose to stand out today - own it!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onSaveOutfit}>Save Look</Button>
          <Button onClick={onBackToMenu} className="bg-purple-600 hover:bg-purple-700">Done</Button>
        </div>
      </div>
    </div>
  );
}