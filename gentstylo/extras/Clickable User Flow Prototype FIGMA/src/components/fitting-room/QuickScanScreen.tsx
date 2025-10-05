import React, { useState } from "react";
import { Camera, Upload, Shirt } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface QuickScanScreenProps {
  onItemScanned: (item: any) => void;
  onBack: () => void;
}

export function QuickScanScreen({ onItemScanned, onBack }: QuickScanScreenProps) {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    // Simulate scanning delay
    setTimeout(() => {
      onItemScanned();
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <h1 className="text-lg font-medium">Fitting Room Assistant</h1>
        <div className="w-12" />
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div className="text-center space-y-2">
          <Shirt className="h-16 w-16 mx-auto text-primary" />
          <h2 className="text-xl">Check in Store</h2>
          <p className="text-muted-foreground">
            Scan an item you're trying on to see how it matches with your wardrobe
          </p>
        </div>

        {isScanning ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-64 h-64 bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-primary animate-pulse">
              <Camera className="h-12 w-12 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium">Scanning item...</p>
              <p className="text-sm text-muted-foreground">Please hold still</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="p-6">
              <Button
                onClick={handleScan}
                className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Camera className="mr-2 h-5 w-5" />
                Scan Item on Hanger
              </Button>
            </Card>

            <Card className="p-6">
              <Button
                onClick={handleScan}
                variant="outline"
                className="w-full h-16"
              >
                <Camera className="mr-2 h-5 w-5" />
                Take Mirror Selfie
              </Button>
            </Card>

            <Card className="p-6">
              <Button
                onClick={handleScan}
                variant="outline"
                className="w-full h-16"
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload Photo
              </Button>
            </Card>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Pro Tip</h4>
          <p className="text-sm text-blue-700">
            For best results, ensure good lighting and capture the full garment. 
            Our AI can recognize items even on hangers!
          </p>
        </div>
      </div>
    </div>
  );
}