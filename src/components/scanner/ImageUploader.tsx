
"use client";
import { useState } from "react";
import { removeBackground, blobToDataURL } from "@imgly/background-removal";

interface ImageUploaderProps {
  onImageReady: (base64Image: string, mimeType: string) => void;
  isLoading: boolean; // This is the parent's loading state
}

export default function ImageUploader({ onImageReady, isLoading }: ImageUploaderProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<{
    inProgress: boolean;
    progress: number | null;
  }>({ inProgress: false, progress: null });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setProcessingState({ inProgress: true, progress: 0 });
    setFileName(file.name);

    // 1. Validate format
    if (!["image/jpeg", "image/png", "image/webp", "image/heic"].includes(file.type)) {
      setError("Invalid file format. Please select a JPG, PNG, WebP, or HEIC file.");
      setProcessingState({ inProgress: false, progress: null });
      return;
    }

    // 2. Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10MB.");
      setProcessingState({ inProgress: false, progress: null });
      return;
    }

    try {
      // 3. Remove background
      const resultBlob = await removeBackground(file, {
        onProgress: (progress) => {
          // Progress is a value from 0 to 1
          setProcessingState(prevState => ({ ...prevState, progress: Math.round(progress * 100) }));
        },
      });

      // 4. Convert result blob to Base64
      const reader = new FileReader();
      reader.readAsDataURL(resultBlob);
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        onImageReady(base64String, "image/png"); // Output is always PNG
        setProcessingState({ inProgress: false, progress: 100 });
      };
      reader.onerror = (error) => {
        console.error("Error reading the processed file:", error);
        setError("An error occurred while processing the file.");
        setProcessingState({ inProgress: false, progress: null });
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unknown error occurred during background removal.";
      console.error("Background removal failed:", message);
      setError(message);
      setProcessingState({ inProgress: false, progress: null });
    }
  };

  const isUploading = isLoading || processingState.inProgress;

  return (
    <div className="space-y-3">
      <label htmlFor="file-upload" className={`relative inline-block w-full cursor-pointer rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors
        ${isUploading ? 'border-slate-300 bg-slate-50' : 'border-slate-400 hover:border-primary'}`}>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="sr-only"
          disabled={isUploading}
        />
        <span className="text-primary font-semibold">
            {processingState.inProgress ? 'Processing...' : (fileName || 'Select an image')}
        </span>
        <p className="text-xs text-muted-foreground mt-1">JPG, PNG, HEIC up to 10MB</p>
      </label>

      {processingState.inProgress && (
        <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all" 
            style={{ width: `${processingState.progress || 0}%` }}
          ></div>
        </div>
      )}

      {fileName && !processingState.inProgress && !error && (
        <div className="text-sm text-green-600">
          Ready to upload: {fileName}
        </div>
      )}

      {error && <div className="text-sm text-red-500">{error}</div>}
    </div>
  );
}

