"use client";
import { useState } from "react";

type Plan = "free" | "pro" | "elite";

type GeminiSuccess = {
	ok: true;
	plan: Plan;
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

type AnalysisViewProps = {
	base64Image: string | null;
	mimeType: string | null;
	onAnalyzingChange?: (state: boolean) => void;
};

export default function AnalysisView({ base64Image, mimeType, onAnalyzingChange }: AnalysisViewProps) {
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<AnalysisResult | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function handleImageAnalysis() {
		if (!base64Image || !mimeType) {
			setError("Najpierw wybierz zdjęcie w formacie JPG lub PNG.");
			return;
		}

		setLoading(true);
		onAnalyzingChange?.(true);
		setError(null);
		setResult(null);

		const prompt = `
			Przeanalizuj zdjęcie ubrania. Zidentyfikuj i zwróć następujące informacje w ścisłym formacie JSON.
			Nie dodawaj żadnego tekstu przed lub po obiekcie JSON, ani żadnych znaków formatowania markdown.
			Struktura JSON powinna być następująca:
			{
				"garmentType": "string", // np. 'Kurtka', 'Spodnie', 'Koszula', 'T-shirt', 'Buty'
				"color": "string", // Główny, najbardziej widoczny kolor ubrania
				"features": ["string"], // Lista cech szczególnych, np. 'Zapinana na zamek', 'Kieszenie boczne', 'Logo na lewej piersi', 'Kaptur'
				"fabric": "string" // np. materiał, np. 'Bawełna', 'Wełna', 'Jeans', 'Skóra', 'Materiał syntetyczny'
			}
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
			const payload = (await response.json()) as AnalysisResult;
			console.log("API Response:", payload);
			setResult(payload);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Nieoczekiwany błąd podczas analizy.";
			setError(message);
		} finally {
			setLoading(false);
			onAnalyzingChange?.(false);
		}
	}

	return (
		<div className="space-y-3">
			<button
				onClick={handleImageAnalysis}
				className="rounded border px-3 py-2"
				disabled={loading || !base64Image || !mimeType}
			>
				{loading ? "Analyzing..." : "Analyze"}
			</button>
			{error && <p className="text-sm text-red-600">{error}</p>}
			{result && <pre className="max-h-72 overflow-auto rounded bg-black/5 p-3 text-xs">{JSON.stringify(result, null, 2)}</pre>}
		</div>
	);
}
