import { Check, Bell } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface ConfirmationScreenProps {
  selectedDay: string;
  selectedOutfit: any;
  onBackToWeekly: () => void;
}

export function ConfirmationScreen({ selectedDay, selectedOutfit, onBackToWeekly }: ConfirmationScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-8 h-8 text-green-600" />
        </div>

        {/* Confirmation Message */}
        <div className="space-y-3">
          <h1 className="text-2xl">Outfit Planned!</h1>
          <p className="text-muted-foreground">
            Your outfit for {selectedDay} has been saved to your weekly calendar.
          </p>
        </div>

        {/* Selected Outfit Preview */}
        <Card className="overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                <ImageWithFallback
                  src={selectedOutfit.image}
                  alt={selectedOutfit.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <h3 className="text-base mb-1">{selectedOutfit.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedDay}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Notification Info */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-4 flex items-center gap-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <p className="text-sm">Daily Reminder Set</p>
              <p className="text-xs text-muted-foreground">
                You'll get a notification tomorrow morning: "Your outfit is ready for today!"
              </p>
            </div>
          </div>
        </Card>

        {/* Back to Weekly View */}
        <Button 
          onClick={onBackToWeekly}
          className="w-full h-12"
          size="lg"
        >
          Back to Weekly View
        </Button>
      </div>
    </div>
  );
}