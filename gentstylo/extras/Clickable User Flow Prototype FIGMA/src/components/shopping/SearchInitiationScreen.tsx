import { Search, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { Header } from "../Header";

interface SearchInitiationScreenProps {
  onSearchSubmit: (query: string) => void;
  onBack: () => void;
}

const missingItems = [
  "Navy Blazer",
  "Wool Sweater", 
  "Leather Boots",
  "White Oxford Shirt",
  "Cashmere Scarf"
];

export function SearchInitiationScreen({ onSearchSubmit, onBack }: SearchInitiationScreenProps) {
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
          <Search className="w-4 h-4" />
          <div className="w-6 h-3 border border-foreground rounded">
            <div className="w-4 h-1 bg-foreground rounded m-0.5"></div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-brand text-2xl text-primary mb-2">ASYSTENT ZAKUPÓW</h1>
        <p className="text-muted-foreground">Inteligentne rekomendacje</p>
      </div>
      
      <div className="px-6 space-y-8">
        {/* Search Question */}
        <div className="text-center space-y-4">
          <h2 className="text-xl font-brand text-primary">CZEGO SZUKASZ?</h2>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="np. białe skórzane sneakersy"
            className="pl-12 h-14 rounded-lg border-border bg-input-background"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                onSearchSubmit(e.currentTarget.value);
              }
            }}
          />
        </div>

        {/* Missing Items from Capsule */}
        <div className="space-y-4">
          <h3 className="text-lg">From your Capsule Wardrobe</h3>
          <p className="text-sm text-muted-foreground">Missing items that would complete your style</p>
          
          <div className="space-y-2">
            {missingItems.map((item, index) => (
              <Card 
                key={index}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onSearchSubmit(item)}
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>{item}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}