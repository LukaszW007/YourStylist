import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function Header({ title, onBack, showBackButton = true }: HeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        {showBackButton && onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <h1 className="text-lg">{title}</h1>
      </div>
    </div>
  );
}