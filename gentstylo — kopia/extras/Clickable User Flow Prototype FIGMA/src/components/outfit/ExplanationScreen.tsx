import { Check, Thermometer } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface ExplanationScreenProps {
  onDone: () => void;
}

const alternatives = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1626872640220-e5f4454198b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3dlYXJ8ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    name: "Gray Blazer",
    description: "Add to make it more formal"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1618453292459-53424b66bb6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHQtc2hpcnQlMjBjbG90aGluZ3xlbnwxfHx8fDE3NTg2OTA5NzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    name: "Leather Jacket",
    description: "Add to add character"
  }
];

export function ExplanationScreen({ onDone }: ExplanationScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 pt-3 pb-6">
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-foreground rounded-full"></div>
          <div className="w-1 h-1 bg-foreground rounded-full"></div>
          <div className="w-1 h-1 bg-foreground rounded-full"></div>
          <div className="w-1 h-1 bg-foreground rounded-full"></div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 border border-foreground rounded-sm">
            <div className="w-3 h-1 bg-foreground rounded-sm m-0.5"></div>
          </div>
          <Thermometer className="w-4 h-4" />
          <div className="w-6 h-3 border border-foreground rounded">
            <div className="w-4 h-1 bg-foreground rounded m-0.5"></div>
          </div>
        </div>
      </div>

      {/* Success Header */}
      <div className="px-6 mb-8">
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-primary">Stylizacja zaakceptowana</h2>
              <p className="text-sm text-muted-foreground">Smart Casual • Biała koszula • Granatowe spodnie</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-6 space-y-8">
        {/* Why it works section */}
        <div className="space-y-4">
          <h2 className="text-xl font-brand text-primary">DLACZEGO TO DZIAŁA?</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card">
              <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm">Spójne kolory: Biel i granat to klasyczne, bezpieczne połączenie</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card">
              <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm">Komfort i styl: Zestaw jest wygodny, a jednocześnie profesjonalny</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card">
              <Thermometer className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm">Idealne na pogodę: Lekkie materiały sprawdzą się przy 18°C</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Change section */}
        <div className="space-y-4">
          <h2 className="text-xl font-brand text-primary">SZYBKA ZMIANA</h2>
          <p className="text-muted-foreground text-sm">Chcesz dodać charakteru? Zamień jeden element:</p>
          
          <div className="grid grid-cols-2 gap-4">
            {alternatives.map((item) => (
              <Card key={item.id} className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300 border-border bg-card/95">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-medium mb-1">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Done Button */}
        <Button 
          onClick={onDone}
          className="w-full h-12 bg-primary hover:bg-primary/90 rounded-lg"
          size="lg"
        >
          Gotowe, wychodzę!
        </Button>
      </div>
    </div>
  );
}