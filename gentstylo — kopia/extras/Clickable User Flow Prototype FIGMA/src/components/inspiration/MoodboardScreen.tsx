import { Heart, Trash2, RefreshCw, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useState } from "react";

interface MoodboardScreenProps {
  onRecreateFromMoodboard: (look: any) => void;
  onBackToLookbook: () => void;
}

const initialSavedLooks = [
  {
    id: 1,
    title: "Smart Casual Office",
    style: "Professional",
    image: "https://images.unsplash.com/photo-1758518730264-9235a1e5416b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb2IlMjBpbnRlcnZpZXclMjBvdXRmaXR8ZW58MXx8fHwxNzU4Njk4MDQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    savedDate: "2 days ago",
    matchScore: 95
  },
  {
    id: 2,
    title: "Modern Minimalist",
    style: "Minimalist",
    image: "https://images.unsplash.com/photo-1693901257178-b5fcb8f036a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NjkxMjQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    savedDate: "1 week ago",
    matchScore: 92
  },
  {
    id: 3,
    title: "Date Night Ready",
    style: "Smart Casual",
    image: "https://images.unsplash.com/photo-1626872640220-e5f4454198b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3dlYXJ8ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    savedDate: "1 week ago",
    matchScore: 90
  },
  {
    id: 4,
    title: "Sharp & Polished",
    style: "Formal",
    image: "https://images.unsplash.com/photo-1742631193849-acc045ea5890?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwZWxlZ2FudCUyMGZhc2hpb258ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    savedDate: "2 weeks ago",
    matchScore: 87
  }
];

export function MoodboardScreen({ onRecreateFromMoodboard, onBackToLookbook }: MoodboardScreenProps) {
  const [savedLooks, setSavedLooks] = useState(initialSavedLooks);

  const handleRemoveLook = (lookId: number) => {
    setSavedLooks(prev => prev.filter(look => look.id !== lookId));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-6 border-b">
        <Button variant="ghost" onClick={onBackToLookbook} className="mb-3">
          ← Back to lookbook
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl mb-1">My Moodboard</h1>
            <p className="text-sm text-muted-foreground">
              Your personal collection of style inspiration
            </p>
          </div>
          <Badge variant="outline">
            {savedLooks.length} saved
          </Badge>
        </div>
      </div>

      <div className="p-6">
        {savedLooks.length > 0 ? (
          <div className="space-y-6">
            {/* Moodboard Grid */}
            <div className="grid grid-cols-2 gap-4">
              {savedLooks.map((look) => (
                <Card key={look.id} className="overflow-hidden">
                  {/* Look Image */}
                  <div className="aspect-[3/4] relative">
                    <ImageWithFallback
                      src={look.image}
                      alt={look.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 rounded-full p-0 bg-white/90 hover:bg-white"
                        onClick={() => handleRemoveLook(look.id)}
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-green-600 text-white text-xs">
                        {look.matchScore}%
                      </Badge>
                    </div>
                  </div>

                  {/* Look Details */}
                  <div className="p-3 space-y-2">
                    <h3 className="text-sm line-clamp-1">{look.title}</h3>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {look.style}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {look.savedDate}
                      </span>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => onRecreateFromMoodboard(look)}
                    >
                      <RefreshCw className="w-3 h-3 mr-2" />
                      Recreate
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onBackToLookbook}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add More Inspiration
              </Button>
            </div>

            {/* Style Analysis */}
            <Card className="p-4 bg-blue-50">
              <h3 className="text-base mb-2">Your Style Preferences</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Professional</span>
                  <span className="text-sm">50%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Smart Casual</span>
                  <span className="text-sm">25%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Minimalist</span>
                  <span className="text-sm">25%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Based on your saved looks, you prefer clean, professional styles with modern touches.
              </p>
            </Card>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12 space-y-6">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl">Your Moodboard is Empty</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start building your personal style collection by saving looks from the inspiration gallery.
              </p>
            </div>

            <Button onClick={onBackToLookbook}>
              <Plus className="w-4 h-4 mr-2" />
              Browse Inspiration
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}