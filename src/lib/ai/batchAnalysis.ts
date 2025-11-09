"use client";

import { DetectedItem } from "@/components/scanner/ConfirmationScreen";

type GeminiSuccess = {
	ok: true;
	plan: string;
	usedKey: string;
	imageUrl: string | null;
	prompt?: string | null;
	imageProvided?: boolean;
};

type GeminiError = {
	error: string;
	hint?: string;
};

type AnalysisResult = GeminiSuccess | GeminiError;

interface BatchAnalysisOptions {
	base64Image: string;
	mimeType: string;
}

/**
 * Analyzes an image containing multiple garments using Gemini AI.
 * Returns an array of detected items with categories and colors.
 */
export async function analyzeBatchGarments({ base64Image, mimeType }: BatchAnalysisOptions): Promise<DetectedItem[]> {
	const prompt = `
		Przeanalizuj zdjęcie ubrań. Na zdjęciu może być od 1 do 5 różnych elementów odzieży.
		Zidentyfikuj każdy element osobno i zwróć tablicę obiektów w ścisłym formacie JSON.
		Nie dodawaj żadnego tekstu przed lub po obiekcie JSON, ani żadnych znaków formatowania markdown.
		
		Struktura JSON powinna być następująca:
		[
			{
				"id": "unique_id", // Unikalny identyfikator elementu (np. "item_1", "item_2")
				"detectedCategory": "string", // np. 'Koszulka', 'Spodnie', 'Bluza', 'Kurtka', 'Buty', 'Akcesoria'
				"detectedColor": "string", // Główny, najbardziej widoczny kolor w języku polskim
				"confidence": number // Pewność rozpoznania od 0 do 1
			}
		]
		
		Zwróć tylko elementy, które są wyraźnie widoczne i rozpoznawalne (confidence > 0.6).
		Jeśli na zdjęciu nie ma ubrań, zwróć pustą tablicę [].
	`;

	try {
		const response = await fetch("/api/gemini-proxy", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				prompt,
				image: {
					inlineData: {
						data: base64Image,
						mimeType,
					},
				},
			}),
		});

		if (!response.ok) {
			const errorPayload = ((await response.json().catch(() => ({}))) ?? {}) as GeminiError;
			throw new Error(errorPayload.error ?? "Wystąpił błąd podczas komunikacji z API.");
		}

		const result = (await response.json()) as AnalysisResult;

		if ("error" in result) {
			throw new Error(result.error);
		}

		// Parse the response text to extract JSON array
		const responseText = JSON.stringify(result);
		const jsonMatch = responseText.match(/\[[\s\S]*\]/);

		if (!jsonMatch) {
			throw new Error("Nie udało się wykryć ubrań na zdjęciu.");
		}

		const detectedItems = JSON.parse(jsonMatch[0]) as Array<{
			id: string;
			detectedCategory: string;
			detectedColor: string;
			confidence: number;
		}>;

		// Convert to DetectedItem format with temporary image URLs
		return detectedItems.map((item) => ({
			id: item.id,
			imageUrl: "", // Will be set after cropping/upload
			detectedCategory: item.detectedCategory,
			detectedColor: item.detectedColor,
			category: item.detectedCategory,
			color: item.detectedColor,
		}));
	} catch (err) {
		const message = err instanceof Error ? err.message : "Nieoczekiwany błąd podczas analizy.";
		throw new Error(message);
	}
}
