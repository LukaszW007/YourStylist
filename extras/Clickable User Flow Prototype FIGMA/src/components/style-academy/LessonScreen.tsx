import React from "react";
import { ArrowLeft, ChevronRight, Play, CheckCircle, Circle, BookOpen, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

interface LessonScreenProps {
  category: any;
  onLessonSelect: (lesson: any) => void;
  onBack: () => void;
}

const generateLessons = (categoryId: string, totalLessons: number, completed: number) => {
  const lessonTypes = {
    'basics': [
      'What is Fashion?', 'Understanding Silhouettes', 'Fabric Basics', 'Pattern Mixing', 
      'Proportions & Fit', 'Building a Foundation', 'Accessory Essentials', 'Style vs Fashion'
    ],
    'color': [
      'Color Wheel Basics', 'Warm vs Cool Tones', 'Your Color Palette', 'Seasonal Colors',
      'Color Combinations', 'Neutrals Mastery'
    ],
    'body-types': [
      'Understanding Body Shape', 'Highlighting Assets', 'Creating Balance', 'Necklines Guide',
      'Sleeve Styles', 'Hemline Heights', 'Fabric Choices', 'Styling Tricks', 'Confidence Building', 'Personal Style'
    ],
    'history': [
      '1920s Fashion', '1940s Wartime Style', '1950s Elegance', '1960s Revolution',
      '1970s Bohemian', '1980s Power Dressing', '1990s Minimalism', '2000s Trends',
      'Contemporary Fashion', 'Fashion Icons', 'Designer Spotlight', 'Cultural Influences'
    ],
    'sustainable': [
      'Fast Fashion Impact', 'Quality Over Quantity', 'Sustainable Materials', 'Ethical Brands',
      'Caring for Clothes', 'Upcycling Ideas', 'Mindful Shopping'
    ],
    'occasions': [
      'Business Casual', 'Formal Events', 'Cocktail Attire', 'Wedding Guest',
      'Job Interviews', 'Date Night', 'Travel Style', 'Seasonal Dressing', 'Cultural Sensitivity'
    ]
  };

  const categoryLessons = lessonTypes[categoryId] || [];
  return categoryLessons.slice(0, totalLessons).map((title, index) => ({
    id: index + 1,
    title,
    duration: `${Math.floor(Math.random() * 8) + 5} min`,
    completed: index < completed,
    type: index % 3 === 0 ? 'video' : index % 3 === 1 ? 'article' : 'interactive',
    difficulty: index < 3 ? 'Easy' : index < 6 ? 'Medium' : 'Advanced'
  }));
};

export function LessonScreen({ category, onLessonSelect, onBack }: LessonScreenProps) {
  const lessons = generateLessons(category.id, category.lessons, category.completed);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border px-6 py-4 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl">{category.title}</h1>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Category Overview */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${category.color}`}>
              <span className="text-2xl">{category.icon}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg">{category.title}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {category.lessons} lessons
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {category.duration}
                </div>
                <Badge variant="secondary">{category.level}</Badge>
              </div>
            </div>
          </div>
          <Progress value={category.progress} className="h-2 mb-2" />
          <p className="text-sm text-muted-foreground">
            {category.completed} of {category.lessons} lessons completed ({category.progress}%)
          </p>
        </Card>

        {/* Continue Learning */}
        {category.progress > 0 && category.progress < 100 && (
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm mb-1">Continue Learning</h3>
                <p className="text-xs text-muted-foreground">
                  Next: {lessons.find(l => !l.completed)?.title || 'Complete!'}
                </p>
              </div>
              <Button size="sm" onClick={() => onLessonSelect(lessons.find(l => !l.completed))}>
                <Play className="w-4 h-4 mr-1" />
                Continue
              </Button>
            </div>
          </Card>
        )}

        {/* Lessons List */}
        <div className="space-y-3">
          <h3 className="text-lg">Lessons</h3>
          {lessons.map((lesson, index) => {
            const isLocked = index > 0 && !lessons[index - 1].completed && lesson.completed === false;
            
            return (
              <Card 
                key={lesson.id} 
                className={`p-4 ${isLocked ? 'opacity-50' : 'cursor-pointer hover:shadow-md'} transition-all`}
                onClick={() => !isLocked && onLessonSelect(lesson)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {lesson.completed ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : isLocked ? (
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs">🔒</span>
                      </div>
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={lesson.completed ? 'line-through text-muted-foreground' : ''}>
                        {lesson.title}
                      </h4>
                      {!isLocked && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {lesson.type === 'video' && <Play className="w-3 h-3" />}
                        {lesson.type === 'article' && <BookOpen className="w-3 h-3" />}
                        {lesson.type === 'interactive' && <span>🎯</span>}
                        {lesson.type === 'video' ? 'Video' : lesson.type === 'article' ? 'Article' : 'Interactive'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.duration}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {lesson.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        {category.progress === 100 && (
          <Card className="p-6 text-center bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-lg mb-2">Category Complete!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You've mastered {category.title}. Ready for the next challenge?
            </p>
            <Button onClick={onBack}>
              Explore More Categories
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}