import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { CheckCircle, Loader2, ArrowLeft } from "lucide-react";

interface AIAnalysisScreenProps {
  uploadedPhoto: any;
  onAnalysisComplete: (outfits: any[]) => void;
  onBack: () => void;
}

export function AIAnalysisScreen({ uploadedPhoto, onAnalysisComplete, onBack }: AIAnalysisScreenProps) {
  const [analyzing, setAnalyzing] = useState(true);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    // Simulate AI analysis
    const timer = setTimeout(() => {
      setAnalyzing(false);
      setTags([
        "beige trench coat",
        "white button-up shirt",
        "dark wash jeans",
        "brown leather boots",
        "black leather handbag",
        "gold watch",
        "minimalist style"
      ]);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const inspirationImage = "https://images.unsplash.com/photo-1658874761235-8d56cbd5da2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmfHwxNzU4Njk5OTkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-3">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-medium">AI Analysis</h1>
      </div>

      <div className="flex-1 p-6 space-y-6">
        <Card className="p-4">
          <img
            src={inspirationImage}
            alt="Inspiration outfit"
            className="w-full h-64 object-cover rounded-lg"
          />
        </Card>

        {analyzing ? (
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="font-medium">Analyzing outfit...</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Identifying key pieces and style elements
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Analysis Complete!</span>
            </div>

            <div>
              <h3 className="font-medium mb-3">Key Elements Identified:</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="capitalize">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Style Analysis</h4>
              <p className="text-sm text-muted-foreground">
                This outfit features a classic casual-professional look with neutral tones. 
                The combination emphasizes comfort and sophistication through layering and 
                high-quality basics.
              </p>
            </div>

            <Button 
              onClick={() => onAnalysisComplete([])}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              See Your Version
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}