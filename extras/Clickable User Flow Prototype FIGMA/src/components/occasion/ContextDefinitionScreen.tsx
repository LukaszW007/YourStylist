import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useState } from "react";

interface ContextDefinitionScreenProps {
  occasion: string;
  onContinue: (context: any) => void;
}

const contextQuestions: Record<string, any> = {
  wedding: {
    title: "Wedding Details",
    questions: [
      {
        id: 'dress_code',
        label: 'What is the expected dress code?',
        options: ['Black tie', 'Formal', 'Smart casual', "I don't know"]
      },
      {
        id: 'season',
        label: 'What season is it?',
        options: ['Spring/Summer', 'Fall/Winter']
      }
    ]
  },
  date: {
    title: "Date Details",
    questions: [
      {
        id: 'type',
        label: 'What type of date is it?',
        options: ['Dinner date', 'Coffee/Lunch', 'Activity date', 'Evening out']
      },
      {
        id: 'formality',
        label: 'How formal should you dress?',
        options: ['Casual', 'Smart casual', 'Dressy', 'Not sure']
      }
    ]
  },
  interview: {
    title: "Interview Details",
    questions: [
      {
        id: 'company_type',
        label: 'What type of company is it?',
        options: ['Corporate/Finance', 'Tech/Startup', 'Creative', 'Government']
      },
      {
        id: 'position_level',
        label: 'What level is the position?',
        options: ['Entry level', 'Mid-level', 'Senior level', 'Executive']
      }
    ]
  },
  corporate: {
    title: "Corporate Event Details",
    questions: [
      {
        id: 'event_type',
        label: 'What type of corporate event?',
        options: ['Conference', 'Networking', 'Company party', 'Client meeting']
      },
      {
        id: 'time',
        label: 'When is the event?',
        options: ['Morning/Afternoon', 'Evening', 'All day']
      }
    ]
  },
  theater: {
    title: "Theater Details",
    questions: [
      {
        id: 'venue_type',
        label: 'What type of venue?',
        options: ['Opera house', 'Modern theater', 'Outdoor venue', 'Not sure']
      },
      {
        id: 'show_type',
        label: 'What are you seeing?',
        options: ['Opera/Ballet', 'Musical', 'Play', 'Concert']
      }
    ]
  },
  vacation: {
    title: "Vacation Details",
    questions: [
      {
        id: 'destination',
        label: 'What type of destination?',
        options: ['Beach/Resort', 'City break', 'Mountain/Nature', 'Business travel']
      },
      {
        id: 'climate',
        label: 'What will the weather be like?',
        options: ['Hot/Tropical', 'Mild/Temperate', 'Cold', 'Variable']
      }
    ]
  }
};

const occasionNames: Record<string, string> = {
  wedding: 'Wedding',
  date: 'Date',
  interview: 'Job Interview',
  corporate: 'Corporate Event',
  theater: 'Theater',
  vacation: 'Vacation Trip'
};

export function ContextDefinitionScreen({ occasion, onContinue }: ContextDefinitionScreenProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const contextData = contextQuestions[occasion] || contextQuestions.wedding;

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const canContinue = contextData.questions.every((q: any) => answers[q.id]);

  const handleContinue = () => {
    onContinue({ occasion, answers });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-xl">{contextData.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Help us suggest the perfect outfit for your {occasionNames[occasion].toLowerCase()}
        </p>
      </div>

      <div className="p-6 space-y-8">
        {/* Questions */}
        {contextData.questions.map((question: any) => (
          <div key={question.id} className="space-y-4">
            <h3 className="text-base">{question.label}</h3>
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((option: string) => (
                <Button
                  key={option}
                  variant={answers[question.id] === option ? "default" : "outline"}
                  className="h-auto p-4 text-sm whitespace-normal"
                  onClick={() => handleAnswerSelect(question.id, option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        ))}

        {/* Continue Button */}
        <Button 
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full h-12"
          size="lg"
        >
          View Suggestions
        </Button>
      </div>
    </div>
  );
}