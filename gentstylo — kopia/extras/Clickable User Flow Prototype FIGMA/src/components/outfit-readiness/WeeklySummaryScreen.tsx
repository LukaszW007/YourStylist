import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Calendar, Clock, AlertCircle } from "lucide-react";

interface WeeklySummaryScreenProps {
  onViewChecklist: () => void;
  onBack: () => void;
}

export function WeeklySummaryScreen({ onViewChecklist, onBack }: WeeklySummaryScreenProps) {
  const weeklyOutfits = [
    { day: "Monday", outfit: "Business Casual", status: "ready" },
    { day: "Tuesday", outfit: "Smart Casual", status: "needs_check" },
    { day: "Wednesday", outfit: "Formal Meeting", status: "ready" },
    { day: "Thursday", outfit: "Casual Friday Prep", status: "needs_check" },
    { day: "Friday", outfit: "Weekend Ready", status: "ready" }
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <h1 className="text-lg font-medium">Weekly Prep</h1>
        <div className="w-12" />
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="text-center space-y-2">
          <Calendar className="h-16 w-16 mx-auto text-primary" />
          <h2 className="text-xl">Prepare for the Week</h2>
          <p className="text-muted-foreground">
            Make sure your planned outfits are ready to wear
          </p>
        </div>

        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-3 mb-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-800">Sunday Evening Checklist</span>
          </div>
          <p className="text-sm text-blue-700">
            Review your weekly outfits and ensure all items are clean and ready
          </p>
        </Card>

        <div className="space-y-3">
          {weeklyOutfits.map((day, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{day.day}</h4>
                  <p className="text-sm text-muted-foreground">{day.outfit}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {day.status === "ready" ? (
                    <Badge variant="default" className="bg-green-600">Ready</Badge>
                  ) : (
                    <Badge variant="destructive">Check Needed</Badge>
                  )}
                  {day.status === "needs_check" && <AlertCircle className="h-4 w-4 text-orange-500" />}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button
          onClick={onViewChecklist}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Start Weekly Checklist
        </Button>
      </div>
    </div>
  );
}