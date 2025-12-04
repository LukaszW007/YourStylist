"use client";

import { useState } from "react";
import { CameraCapture } from "@/components/scanner/CameraCapture";
import { ConfirmationScreen, DetectedItem } from "@/components/scanner/ConfirmationScreen";
import { SuccessScreen } from "@/components/scanner/SuccessScreen";
import { analyzeBatchGarments } from "@/lib/ai/batchAnalysis";
import { addGarmentsToWardrobe, GarmentData } from "@/lib/supabase/wardrobe";
import { compressImageForAI, formatFileSize } from "@/lib/utils/imageProcessing";
import { compressImageForStorage, getCompressionStats } from "@/lib/utils/imageCompression";

type ScanStep = "camera" | "analyzing" | "confirmation" | "compressing" | "success";

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

		addAllToCloset: string;
		addOneToCloset: string;
		name: string;
		exampleShirt: string;
	};
}

export default function ScanPageClient({ lang, translations }: ScanPageClientProps) {
	const [step, setStep] = useState<ScanStep>("camera");
	const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);

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
				setStep("camera");
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
			setStep("camera");
		}
	};

	const handleCameraCancel = () => {
		setStep("camera");
	};

	const handleConfirmItems = async (items: DetectedItem[]) => {
		try {
			setStep("compressing");

			// Compress images for storage (target 0.5MB per image)
			const compressedImages = await Promise.all(
				items.map(async (item, index) => {
					// Convert data URL to File
					const response = await fetch(item.imageUrl);
					const blob = await response.blob();
					const file = new File([blob], `garment-${index}.jpg`, { type: "image/jpeg" });

					// Compress with TinyPNG-like algorithm
					const compressed = await compressImageForStorage(file, {
						targetSizeMB: 0.5,
						maxWidth: 1920,
						maxHeight: 1920,
						initialQuality: 0.85,
						minQuality: 0.4,
					});

					console.log(`Image ${index + 1} compressed:`, getCompressionStats(compressed));

					return compressed.dataUrl;
				})
			);

			// Prepare garment data with all available fields
			const garments: GarmentData[] = items.map((item, index) => {
				// Build notes from various fields (legacy field, can be used for additional notes)
				const notesParts: string[] = [];
				if (item.brand) notesParts.push(`Brand: ${item.brand}`);

				// Build tags from materials and style context
				const tags: string[] = [];
				if (item.materials && item.materials.length > 0) {
					tags.push(...item.materials);
				}
				if (item.styleContext && item.styleContext.length > 0) {
					tags.push(...item.styleContext);
				}

				// Convert styleContext array to string (take first if available)
				const styleContextStr = Array.isArray(item.styleContext) && item.styleContext.length > 0 ? item.styleContext[0] : undefined;

				// Prepare secondary colors for database
				const secondaryColors = item.secondaryColors?.map((sc) => ({
					name: sc.name || "",
					hex: sc.hex || "",
				}));

				return {
					name: item.colorName || `${item.category}`,
					category: item.category || "Inne",
					image_url: compressedImages[index], // Use compressed image
					brand: item.brand || undefined,
					subcategory: item.subType || undefined,
					notes: notesParts.length > 0 ? notesParts.join(" | ") : undefined,
					tags: tags.length > 0 ? tags : undefined,
					// New extended fields
					description: item.description || undefined,
					style_context: styleContextStr,
					main_color_name: item.colorName || undefined,
					main_color_hex: item.colorHex || undefined,
					secondary_colors: secondaryColors,
					pattern: item.pattern || undefined,
					key_features: item.keyFeatures || undefined,
					material: item.materials && item.materials.length > 0 ? item.materials : undefined,
				};
			});

			// Save to Supabase
			const result = await addGarmentsToWardrobe(garments);

			if (!result.success) {
				throw new Error(result.error || "Failed to save garments");
			}

			setStep("success");
		} catch (error) {
			console.error("Save error:", error);
			alert("Wystąpił błąd podczas zapisywania ubrań.");
			setStep("confirmation"); // Return to confirmation on error
		}
	};

	const handleConfirmationCancel = () => {
		setStep("camera");
	};

	const handleScanMore = () => {
		setStep("camera");
		setDetectedItems([]);
	};

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

	if (step === "compressing") {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
				<div className="text-center">
					<div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
					<h2 className="mb-2 text-xl font-semibold text-foreground">Optymalizacja obrazów...</h2>
					<p className="text-sm text-muted-foreground">Kompresujemy zdjęcia do 0.5MB aby zaoszczędzić miejsce</p>
				</div>
			</div>
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
