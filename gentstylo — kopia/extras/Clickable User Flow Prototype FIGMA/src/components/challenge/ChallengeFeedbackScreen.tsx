import { Trophy, Star, Camera, Share } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

interface ChallengeFeedbackScreenProps {
  challengeCompleted: boolean;
  onBackToMenu: () => void;
}

export function ChallengeFeedbackScreen({ challengeCompleted, onBackToMenu }: ChallengeFeedbackScreenProps) {
  if (challengeCompleted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Success Animation */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-green-600" />
          </div>

          {/* Success Message */}
          <div className="space-y-3">
            <h1 className="text-2xl">Challenge Completed! 🎉</h1>
            <p className="text-muted-foreground">
              Amazing work! You've successfully completed the Mix Textures Challenge.
            </p>
          </div>

          {/* Achievement Badge */}
          <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <div className="text-center space-y-3">
              <div className="text-4xl">🏆</div>
              <h3 className="text-lg">New Badge Earned!</h3>
              <Badge className="bg-yellow-600 text-white px-4 py-2">
                Texture Master
              </Badge>
              <p className="text-sm text-muted-foreground">
                You've mastered the art of mixing textures in your outfits
              </p>
            </div>
          </Card>

          {/* Stats Update */}
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl text-green-600">4</div>
                <div className="text-xs text-muted-foreground">Challenges Completed</div>
              </div>
              <div>
                <div className="text-2xl text-blue-600">3</div>
                <div className="text-xs text-muted-foreground">Current Streak</div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button className="w-full" variant="outline">
              <Camera className="w-4 h-4 mr-2" />
              Share Your Achievement
            </Button>
            
            <Button className="w-full" variant="outline">
              <Star className="w-4 h-4 mr-2" />
              Rate This Challenge
            </Button>
            
            <Button onClick={onBackToMenu} className="w-full">
              Back to Menu
            </Button>
          </div>

          {/* Next Challenge Preview */}
          <Card className="p-4 bg-purple-50 border-purple-200">
            <p className="text-sm text-center">
              Next week: "Vintage Vibes Challenge" 
              <br />
              Get ready to style modern pieces with retro flair!
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Skipped challenge
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Skip Message */}
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">⏸️</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl">Challenge Skipped</h1>
          <p className="text-muted-foreground">
            No worries! Not every challenge is for everyone. There will be more opportunities to experiment.
          </p>
        </div>

        {/* Encouragement */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-base mb-2">Don't Give Up!</h3>
          <p className="text-sm text-muted-foreground">
            Style challenges are about pushing your comfort zone, but it's okay to take breaks. 
            Come back when you're ready for the next one!
          </p>
        </Card>

        {/* Next Challenge Preview */}
        <Card className="p-4">
          <h4 className="text-sm mb-2">Coming Next Week</h4>
          <p className="text-sm text-muted-foreground mb-3">
            "Vintage Vibes Challenge" - Maybe this one will be more your style?
          </p>
          <Button variant="outline" size="sm" className="w-full">
            Get Preview
          </Button>
        </Card>

        <Button onClick={onBackToMenu} className="w-full">
          Back to Menu
        </Button>
      </div>
    </div>
  );
}