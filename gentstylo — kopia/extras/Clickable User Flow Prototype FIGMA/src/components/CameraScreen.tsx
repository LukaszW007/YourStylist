import { useState, useEffect } from "react";
import { Camera, FlipHorizontal, Zap, ZapOff } from "lucide-react";
import { Button } from "./ui/button";

interface CameraScreenProps {
  onPhotoTaken: () => void;
}

export function CameraScreen({ onPhotoTaken }: CameraScreenProps) {
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('auto');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleShutterClick = () => {
    setIsAnalyzing(true);
    // Simulate analyzing delay
    setTimeout(() => {
      setIsAnalyzing(false);
      onPhotoTaken();
    }, 2000);
  };

  const toggleFlash = () => {
    setFlashMode(prev => {
      if (prev === 'off') return 'auto';
      if (prev === 'auto') return 'on';
      return 'off';
    });
  };

  const getFlashIcon = () => {
    if (flashMode === 'off') return <ZapOff className="w-6 h-6" />;
    return <Zap className="w-6 h-6" />;
  };

  const getFlashLabel = () => {
    return flashMode.toUpperCase();
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white text-lg">Analyzing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Camera Viewfinder Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 opacity-90">
        {/* Simulated camera grid lines */}
        <div className="absolute inset-0">
          <div className="h-full w-full grid grid-cols-3 grid-rows-3 opacity-30">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border border-white/20"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-safe-area-top left-0 right-0 z-10 flex justify-between items-center p-6">
        {/* Flash Control */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFlash}
          className="bg-black/20 text-white hover:bg-black/40 rounded-full w-12 h-12"
        >
          <div className="flex flex-col items-center">
            {getFlashIcon()}
            <span className="text-xs mt-1">{getFlashLabel()}</span>
          </div>
        </Button>

        {/* Camera Flip */}
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/20 text-white hover:bg-black/40 rounded-full w-12 h-12"
        >
          <FlipHorizontal className="w-6 h-6" />
        </Button>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-center">
        <Button
          onClick={handleShutterClick}
          className="w-20 h-20 rounded-full bg-white hover:bg-gray-100 border-4 border-white shadow-lg"
        >
          <Camera className="w-8 h-8 text-black" />
        </Button>
      </div>

      {/* Center Focus Point */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white/60 rounded-lg"></div>
    </div>
  );
}