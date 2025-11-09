"use client";

import { useState, useRef, useCallback, ChangeEvent } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

interface CameraCaptureProps {
	onImageCaptured: (file: File) => void;
	onCancel: () => void;
	isAnalyzing?: boolean;
}

export function CameraCapture({ onImageCaptured, onCancel, isAnalyzing = false }: CameraCaptureProps) {
	const [preview, setPreview] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const cameraInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) return;

			// Validate file size (5MB limit)
			const MAX_SIZE = 5 * 1024 * 1024;
			if (file.size > MAX_SIZE) {
				setError("Zdjęcie jest za duże. Maksymalny rozmiar to 5MB.");
				return;
			}

			// Validate file type
			if (!file.type.startsWith("image/")) {
				setError("Nieprawidłowy format pliku. Wybierz zdjęcie.");
				return;
			}

			setError(null);

			// Create preview
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result as string);
			};
			reader.readAsDataURL(file);

			// Pass file to parent
			onImageCaptured(file);
		},
		[onImageCaptured]
	);

	const handleCameraClick = () => {
		cameraInputRef.current?.click();
	};

	const handleGalleryClick = () => {
		fileInputRef.current?.click();
	};

	const handleClearPreview = () => {
		setPreview(null);
		setError(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
		if (cameraInputRef.current) cameraInputRef.current.value = "";
	};

	if (isAnalyzing) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center space-y-6 px-6">
					<Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
					<div className="space-y-2">
						<h3 className="text-lg font-medium">Analizuję Twoje ubrania...</h3>
						<p className="text-sm text-muted-foreground">To może potrwać kilka sekund</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="flex flex-col px-6 py-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-brand text-primary">ZRÓB LUB WYBIERZ ZDJĘCIE</h2>
					<Button
						onClick={onCancel}
						variant="ghost"
						size="sm"
					>
						<X className="w-5 h-5" />
					</Button>
				</div>

				{/* Preview Area */}
				<div className="flex-1 flex flex-col items-center justify-center space-y-6">
					{preview ? (
						<div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden bg-card">
							<Image
								src={preview}
								alt="Preview"
								fill
								className="object-contain"
							/>
							<Button
								onClick={handleClearPreview}
								variant="ghost"
								size="sm"
								className="absolute top-2 right-2 bg-background/80 hover:bg-background"
							>
								<X className="w-4 h-4" />
							</Button>
						</div>
					) : (
						<div className="w-full max-w-md aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center">
							<div className="text-center space-y-4 px-6">
								<Camera className="w-12 h-12 mx-auto text-muted-foreground" />
								<p className="text-sm text-muted-foreground">Zrób zdjęcie lub wybierz z galerii, aby rozpocząć</p>
							</div>
						</div>
					)}

					{/* Error Message */}
					{error && (
						<div className="w-full max-w-md p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
							<p className="text-sm text-destructive text-center">{error}</p>
						</div>
					)}

					{/* Action Buttons */}
					<div className="w-full max-w-md space-y-3">
						<Button
							onClick={handleCameraClick}
							className="w-full h-14 text-lg"
							size="lg"
						>
							<Camera className="w-5 h-5 mr-2" />
							Zrób zdjęcie
						</Button>
						<Button
							onClick={handleGalleryClick}
							variant="outline"
							className="w-full h-14 text-lg"
							size="lg"
						>
							<Upload className="w-5 h-5 mr-2" />
							Wybierz z galerii
						</Button>
					</div>
				</div>

				{/* Hidden File Inputs */}
				<input
					ref={cameraInputRef}
					type="file"
					accept="image/*"
					capture="environment"
					onChange={handleFileChange}
					className="hidden"
				/>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handleFileChange}
					className="hidden"
				/>
			</div>
		</div>
	);
}
