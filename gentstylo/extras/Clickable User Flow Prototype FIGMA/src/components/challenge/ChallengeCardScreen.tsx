import { Trophy, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Header } from "../Header";
import { Progress } from "../ui/progress";

interface ChallengeCardScreenProps {
  onViewChallenge: () => void;
  onBack: () => void;
}

const currentChallenge = {
  title: "Mix Textures Challenge",
  week: "Week of Sept 24-30",
  description: "Step out of your comfort zone by combining different fabric textures in one outfit.",
  difficulty: "Medium",
  participants: 1247,
  timeLeft: "5 days left"
};

const pastChallenges = [
  { title: "Monochrome Monday", completed: true, badge: "🏆" },
  { title: "Pattern Play", completed: false, badge: "⏰" },
  { title: "Color Pop Challenge", completed: true, badge: "⭐" },
  { title: "Minimalist Week", completed: true, badge: "🎯" }
];

const userStats = {
  completedChallenges: 3,
  totalChallenges: 4,
  currentStreak: 2,
  longestStreak: 3
};

const completionRate = (userStats.completedChallenges / userStats.totalChallenges) * 100;

export function ChallengeCardScreen({ onViewChallenge, onBack }: ChallengeCardScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header title="Style Challenge" onBack={onBack} />
      
      <div className="p-6 space-y-6">
        {/* Current Challenge Banner */}
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <Badge className="bg-purple-600 text-white">This Week</Badge>
            </div>
            <span className="text-xs text-muted-foreground">{currentChallenge.timeLeft}</span>
          </div>
          
          <h2 className="text-xl mb-2">{currentChallenge.title}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {currentChallenge.description}
          </p>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Difficulty: {currentChallenge.difficulty}</span>
              <span>{currentChallenge.participants} participating</span>
            </div>
          </div>
          
          <Button 
            onClick={onViewChallenge}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            View Challenge Details
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>

        {/* Your Progress */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg">Your Progress</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Challenge Completion Rate</span>
                <span className="text-sm">{Math.round(completionRate)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl mb-1">{userStats.completedChallenges}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl mb-1">{userStats.currentStreak}</div>
                <div className="text-xs text-muted-foreground">Current Streak</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Past Challenges */}
        <Card className="p-6">
          <h3 className="text-lg mb-4">Recent Challenges</h3>
          <div className="space-y-3">
            {pastChallenges.map((challenge, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{challenge.badge}</span>
                  <div>
                    <p className="text-sm">{challenge.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {challenge.completed ? "Completed" : "Skipped"}
                    </p>
                  </div>
                </div>
                {challenge.completed && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    ✓ Done
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Next Challenge Preview */}
        <Card className="p-6 bg-gray-50">
          <h3 className="text-lg mb-2">Coming Next Week</h3>
          <p className="text-sm text-muted-foreground mb-3">
            "Vintage Vibes" - Style modern pieces with a retro twist
          </p>
          <Badge variant="outline">Preview available Monday</Badge>
        </Card>
      </div>
    </div>
  );
}