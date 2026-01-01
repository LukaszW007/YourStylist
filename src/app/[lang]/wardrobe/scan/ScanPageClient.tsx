"use client";

import { useState } from "react";
import { tryGetSupabaseBrowser } from "@/lib/supabase/client";
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
			// 1. ZMIANA: Zmniejszamy limit do 2.5MB, aby zmieścić się w limicie Vercel (4.5MB)
			// po konwersji na Base64 (która dodaje ~33% do wagi).
			const compressed = await compressImageForAI(file, {
				maxWidth: 1024,
				maxHeight: 1024,
				quality: 0.85,
				maxSizeMB: 2.5, // Bezpieczniejszy limit
			});

			console.log(
				`Image compressed for AI: ${formatFileSize(compressed.originalSize)} → ${formatFileSize(compressed.compressedSize)} (${
					compressed.compressionRatio
				}% reduction)`
			);

			// Analyze compressed image with Gemini AI
			const items = await analyzeBatchGarments({
				base64Image: compressed.base64,
				mimeType: compressed.mimeType,
				lang: lang as "en" | "pl" | "no",
			});

			console.log("DEBUG API RESPONSE:", items);

			if (items.length === 0) {
				alert("Nie wykryto żadnych ubrań na zdjęciu. Spróbuj ponownie.");
				setStep("camera");
				return;
			}

			// Create full data URL for preview
			const previewDataUrl = `data:${compressed.mimeType};base64,${compressed.base64}`;

			// Set image URL for all detected items
			const itemsWithImages = items.map((item) => {
				// Sprawdź, czy API zwróciło wycięte zdjęcie (base64_image)
				// Jeśli tak, użyj go. Jeśli nie (fallback), użyj głównego zdjęcia.
				// Uwaga: TypeScript może krzyczeć, jeśli nie dodałeś pola base64_image do typu DetectedItem
				const cropUrl = item.base64_image || item.cropped_image_url;

				return {
					...item,
					imageUrl: cropUrl ? cropUrl : previewDataUrl,
				};
			});

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

	// 2. ZMIANA: Sekwencyjne przetwarzanie (zamiast Promise.all) aby uniknąć zawieszenia UI
	const handleConfirmItems = async (items: DetectedItem[]) => {
		try {
			setStep("compressing");

			// Inicjalizacja klienta Supabase po stronie przeglądarki
			const supabase = tryGetSupabaseBrowser();
			if (!supabase) throw new Error("Supabase client not available");

			// SEKWENCYJNE przetwarzanie każdego itemu (uniknięcie zawieszenia UI)
			const uploadedUrls: string[] = [];

			for (let index = 0; index < items.length; index++) {
				const item = items[index];
				console.log(`Processing item ${index + 1}/${items.length}...`);

				// a) Konwersja URL podglądu na Blob
				const response = await fetch(item.imageUrl);
				const imageBlob = await response.blob();
				const imageFile = new File([imageBlob], `garment-${index}.png`, { type: "image/png" });

				// b) Kompresja dla Storage (optymalizacja miejsca)
				const compressed = await compressImageForStorage(imageFile, {
					targetSizeMB: 0.5,
					maxWidth: 1920,
					maxHeight: 1920,
					initialQuality: 0.85,
					minQuality: 0.4,
				});

				console.log(`Image ${index + 1} compressed for storage:`, getCompressionStats(compressed));

				// c) Przygotowanie pliku do wysyłki
				// Jeśli 'compressed' ma pole .file, używamy go. Jeśli to tylko dataUrl, konwertujemy.
				let fileToUpload: Blob;
				if ("file" in compressed && compressed.file instanceof Blob) {
					fileToUpload = compressed.file;
				} else {
					const res = await fetch(compressed.dataUrl);
					fileToUpload = await res.blob();
				}

				// d) Generowanie unikalnej ścieżki w Storage
				const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
				const filePath = `uploads/${uniqueId}-${index}.png`;

				// e) Bezpośredni Upload do Supabase (omijamy Vercel Server Function limit)
				const { error: uploadError } = await supabase.storage
					.from("garments") // Upewnij się, że masz taki bucket
					.upload(filePath, fileToUpload);

				if (uploadError) throw uploadError;

				// f) Pobranie publicznego URL
				const {
					data: { publicUrl },
				} = supabase.storage.from("garments").getPublicUrl(filePath);

				uploadedUrls.push(publicUrl);
			}


			// 3. Przygotowanie danych do zapisu w bazie (teraz używamy URLi, a nie Base64)
			const garments: GarmentData[] = items.map((item, index) => {
				// Build notes
				const notesParts: string[] = [];
				if (item.brand) notesParts.push(`Brand: ${item.brand}`);

				// Build tags
				const tags: string[] = [];
				if (item.materials && item.materials.length > 0) {
					tags.push(...item.materials);
				}
				if (item.styleContext && item.styleContext.length > 0) {
					tags.push(...item.styleContext);
				}

				// const styleContextStr = Array.isArray(item.styleContext) && item.styleContext.length > 0 ? item.styleContext[0] : undefined;

				const secondaryColors = item.secondaryColors?.map((sc) => ({
					name: sc.name || "",
					hex: sc.hex || "",
				}));

				console.log("Preparing garment for upload:", item);

				return {
					name: item.colorName || `${item.category}`,
					category: item.category || "Inne",
					image_url: uploadedUrls[index], // TUTAJ: Prawdziwy URL HTTP, a nie Base64!
					brand: item.brand || undefined,
					subcategory: item.subType || undefined,
					notes: notesParts.length > 0 ? notesParts.join(" | ") : undefined,
					tags: tags.length > 0 ? tags : undefined,
					description: item.description || undefined,
					style_context: item.styleContext || undefined,
					main_color_name: item.colorName || undefined,
					main_color_hex: item.colorHex || undefined,
					color_temperature: item.colorTemperature || undefined,
					secondary_colors: secondaryColors,
					pattern: item.pattern || undefined,
					key_features: item.keyFeatures || undefined,
					material: item.materials && item.materials.length > 0 ? item.materials : undefined,
					comfort_min_c: undefined,
					comfort_max_c: undefined,
					thermal_profile: undefined,
				};
			});

			// 4. Zapis metadanych do bazy (teraz payload jest malutki)
			const result = await addGarmentsToWardrobe(garments);

			if (!result.success) {
				throw new Error(result.error || "Failed to save garments");
			}

			setStep("success");
		} catch (error) {
			console.error("Save error:", error);
			alert("Wystąpił błąd podczas zapisywania ubrań.");
			setStep("confirmation");
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
					<h2 className="mb-2 text-xl font-semibold text-foreground">Zapisywanie...</h2>
					<p className="text-sm text-muted-foreground">Wysyłamy zdjęcia do Twojej szafy</p>
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
