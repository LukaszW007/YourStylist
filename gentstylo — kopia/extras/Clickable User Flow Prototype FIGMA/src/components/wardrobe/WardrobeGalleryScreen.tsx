import { Filter, Grid, List } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Header } from "../Header";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useState } from "react";

interface WardrobeGalleryScreenProps {
  onItemClick: (item: any) => void;
  onBack: () => void;
}

const filterCategories = ["All", "Tops", "Bottoms", "Shoes", "Outerwear", "Accessories"];
const filterColors = ["All", "Black", "White", "Blue", "Gray", "Brown"];
const filterSeasons = ["All", "Spring", "Summer", "Fall", "Winter"];
const filterBrands = ["All", "Uniqlo", "Zara", "H&M", "Hugo Boss"];

const wardrobeItems = [
  {
    id: 1,
    name: "Navy Wool Blazer",
    category: "Outerwear",
    color: "Blue",
    season: "Fall",
    brand: "Hugo Boss",
    image: "https://images.unsplash.com/photo-1626872640220-e5f4454198b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3dlYXJ8ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    lastWorn: "2 days ago"
  },
  {
    id: 2,
    name: "White Oxford Shirt",
    category: "Tops",
    color: "White",
    season: "All",
    brand: "Uniqlo",
    image: "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHNoaXJ0JTIwb3V0Zml0fGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    lastWorn: "1 week ago"
  },
  {
    id: 3,
    name: "Dark Wash Jeans",
    category: "Bottoms",
    color: "Blue",
    season: "All",
    brand: "Zara",
    image: "https://images.unsplash.com/photo-1756009531697-51da316bfa3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWlnZSUyMGNoaW5vcyUyMHBhbnRzfGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    lastWorn: "3 days ago"
  },
  {
    id: 4,
    name: "Brown Leather Boots",
    category: "Shoes", 
    color: "Brown",
    season: "Fall",
    brand: "H&M",
    image: "https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NTk5NDI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    lastWorn: "1 week ago"
  },
  {
    id: 5,
    name: "Gray Wool Sweater",
    category: "Tops",
    color: "Gray",
    season: "Winter",
    brand: "Uniqlo",
    image: "https://images.unsplash.com/photo-1693901257178-b5fcb8f036a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NjkxMjQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    lastWorn: "2 weeks ago"
  },
  {
    id: 6,
    name: "Black Dress Shoes",
    category: "Shoes",
    color: "Black",
    season: "All",
    brand: "Hugo Boss",
    image: "https://images.unsplash.com/photo-1576792741377-eb0f4f6d1a47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NjM2MDk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    lastWorn: "1 month ago"
  }
];

export function WardrobeGalleryScreen({ onItemClick, onBack }: WardrobeGalleryScreenProps) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [filterType, setFilterType] = useState<"category" | "color" | "season" | "brand">("category");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const getFilterOptions = () => {
    switch (filterType) {
      case "category": return filterCategories;
      case "color": return filterColors;
      case "season": return filterSeasons;
      case "brand": return filterBrands;
    }
  };

  const filteredItems = wardrobeItems.filter(item => {
    if (activeFilter === "All") return true;
    switch (filterType) {
      case "category": return item.category === activeFilter;
      case "color": return item.color === activeFilter;
      case "season": return item.season === activeFilter || item.season === "All";
      case "brand": return item.brand === activeFilter;
      default: return true;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header title="My Wardrobe" onBack={onBack} />
      
      <div className="p-6 space-y-6">
        {/* Filter Controls */}
        <div className="space-y-4">
          {/* Filter Type Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["category", "color", "season", "brand"].map((type) => (
              <Button
                key={type}
                variant={filterType === type ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilterType(type as any);
                  setActiveFilter("All");
                }}
                className="capitalize whitespace-nowrap"
              >
                {type}
              </Button>
            ))}
          </div>

          {/* Filter Options */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {getFilterOptions().map((option) => (
              <Badge
                key={option}
                variant={activeFilter === option ? "default" : "outline"}
                className="cursor-pointer px-3 py-2 whitespace-nowrap"
                onClick={() => setActiveFilter(option)}
              >
                {option}
              </Badge>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} items
          </p>
          <div className="flex gap-1">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Items Gallery */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <Card 
                key={item.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onItemClick(item)}
              >
                <div className="aspect-square relative">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="text-xs bg-black/70 text-white">
                      {item.category}
                    </Badge>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm mb-1 line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.brand}</p>
                  <p className="text-xs text-muted-foreground mt-1">Last worn: {item.lastWorn}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <Card 
                key={item.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onItemClick(item)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm mb-1">{item.name}</h3>
                    <div className="flex gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      <Badge variant="outline" className="text-xs">{item.color}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.brand} • Last worn: {item.lastWorn}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}