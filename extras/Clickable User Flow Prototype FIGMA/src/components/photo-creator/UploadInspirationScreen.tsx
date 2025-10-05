import React, { useState } from "react";
import { Camera, Link, Upload, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";

interface UploadInspirationScreenProps {
  onPhotoUpload: (source: string) => void;
  onBack: () => void;
}

export function UploadInspirationScreen({ onPhotoUpload, onBack }: UploadInspirationScreenProps) {
  const [linkUrl, setLinkUrl] = useState("");

  const handleUpload = () => {
    // Simulate photo upload
    onPhotoUpload("upload");
  };

  const handleLinkSubmit = () => {
    if (linkUrl.trim()) {
      onPhotoUpload("link");
    }
  };

  const handleTakePhoto = () => {
    onPhotoUpload("camera");
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <h1 className="text-lg font-medium">Outfit Creator</h1>
        <div className="w-12" />
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl">Upload Your Inspiration</h2>
          <p className="text-muted-foreground">
            Found a great outfit online? Let's recreate it with your wardrobe!
          </p>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <Button
              onClick={handleTakePhoto}
              className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Camera className="mr-2 h-5 w-5" />
              Take a Photo
            </Button>
          </Card>

          <Card className="p-6">
            <Button
              onClick={handleUpload}
              variant="outline"
              className="w-full h-16"
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload from Gallery
            </Button>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Link className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Paste a Link</span>
            </div>
            <Input
              placeholder="Pinterest, Instagram, or any image URL..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
            <Button
              onClick={handleLinkSubmit}
              variant="outline"
              className="w-full"
              disabled={!linkUrl.trim()}
            >
              Analyze Link
            </Button>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          We'll analyze the outfit and find similar pieces in your wardrobe
        </div>
      </div>
    </div>
  );
}