import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Slider } from "../ui/slider";
import { useState } from "react";

interface SearchRefinementScreenProps {
  searchQuery: string;
  onShowRecommendations: (filters: any) => void;
}

const styleOptions = ["Minimalist", "Classic", "Vintage", "Modern", "Casual", "Formal"];
const featureOptions = ["Good Quality", "Polish Brand", "Made in Europe", "Sustainable", "Organic", "Eco-Friendly"];

export function SearchRefinementScreen({ searchQuery, onShowRecommendations }: SearchRefinementScreenProps) {
  const [priceRange, setPriceRange] = useState([50, 300]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handleShowRecommendations = () => {
    onShowRecommendations({
      query: searchQuery,
      priceRange,
      styles: selectedStyles,
      features: selectedFeatures
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-xl">Refine your search</h1>
        <p className="text-sm text-muted-foreground mt-1">Searching for: {searchQuery}</p>
      </div>

      <div className="p-6 space-y-8">
        {/* Price Range */}
        <div className="space-y-4">
          <h3 className="text-lg">Price Range</h3>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={500}
              min={10}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Style */}
        <div className="space-y-4">
          <h3 className="text-lg">Style</h3>
          <div className="flex flex-wrap gap-2">
            {styleOptions.map((style) => (
              <Badge
                key={style}
                variant={selectedStyles.includes(style) ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => toggleStyle(style)}
              >
                {style}
              </Badge>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h3 className="text-lg">Features</h3>
          <div className="flex flex-wrap gap-2">
            {featureOptions.map((feature) => (
              <Badge
                key={feature}
                variant={selectedFeatures.includes(feature) ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => toggleFeature(feature)}
              >
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        {/* Show Recommendations Button */}
        <Button 
          onClick={handleShowRecommendations}
          className="w-full h-12"
          size="lg"
        >
          Show Recommendations
        </Button>
      </div>
    </div>
  );
}