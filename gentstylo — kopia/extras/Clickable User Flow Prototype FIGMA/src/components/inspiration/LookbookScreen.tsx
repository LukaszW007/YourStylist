import { Heart, Bookmark, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Header } from "../Header";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useState } from "react";

interface LookbookScreenProps {
  onSaveToMoodboard: (look: any) => void;
  onViewMoodboard: () => void;
  onRecreate: (look: any) => void;
  onBack: () => void;
}

const curatedLooks = [
  {
    id: 1,
    title: "Smart Casual Office",
    style: "Professional",
    season: "Fall",
    image: "https://images.unsplash.com/photo-1758518730264-9235a1e5416b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb2IlMjBpbnRlcnZpZXclMjBvdXRmaXR8ZW58MXx8fHwxNzU4Njk4MDQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Perfect balance of professionalism and comfort",
    tags: ["blazer", "chinos", "dress shoes"],
    matchScore: 95
  },
  {
    id: 2,
    title: "Weekend Explorer",
    style: "Casual",
    season: "Fall",
    image: "https://images.unsplash.com/photo-1650118653814-482455dd4263?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRlJTIwbmlnaHQlMjBvdXRmaXR8ZW58MXx8fHwxNzU4Njk4MDQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Effortless style for your days off",
    tags: ["sweater", "jeans", "sneakers"],
    matchScore: 88
  },
  {
    id: 3,
    title: "Modern Minimalist",
    style: "Minimalist",
    season: "All Season",
    image: "https://images.unsplash.com/photo-1693901257178-b5fcb8f036a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NjkxMjQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Clean lines and neutral tones",
    tags: ["t-shirt", "trousers", "minimal"],
    matchScore: 92
  },
  {
    id: 4,
    title: "Date Night Ready",
    style: "Smart Casual",
    season: "Fall",
    image: "https://images.unsplash.com/photo-1626872640220-e5f4454198b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3dlYXJ8ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Sophisticated yet approachable",
    tags: ["blazer", "shirt", "dark jeans"],
    matchScore: 90
  },
  {
    id: 5,
    title: "Cozy Layers",
    style: "Casual",
    season: "Winter",
    image: "https://images.unsplash.com/photo-1693901257178-b5fcb8f036a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NjkxMjQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Warmth meets style",
    tags: ["sweater", "layers", "boots"],
    matchScore: 85
  },
  {
    id: 6,
    title: "Sharp & Polished",
    style: "Formal",
    season: "All Season",
    image: "https://images.unsplash.com/photo-1742631193849-acc045ea5890?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwZWxlZ2FudCUyMGZhc2hpb258ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    description: "Classic elegance for special occasions",
    tags: ["suit", "dress shirt", "tie"],
    matchScore: 87
  }
];

export function LookbookScreen({ onSaveToMoodboard, onViewMoodboard, onRecreate, onBack }: LookbookScreenProps) {
  const [savedLooks, setSavedLooks] = useState<number[]>([]);
  const [currentFilter, setCurrentFilter] = useState("All");

  const filters = ["All", "Professional", "Casual", "Minimalist", "Smart Casual", "Formal"];

  const filteredLooks = curatedLooks.filter(look => 
    currentFilter === "All" || look.style === currentFilter
  );

  const handleSaveLook = (look: any) => {
    setSavedLooks(prev => [...prev, look.id]);
    onSaveToMoodboard(look);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Style Inspiration" onBack={onBack} />
      
      <div className="p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl mb-1">Curated Lookbook</h2>
            <p className="text-sm text-muted-foreground">
              Fresh inspiration tailored to your style
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onViewMoodboard}>
            <Bookmark className="w-4 h-4 mr-2" />
            My Board
          </Button>
        </div>

        {/* Style Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={currentFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentFilter(filter)}
              className="whitespace-nowrap"
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Looks Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredLooks.map((look) => (
            <Card key={look.id} className="overflow-hidden">
              {/* Look Image */}
              <div className="aspect-[3/4] relative">
                <ImageWithFallback
                  src={look.image}
                  alt={look.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <Button
                    size="sm"
                    variant={savedLooks.includes(look.id) ? "default" : "outline"}
                    className="w-10 h-10 rounded-full p-0 bg-white/90 hover:bg-white"
                    onClick={() => handleSaveLook(look)}
                  >
                    <Heart className={`w-4 h-4 ${savedLooks.includes(look.id) ? 'fill-current text-red-500' : 'text-gray-600'}`} />
                  </Button>
                </div>
                <div className="absolute top-3 left-3">
                  <Badge className="bg-green-600 text-white">
                    {look.matchScore}% match
                  </Badge>
                </div>
              </div>

              {/* Look Details */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-base mb-1">{look.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {look.description}
                  </p>
                  <div className="flex gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">{look.style}</Badge>
                    <Badge variant="outline" className="text-xs">{look.season}</Badge>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {look.tags.map((tag, index) => (
                    <span key={index} className="text-xs bg-muted px-2 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => onRecreate(look)}
                  >
                    <RefreshCw className="w-3 h-3 mr-2" />
                    Recreate
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleSaveLook(look)}
                    disabled={savedLooks.includes(look.id)}
                  >
                    <Bookmark className="w-3 h-3 mr-2" />
                    {savedLooks.includes(look.id) ? 'Saved' : 'Save'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Refresh Button */}
        <Button variant="outline" className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Inspiration
        </Button>
      </div>
    </div>
  );
}