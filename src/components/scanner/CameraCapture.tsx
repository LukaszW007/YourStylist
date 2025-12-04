"use client";

import { useState, useRef, useCallback, ChangeEvent } from "react";
import { Camera, Upload, X, Loader2, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { clientEnv } from "@/env";

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

			// Validate file size (optional based on feature flag)
			if (clientEnv.enableFileSizeLimit) {
				const MAX_SIZE = clientEnv.maxFileSizeMB * 1024 * 1024;
				if (file.size > MAX_SIZE) {
					setError(`Plik jest zbyt duży. Maksymalny rozmiar to ${clientEnv.maxFileSizeMB}MB.`);
					return;
				}
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
						<Home
							className="w-5 h-5"
							onClick={onCancel}
						/>
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
						<div className="w-full max-w-md space-y-6">
							{/* Instructions */}
							<div className="text-left space-y-4">
								<div className="flex items-start gap-4 p-4 rounded-lg bg-card">
									<span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
										1
									</span>
									<p className="text-sm pt-1 leading-relaxed">Rozłóż do 5 elementów odzieży na kontrastującym tle (np. łóżku)</p>
								</div>
								<div className="flex items-start gap-4 p-4 rounded-lg bg-card">
									<span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
										2
									</span>
									<p className="text-sm pt-1 leading-relaxed">Upewnij się, że są dobrze oświetlone</p>
								</div>
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
