import { CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface ChallengeDetailsScreenProps {
  onTakeChallenge: () => void;
  onSkipChallenge: () => void;
  onBackToChallenge: () => void;
}

const challengeExamples = [
  {
    id: 1,
    title: "Smooth + Textured",
    description: "Cotton shirt with a chunky knit sweater",
    items: [
      { name: "Cotton Shirt", image: "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx3aGl0ZSUyMHNoaXJ0JTIwb3V0Zml0fGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
      { name: "Chunky Knit", image: "https://images.unsplash.com/photo-1693901257178-b5fcb8f036a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NjkxMjQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
    ]
  },
  {
    id: 2,
    title: "Sleek + Rough",
    description: "Leather jacket over a soft cashmere sweater",
    items: [
      { name: "Leather Jacket", image: "https://images.unsplash.com/photo-1626872640220-e5f4454198b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3dlYXJ8ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
      { name: "Cashmere Sweater", image: "https://images.unsplash.com/photo-1693901257178-b5fcb8f036a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx8fHx8fHwxNzU4NjkxMjQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
    ]
  },
  {
    id: 3,
    title: "Structured + Flowy",
    description: "Tailored blazer with soft, flowing fabric pants",
    items: [
      { name: "Wool Blazer", image: "https://images.unsplash.com/photo-1626872640220-e5f4454198b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3dlYXJ8ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
      { name: "Silk Pants", image: "https://images.unsplash.com/photo-1756009531697-51da316bfa3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxiZWlnZSUyMGNoaW5vcyUyMHBhbnRzfGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" }
    ]
  }
];

const tips = [
  "Start with neutral colors to focus on texture contrast",
  "Balance rough textures with smooth ones for visual interest",
  "Don't be afraid to mix formal and casual textures",
  "Use accessories to add extra texture layers"
];

export function ChallengeDetailsScreen({ onTakeChallenge, onSkipChallenge, onBackToChallenge }: ChallengeDetailsScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-6 border-b">
        <Button variant="ghost" onClick={onBackToChallenge} className="mb-3">
          ← Back to challenges
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl mb-1">Mix Textures Challenge</h1>
            <p className="text-sm text-muted-foreground">Week of Sept 24-30</p>
          </div>
          <Badge className="bg-purple-600 text-white">Medium</Badge>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Challenge Description */}
        <Card className="p-6">
          <h2 className="text-lg mb-3">The Challenge</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Step out of your comfort zone by combining different fabric textures in one outfit. 
            Mix smooth with rough, structured with flowy, or sleek with cozy to create visual interest and depth.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>📅 Duration: 7 days</span>
            <span>👥 1,247 participants</span>
            <span>🎯 Goal: 1 textured outfit</span>
          </div>
        </Card>

        {/* Example Outfits */}
        <div className="space-y-4">
          <h3 className="text-lg">Inspiration from Your Wardrobe</h3>
          <p className="text-sm text-muted-foreground">
            Here are some texture combinations you can create with items you already own:
          </p>
          
          {challengeExamples.map((example) => (
            <Card key={example.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {example.items.map((item, index) => (
                    <div key={index} className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm mb-1">{example.title}</h4>
                  <p className="text-xs text-muted-foreground">{example.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pro Tips */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg">Pro Tips</h3>
          </div>
          <ul className="space-y-2">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Challenge Actions */}
        <div className="space-y-3">
          <Button 
            onClick={onTakeChallenge}
            className="w-full h-12 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            I'll Take This Challenge!
          </Button>
          
          <Button 
            onClick={onSkipChallenge}
            variant="outline"
            className="w-full h-12"
          >
            <XCircle className="w-5 h-5 mr-2" />
            Skip This Week
          </Button>
        </div>

        {/* Motivation */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-center">
            💪 Remember: The goal isn't perfection, it's experimentation! 
            Have fun trying something new.
          </p>
        </Card>
      </div>
    </div>
  );
}