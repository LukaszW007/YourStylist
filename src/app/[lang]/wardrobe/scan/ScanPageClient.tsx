"use client";

import { useState } from "react";
import { IntroScreen } from "@/components/scanner/IntroScreen";
import { CameraCapture } from "@/components/scanner/CameraCapture";
import { ConfirmationScreen, DetectedItem } from "@/components/scanner/ConfirmationScreen";
import { SuccessScreen } from "@/components/scanner/SuccessScreen";
import { analyzeBatchGarments } from "@/lib/ai/batchAnalysis";
import { addGarmentsToWardrobe, GarmentData } from "@/lib/supabase/wardrobe";
import { compressImageForAI, formatFileSize } from "@/lib/utils/imageProcessing";

type ScanStep = "intro" | "camera" | "analyzing" | "confirmation" | "success";

interface ScanPageClientProps {
	lang: string;
	translations: {
		confirmItems: string;
		reviewDetails: string;
		category: string;
		styleSubtype: string;
		styleContext: string;
		colorName: string;
		hex: string;
		secondaryColors: string;
		pattern: string;
		keyFeatures: string;
		addFeature: string;
		material: string;
		addAllToCloset: string;
		addOneToCloset: string;
		name: string;
		exampleShirt: string;
	};
}

export default function ScanPageClient({ lang, translations }: ScanPageClientProps) {
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
			// Compress and downscale image before sending to Gemini API
			const compressed = await compressImageForAI(file, {
				maxWidth: 1024,
				maxHeight: 1024,
				quality: 0.85,
				maxSizeMB: 4,
			});

			console.log(
				`Image compressed: ${formatFileSize(compressed.originalSize)} → ${formatFileSize(compressed.compressedSize)} (${
					compressed.compressionRatio
				}% reduction)`
			);

			// Analyze compressed image with Gemini AI
			const items = await analyzeBatchGarments({
				base64Image: compressed.base64,
				mimeType: compressed.mimeType,
				lang: lang as "en" | "pl" | "no",
			});

			if (items.length === 0) {
				alert("Nie wykryto żadnych ubrań na zdjęciu. Spróbuj ponownie.");
				setStep("intro");
				return;
			}

			// Create full data URL for preview
			const previewDataUrl = `data:${compressed.mimeType};base64,${compressed.base64}`;

			// Set image URL for all detected items
			const itemsWithImages = items.map((item) => ({
				...item,
				imageUrl: previewDataUrl,
			}));

			setDetectedItems(itemsWithImages);
			setStep("confirmation");
		} catch (error) {
			console.error("Image processing error:", error);
			alert("Wystąpił błąd podczas przetwarzania zdjęcia. Spróbuj ponownie.");
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
				translations={translations}
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
