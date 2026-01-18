"use client";

import { DetectedItem } from "@/components/scanner/ConfirmationScreen";

// Rozszerzamy typ o pole obrazka, którego potrzebuje frontend
export interface DetectedItemResponse extends DetectedItem {
	base64_image?: string | null;
	cropped_image_url?: string | null;
}

interface BatchAnalysisOptions {
	base64Image: string;
	mimeType: string;
	lang?: "en" | "pl" | "no";
}

// Definicja tego, co DOKŁADNIE zwraca Twoje API (route.ts) w tablicy "items"
// To eliminuje potrzebę używania "any"
interface ApiRawItem {
	id: string;
	detectedCategory: string;
	detectedColor: string;
	colorName?: string;
	colorHex?: string;
	secondaryColors?: Array<{ name: string; hex: string }>;
	subType?: string;
	styleContext?: string[];
	pattern?: string;
	keyFeatures?: string[];
	materials?: string[];
	description?: string;
	confidence?: number;
	colorTemperature?: "Warm" | "Cool" | "Neutral" | null;
	// Kluczowe pola obrazkowe z API
	base64_image?: string;
	cropped_image_url?: string;
	// Physics-related fields from API
	fabricWeave?: string | null;
	thermalProfile?: string | null;
}

/**
 * Analyzes an image containing multiple garments using Gemini AI via secure API endpoint.
 * Returns an array of detected items with categories, colors, and cropped images.
 */
export async function analyzeBatchGarments({ base64Image, mimeType, lang = "en" }: BatchAnalysisOptions): Promise<DetectedItemResponse[]> {
	try {
		console.log("[Client] Sending image to API for analysis...");

		const response = await fetch("/api/analyze-garments", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				base64Image,
				mimeType,
				lang,
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || `API request failed with status ${response.status}`);
		}

		const data = await response.json();

		if (!data.success || !Array.isArray(data.items)) {
			throw new Error("Invalid response from API: 'items' array missing");
		}

		console.log(`[Client] Successfully received ${data.items.length} detected items`);

		// Rzutujemy surowe dane na nasz interfejs ApiRawItem, żeby pozbyć się "any"
		const rawItems = data.items as ApiRawItem[];

		// Mapujemy odpowiedź API na format używany w aplikacji
		return rawItems.map((item) => ({
			id: item.id,
			imageUrl: "", // To pole zostanie nadpisane w ScanPageClient (przez base64 lub URL)
			base64_image: item.base64_image || null,
			cropped_image_url: item.cropped_image_url || null,
			detectedCategory: item.detectedCategory,
			detectedColor: item.detectedColor,
			colorName: item.colorName || item.detectedColor,
			colorHex: item.colorHex,
			colorTemperature: item.colorTemperature || null,
			secondaryColors: item.secondaryColors || [],
			subType: item.subType,
			// Obsługa styleContext: API zwraca tablicę, frontend woli tablicę
			styleContext: item.styleContext || [],
			pattern: item.pattern,
			keyFeatures: item.keyFeatures || [],
			// Bezpieczne mapowanie materiałów
			materials: Array.isArray(item.materials) ? item.materials : [],
			description: item.description,
			confidence: item.confidence || 0,

			// Pola wymagane przez interfejs DetectedItem (kompatybilność wsteczna)
			category: item.detectedCategory,
			color: item.colorName || item.detectedColor,
			// Physics-related fields from API
			fabricWeave: item.fabricWeave || null,
			thermalProfile: item.thermalProfile || null,
		}));
	} catch (err) {
		console.error("[Client] Batch analysis error:", err);
		const message = err instanceof Error ? err.message : "Nieoczekiwany błąd podczas analizy.";
		throw new Error(message);
	}
}
