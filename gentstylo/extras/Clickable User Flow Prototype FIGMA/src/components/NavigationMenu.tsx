import { Camera, Sun, Target, Search, Calendar, Luggage, Heart, Shirt, BarChart3, Trophy, Bookmark, Monitor, Image, Sparkles, ShoppingBag, CloudRain, CheckSquare, Zap, GraduationCap } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { DarkModeToggle } from "./DarkModeToggle";

interface NavigationMenuProps {
  onSelectPrototype: (prototype: string) => void;
}

const prototypes = [
  {
    id: 'scanner',
    name: 'AI Closet Scanner',
    description: 'Instantly add multiple items of clothing from a single photo',
    icon: Camera,
    color: 'bg-blue-50 text-blue-600'
  },
  {
    id: 'outfit',
    name: "Today's Outfit",
    description: 'Get personalized outfit suggestions for your day',
    icon: Sun,
    color: 'bg-yellow-50 text-yellow-600'
  },
  {
    id: 'capsule',
    name: 'Capsule Wardrobe',
    description: 'Build your ideal wardrobe with guided style development',
    icon: Target,
    color: 'bg-green-50 text-green-600'
  },
  {
    id: 'shopping',
    name: 'AI Shopping Assistant',
    description: 'Find the perfect items with intelligent product curation',
    icon: Search,
    color: 'bg-purple-50 text-purple-600'
  },
  {
    id: 'occasion',
    name: 'Special Occasion Outfits',
    description: 'Perfect looks for weddings, interviews, and special events',
    icon: Heart,
    color: 'bg-pink-50 text-pink-600'
  },
  {
    id: 'planner',
    name: 'Weekly Outfit Planner',
    description: 'Plan your outfits in advance and never worry about what to wear',
    icon: Calendar,
    color: 'bg-indigo-50 text-indigo-600'
  },
  {
    id: 'packing',
    name: 'Pack My Suitcase',
    description: 'Smart packing lists that maximize outfit combinations',
    icon: Luggage,
    color: 'bg-teal-50 text-teal-600'
  },
  {
    id: 'wardrobe',
    name: 'My Wardrobe',
    description: 'Browse, filter, and manage your clothing collection',
    icon: Shirt,
    color: 'bg-gray-50 text-gray-600'
  },
  {
    id: 'stats',
    name: 'Wardrobe Statistics',
    description: 'Discover your style patterns and optimize your wardrobe',
    icon: BarChart3,
    color: 'bg-orange-50 text-orange-600'
  },
  {
    id: 'challenge',
    name: 'Style Challenge',
    description: 'Weekly challenges to experiment with new looks',
    icon: Trophy,
    color: 'bg-amber-50 text-amber-600'
  },
  {
    id: 'inspiration',
    name: 'Style Inspiration',
    description: 'Curated lookbooks and personal moodboards',
    icon: Bookmark,
    color: 'bg-rose-50 text-rose-600'
  },
  {
    id: 'fitting',
    name: 'Virtual Fitting Room',
    description: 'Preview how new items work with your existing wardrobe',
    icon: Monitor,
    color: 'bg-cyan-50 text-cyan-600'
  },
  {
    id: 'photo-creator',
    name: 'Outfit Creator from Photo',
    description: 'Upload inspiration and get AI-matched outfits from your wardrobe',
    icon: Image,
    color: 'bg-violet-50 text-violet-600'
  },
  {
    id: 'complete-outfit',
    name: 'Complete My Outfit',
    description: 'Select 1-2 items and get complementary suggestions',
    icon: Sparkles,
    color: 'bg-emerald-50 text-emerald-600'
  },
  {
    id: 'fitting-room',
    name: 'Fitting Room Assistant',
    description: 'Scan items in-store to see wardrobe compatibility',
    icon: ShoppingBag,
    color: 'bg-orange-50 text-orange-600'
  },
  {
    id: 'weather-alert',
    name: 'Smart Weather Alert',
    description: 'Proactive outfit modifications based on weather changes',
    icon: CloudRain,
    color: 'bg-sky-50 text-sky-600'
  },
  {
    id: 'outfit-readiness',
    name: 'Outfit Readiness Check',
    description: 'Weekly checklist for planned outfits',
    icon: CheckSquare,
    color: 'bg-lime-50 text-lime-600'
  },
  {
    id: 'impression',
    name: 'Look Today: Make an Impression',
    description: 'Bold styling suggestions for special confidence days',
    icon: Zap,
    color: 'bg-fuchsia-50 text-fuchsia-600'
  },
  {
    id: 'style-academy',
    name: 'Style Academy',
    description: 'Educational content about fashion principles and history',
    icon: GraduationCap,
    color: 'bg-indigo-50 text-indigo-600'
  }
];

export function NavigationMenu({ onSelectPrototype }: NavigationMenuProps) {
  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-4">
          <div className="flex items-center justify-between mb-6">
            <div className="w-9"></div>
            <h1 className="text-brand text-3xl text-primary">MERRIWEATHER</h1>
            <DarkModeToggle />
          </div>
          <p className="text-muted-foreground text-lg font-medium">
            Choose a prototype to explore
          </p>
        </div>

        {/* Prototype Cards */}
        <div className="space-y-3">
          {prototypes.map((prototype) => {
            const IconComponent = prototype.icon;
            return (
              <Card 
                key={prototype.id}
                className="p-5 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.01] border-border bg-card/95 backdrop-blur-sm"
                onClick={() => onSelectPrototype(prototype.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{prototype.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {prototype.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}