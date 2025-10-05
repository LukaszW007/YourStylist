import { Check, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

interface SuccessScreenProps {
  onRestart: () => void;
  onBackToMenu: () => void;
}

export function SuccessScreen({ onRestart, onBackToMenu }: SuccessScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Success Icon */}
        <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-12 h-12 text-green-600" />
        </div>

        {/* Success Message */}
        <div className="space-y-3">
          <h1 className="text-2xl">Items added successfully!</h1>
          <p className="text-muted-foreground">
            All 4 items have been added to your closet. You can now use them to create outfits.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={onRestart}
            variant="outline"
            className="w-full h-12"
            size="lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Scan more items
          </Button>
          
          <Button 
            className="w-full h-12 mb-2"
            size="lg"
          >
            View my closet
          </Button>

          <Button 
            onClick={onBackToMenu}
            variant="ghost"
            className="w-full h-10"
            size="sm"
          >
            Back to menu
          </Button>
        </div>
      </div>
    </div>
  );
}