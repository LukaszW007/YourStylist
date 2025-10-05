import React, { useState } from "react";
import { ArrowLeft, Play, Pause, CheckCircle, ChevronRight, BookOpen, Clock, Star } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface LessonDetailScreenProps {
  lesson: any;
  onComplete: () => void;
  onBack: () => void;
}

export function LessonDetailScreen({ lesson, onComplete, onBack }: LessonDetailScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchProgress, setWatchProgress] = useState(lesson.completed ? 100 : 0);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});

  const sampleContent = {
    video: {
      url: "https://images.unsplash.com/photo-1445205170230-053b83016050?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwZGVzaWduJTIwc3R1ZGlvfGVufDF8fHx8MTczMTE0NTA0OXww&ixlib=rb-4.1.0&q=80&w=1080",
      keyPoints: [
        "Understanding the fundamentals of fashion design",
        "How to identify quality fabrics and construction",
        "Building a versatile foundation wardrobe",
        "Common styling mistakes to avoid"
      ]
    },
    article: {
      content: [
        "Fashion is more than just clothing—it's a form of self-expression that communicates who you are without saying a word. Understanding the basics of fashion helps you make confident choices that reflect your personality and lifestyle.",
        "The foundation of great style starts with understanding fit. No matter how expensive or trendy a piece is, if it doesn't fit properly, it won't look good. Key areas to focus on include shoulders, waist, and hemlines.",
        "Building a wardrobe is like building a house—you need a strong foundation. Start with versatile pieces in neutral colors that can be mixed and matched easily. These form the backbone of your style."
      ]
    },
    quiz: [
      {
        question: "What is the most important aspect of fashion?",
        options: ["Brand names", "Fit and proportion", "Following trends", "Price"],
        correct: 1
      },
      {
        question: "Which should you prioritize when building a wardrobe?",
        options: ["Trendy pieces", "Versatile basics", "Designer items", "Seasonal colors"],
        correct: 1
      }
    ]
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && watchProgress < 100) {
      // Simulate video progress
      const interval = setInterval(() => {
        setWatchProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const isQuizComplete = () => {
    return sampleContent.quiz.every((_, index) => quizAnswers[index] !== undefined);
  };

  const getQuizScore = () => {
    return sampleContent.quiz.reduce((score, question, index) => {
      return score + (quizAnswers[index] === question.correct ? 1 : 0);
    }, 0);
  };

  const canComplete = lesson.type === 'video' ? watchProgress >= 100 : 
                    lesson.type === 'interactive' ? isQuizComplete() : true;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border px-6 py-4 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg">{lesson.title}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lesson.duration}
              </div>
              <Badge variant="outline" className="text-xs">
                {lesson.difficulty}
              </Badge>
              {lesson.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Video Content */}
        {lesson.type === 'video' && (
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-black">
              <ImageWithFallback 
                src={sampleContent.video.url}
                alt="Fashion lesson video"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Button
                  size="lg"
                  className="rounded-full w-16 h-16"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                </Button>
              </div>
            </div>
            <div className="p-4">
              <Progress value={watchProgress} className="h-1 mb-2" />
              <p className="text-sm text-muted-foreground">
                {watchProgress}% complete
              </p>
            </div>
          </Card>
        )}

        {/* Article Content */}
        {lesson.type === 'article' && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg">Article</h2>
            </div>
            <div className="prose prose-sm space-y-4">
              {sampleContent.article.content.map((paragraph, index) => (
                <p key={index} className="text-foreground leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </Card>
        )}

        {/* Key Points */}
        {lesson.type === 'video' && (
          <Card className="p-6">
            <h3 className="text-lg mb-4">Key Points</h3>
            <ul className="space-y-3">
              {sampleContent.video.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Interactive Quiz */}
        {lesson.type === 'interactive' && (
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🎯</span>
                <h2 className="text-lg">Knowledge Check</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Test your understanding with these questions.
              </p>
              
              {sampleContent.quiz.map((question, qIndex) => (
                <div key={qIndex} className="mb-6 last:mb-0">
                  <h4 className="mb-3">
                    {qIndex + 1}. {question.question}
                  </h4>
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => {
                      const isSelected = quizAnswers[qIndex] === oIndex;
                      const isCorrect = oIndex === question.correct;
                      const showResult = quizAnswers[qIndex] !== undefined;
                      
                      return (
                        <Button
                          key={oIndex}
                          variant={isSelected ? "default" : "outline"}
                          className={`w-full justify-start ${
                            showResult && isCorrect ? 'bg-green-100 border-green-300 text-green-800' :
                            showResult && isSelected && !isCorrect ? 'bg-red-100 border-red-300 text-red-800' :
                            ''
                          }`}
                          onClick={() => handleQuizAnswer(qIndex, oIndex)}
                          disabled={quizAnswers[qIndex] !== undefined}
                        >
                          {option}
                          {showResult && isCorrect && <CheckCircle className="w-4 h-4 ml-auto" />}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {isQuizComplete() && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="mb-2">Quiz Complete! 🎉</h4>
                  <p className="text-sm text-muted-foreground">
                    Your Score: {getQuizScore()} / {sampleContent.quiz.length}
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Completion Button */}
        <div className="sticky bottom-6">
          <Button 
            className="w-full" 
            size="lg"
            disabled={!canComplete}
            onClick={onComplete}
          >
            {lesson.completed ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Lesson Complete
              </>
            ) : (
              <>
                <Star className="w-5 h-5 mr-2" />
                Mark as Complete
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}