import { Camera, Shirt } from "lucide-react";
import { Button } from "./ui/button";

interface IntroScreenProps {
  onScanClick: () => void;
}

export function IntroScreen({ onScanClick }: IntroScreenProps) {
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
          <Camera className="w-4 h-4" />
          <div className="w-6 h-3 border border-foreground rounded">
            <div className="w-4 h-1 bg-foreground rounded m-0.5"></div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-brand text-2xl text-primary mb-2">SKANER SZAFY AI</h1>
        <p className="text-muted-foreground">Dodaj ubrania jednym zdjęciem</p>
      </div>
      
      <div className="flex flex-col items-center justify-center px-6 py-8">
        <div className="max-w-sm w-full text-center space-y-8">
          {/* Visual Icon */}
          <div className="relative mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <Camera className="w-8 h-8 text-primary" />
            <Shirt className="w-6 h-6 text-primary absolute -top-1 -right-1" />
          </div>

          {/* Headlines */}
          <div className="space-y-4">
            <h2 className="text-xl font-brand text-primary">DODAJ KILKA UBRAŃ NARAZ</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nasze AI rozpozna i skategoryzuje ubrania z jednego zdjęcia
            </p>
          </div>

          {/* Instructions */}
          <div className="text-left space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-card">
              <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                1
              </span>
              <p className="text-sm pt-1 leading-relaxed">
                Rozłóż do 5 elementów odzieży na kontrastującym tle (np. łóżku)
              </p>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-card">
              <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                2
              </span>
              <p className="text-sm pt-1 leading-relaxed">Upewnij się, że są dobrze oświetlone</p>
            </div>
          </div>

          {/* Scan Button */}
          <Button 
            onClick={onScanClick}
            className="w-full h-14 text-lg mt-8"
            size="lg"
          >
            Scan items
          </Button>
        </div>
      </div>
    </div>
  );
}