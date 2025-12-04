"use client";

import { DetectedItem } from "@/components/scanner/ConfirmationScreen";

interface BatchAnalysisOptions {
	base64Image: string;
	mimeType: string;
	lang?: "en" | "pl" | "no";
}

/**
 * Analyzes an image containing multiple garments using Gemini AI via secure API endpoint.
 * Returns an array of detected items with categories and colors.
 */
export async function analyzeBatchGarments({ base64Image, mimeType, lang = "en" }: BatchAnalysisOptions): Promise<DetectedItem[]> {
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
			throw new Error("Invalid response from API");
		}

		console.log(`[Client] Successfully received ${data.items.length} detected items`);

		// Convert API response to DetectedItem format with all extended fields
		return data.items.map((item: Record<string, unknown>) => ({
			id: item.id,
			imageUrl: "", // Will be set by caller
			detectedCategory: item.detectedCategory,
			detectedColor: item.detectedColor,
			colorName: item.colorName,
			colorHex: item.colorHex,
			secondaryColors: item.secondaryColors || [],
			subType: item.subType,
			styleContext: item.styleContext,
			pattern: item.pattern,
			keyFeatures: item.keyFeatures || [],
			materials: Array.isArray(item.materials) ? (item.materials as string[]) : item.materials ? [item.materials as string] : [],
			description: item.description,
			confidence: item.confidence,
			category: item.detectedCategory,
			color: item.colorName || item.detectedColor,
		}));
	} catch (err) {
		console.error("[Client] Batch analysis error:", err);
		const message = err instanceof Error ? err.message : "Nieoczekiwany błąd podczas analizy.";
		throw new Error(message);
	}
}
