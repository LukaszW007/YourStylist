import React from "react";
import { Book, Clock, Star, ChevronRight, ArrowLeft, Trophy, Target } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

interface StyleAcademyScreenProps {
  onCategorySelect: (category: any) => void;
  onBack: () => void;
}

const categories = [
  {
    id: 'basics',
    title: 'Fashion Basics',
    description: 'Essential fashion principles and terminology',
    lessons: 8,
    duration: '45 min',
    level: 'Beginner',
    progress: 75,
    icon: '👗',
    color: 'bg-blue-50 text-blue-600',
    completed: 6
  },
  {
    id: 'color',
    title: 'Color Theory',
    description: 'Understanding color palettes and combinations',
    lessons: 6,
    duration: '30 min',
    level: 'Beginner',
    progress: 50,
    icon: '🎨',
    color: 'bg-pink-50 text-pink-600',
    completed: 3
  },
  {
    id: 'body-types',
    title: 'Body Types & Styling',
    description: 'Flattering cuts and silhouettes for every body',
    lessons: 10,
    duration: '60 min',
    level: 'Intermediate',
    progress: 20,
    icon: '✨',
    color: 'bg-purple-50 text-purple-600',
    completed: 2
  },
  {
    id: 'history',
    title: 'Fashion History',
    description: 'Evolution of style through the decades',
    lessons: 12,
    duration: '75 min',
    level: 'Advanced',
    progress: 0,
    icon: '📚',
    color: 'bg-amber-50 text-amber-600',
    completed: 0
  },
  {
    id: 'sustainable',
    title: 'Sustainable Fashion',
    description: 'Building an eco-conscious wardrobe',
    lessons: 7,
    duration: '40 min',
    level: 'Intermediate',
    progress: 85,
    icon: '🌱',
    color: 'bg-green-50 text-green-600',
    completed: 6
  },
  {
    id: 'occasions',
    title: 'Dressing for Occasions',
    description: 'Mastering dress codes and formal wear',
    lessons: 9,
    duration: '50 min',
    level: 'Intermediate',
    progress: 33,
    icon: '🎭',
    color: 'bg-indigo-50 text-indigo-600',
    completed: 3
  }
];

export function StyleAcademyScreen({ onCategorySelect, onBack }: StyleAcademyScreenProps) {
  const totalCompleted = categories.reduce((sum, cat) => sum + cat.completed, 0);
  const totalLessons = categories.reduce((sum, cat) => sum + cat.lessons, 0);
  const overallProgress = Math.round((totalCompleted / totalLessons) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border px-6 py-4 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl">Style Academy</h1>
            <p className="text-sm text-muted-foreground">Learn fashion fundamentals</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Progress Overview */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg">Your Learning Journey</h2>
              <p className="text-sm text-muted-foreground">{totalCompleted} of {totalLessons} lessons completed</p>
            </div>
          </div>
          <Progress value={overallProgress} className="h-2 mb-2" />
          <p className="text-sm text-muted-foreground">{overallProgress}% complete</p>
        </Card>

        {/* Achievement Badges */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          <div className="flex-shrink-0 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">🏆</span>
            </div>
            <p className="text-xs text-muted-foreground">Color Expert</p>
          </div>
          <div className="flex-shrink-0 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">🌟</span>
            </div>
            <p className="text-xs text-muted-foreground">Quick Learner</p>
          </div>
          <div className="flex-shrink-0 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2 opacity-50">
              <span className="text-2xl">📖</span>
            </div>
            <p className="text-xs text-muted-foreground">Scholar</p>
          </div>
          <div className="flex-shrink-0 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2 opacity-50">
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-xs text-muted-foreground">Perfectionist</p>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <h3 className="text-lg">Categories</h3>
          {categories.map((category) => (
            <Card 
              key={category.id} 
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onCategorySelect(category)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${category.color}`}>
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4>{category.title}</h4>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Book className="w-3 h-3" />
                      {category.lessons} lessons
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {category.duration}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.level}
                    </Badge>
                  </div>
                  {category.progress > 0 && (
                    <div className="mt-2">
                      <Progress value={category.progress} className="h-1" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {category.completed}/{category.lessons} completed
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="p-4">
          <h3 className="text-sm mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Target className="w-4 h-4 mr-2" />
              Continue where you left off
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Star className="w-4 h-4 mr-2" />
              Popular lessons this week
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}