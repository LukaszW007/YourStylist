"use client";

import { useState } from "react";
import { IntroScreen } from "@/components/scanner/IntroScreen";
import { CameraCapture } from "@/components/scanner/CameraCapture";
import { ConfirmationScreen, DetectedItem } from "@/components/scanner/ConfirmationScreen";
import { SuccessScreen } from "@/components/scanner/SuccessScreen";
import { analyzeBatchGarments } from "@/lib/ai/batchAnalysis";
import { addGarmentsToWardrobe, GarmentData } from "@/lib/supabase/wardrobe";

type ScanStep = "intro" | "camera" | "analyzing" | "confirmation" | "success";

interface ScanPageClientProps {
	lang: string;
}

export default function ScanPageClient({ lang }: ScanPageClientProps) {
	const [step, setStep] = useState<ScanStep>("intro");
	const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);

	const handleScanClick = () => {
		setStep("camera");
	};

	const handleGalleryClick = () => {
		setStep("camera");
	};

	const handleImageCaptured = async (file: File) => {
		setStep("analyzing");

		try {
			// Convert file to base64
			const reader = new FileReader();
			reader.onloadend = async () => {
				const base64String = reader.result as string;
				const base64Data = base64String.split(",")[1];

				try {
					// Analyze image with Gemini AI
					const items = await analyzeBatchGarments({
						base64Image: base64Data,
						mimeType: file.type,
					});

					if (items.length === 0) {
						alert("Nie wykryto żadnych ubrań na zdjęciu. Spróbuj ponownie.");
						setStep("intro");
						return;
					}

					// Set image URL for all detected items (use the same captured image for now)
					const itemsWithImages = items.map((item) => ({
						...item,
						imageUrl: base64String,
					}));

					setDetectedItems(itemsWithImages);
					setStep("confirmation");
				} catch (error) {
					console.error("Analysis error:", error);
					alert("Wystąpił błąd podczas analizy zdjęcia. Spróbuj ponownie.");
					setStep("intro");
				}
			};
			reader.readAsDataURL(file);
		} catch (error) {
			console.error("File reading error:", error);
			alert("Wystąpił błąd podczas przetwarzania zdjęcia.");
			setStep("intro");
		}
	};

	const handleCameraCancel = () => {
		setStep("intro");
	};

	const handleConfirmItems = async (items: DetectedItem[]) => {
		try {
			// Prepare garment data
			const garments: GarmentData[] = items.map((item) => ({
				name: `${item.color} ${item.category}`,
				category: item.category || "Inne",
				color: item.color || "Nieznany",
				image_url: item.imageUrl,
			}));

			// Save to Supabase
			const result = await addGarmentsToWardrobe(garments);

			if (!result.success) {
				throw new Error(result.error || "Failed to save garments");
			}

			setStep("success");
		} catch (error) {
			console.error("Save error:", error);
			alert("Wystąpił błąd podczas zapisywania ubrań.");
		}
	};

	const handleConfirmationCancel = () => {
		setStep("intro");
	};

	const handleScanMore = () => {
		setStep("intro");
		setDetectedItems([]);
	};

	if (step === "intro") {
		return (
			<IntroScreen
				onScanClick={handleScanClick}
				onGalleryClick={handleGalleryClick}
			/>
		);
	}

	if (step === "camera" || step === "analyzing") {
		return (
			<CameraCapture
				onImageCaptured={handleImageCaptured}
				onCancel={handleCameraCancel}
				isAnalyzing={step === "analyzing"}
			/>
		);
	}

	if (step === "confirmation") {
		return (
			<ConfirmationScreen
				items={detectedItems}
				onConfirm={handleConfirmItems}
				onCancel={handleConfirmationCancel}
			/>
		);
	}

	if (step === "success") {
		return (
			<SuccessScreen
				itemCount={detectedItems.length}
				onScanMore={handleScanMore}
				lang={lang}
			/>
		);
	}

	return null;
}
