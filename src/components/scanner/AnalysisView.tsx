"use client";
import { useState } from "react";
import { removeBackground } from "@imgly/background-removal"; // Używamy istniejącej biblioteki

// Typy dopasowane do odpowiedzi z /api/analyze-garments
type AnalysisItem = {
	detectedCategory: string;
	detectedColor: string;
	subType: string | null;
	styleContext: string[] | null;
	pattern: string | null;
	keyFeatures: string[];
	materials: string[];
	brand: string | null;
	description: string | null;
	confidence: number;
	// Dodatkowe pola jeśli potrzebne
};

type AnalysisSuccess = {
	success: true;
	items: AnalysisItem[];
	rawResponse?: string;
};

type AnalysisError = {
	error: string;
	status?: number;
};

type AnalysisResult = AnalysisSuccess | AnalysisError;

type AnalysisViewProps = {
	base64Image: string | null;
	mimeType: string | null;
	onAnalyzingChange?: (state: boolean) => void;
	onAnalysisComplete?: (data: AnalysisSuccess) => void; // Callback do przekazania wyników
};

export default function AnalysisView({ base64Image, mimeType, onAnalyzingChange, onAnalysisComplete }: AnalysisViewProps) {
	const [loading, setLoading] = useState(false);
	const [statusMessage, setStatusMessage] = useState("");
	const [result, setResult] = useState<AnalysisResult | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Helper: Base64 -> Blob (dla imgly)
	const base64ToBlob = async (base64: string, type: string) => {
		const res = await fetch(`data:${type};base64,${base64}`);
		return await res.blob();
	};

	// Helper: Blob -> Base64 (dla API)
	const blobToBase64 = (blob: Blob): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				if (typeof reader.result === "string") {
					// Usuń prefiks data URL
					const base64String = reader.result.split(",")[1];
					resolve(base64String);
				} else {
					reject(new Error("Nie udało się skonwertować blob na base64"));
				}
			};
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	};

	async function handleImageAnalysis() {
		if (!base64Image || !mimeType) {
			setError("Wybierz zdjęcie przed analizą.");
			return;
		}

		setLoading(true);
		onAnalyzingChange?.(true);
		setError(null);
		setResult(null);

		try {
			// KROK 1: Usuwanie tła (Frontend - @imgly)
			setStatusMessage("Usuwanie tła...");

			const originalBlob = await base64ToBlob(base64Image, mimeType);

			// Używamy @imgly/background-removal
			const cleanBlob = await removeBackground(originalBlob, {
				progress: (p: string) => {
					// Opcjonalnie: aktualizacja paska postępu
				},
			});

			const cleanBase64 = await blobToBase64(cleanBlob);

			// KROK 2: Analiza Ubrania (Backend)
			setStatusMessage("Analizowanie szczegółów...");

			// Używamy /api/analyze-garments dla pełnej logiki (termika, kolory, struktura)
			const response = await fetch("/api/analyze-garments", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					base64Image: cleanBase64, // Wysyłamy CZYSTE zdjęcie
					mimeType: "image/png", // Wynik z imgly to png
					lang: "en",
				}),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || "Błąd analizy API");
			}

			const data = (await response.json()) as AnalysisSuccess;

			if (data.success && Array.isArray(data.items)) {
				setResult(data);
				console.log("Wynik Analizy:", data);
				if (onAnalysisComplete) {
					onAnalysisComplete(data);
				}
			} else {
				throw new Error("Nie wykryto żadnych ubrań.");
			}
		} catch (err) {
			console.error("Proces analizy nie powiódł się:", err);
			const message = err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd.";
			setError(message);
		} finally {
			setLoading(false);
			onAnalyzingChange?.(false);
			setStatusMessage("");
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-2">
				<button
					onClick={handleImageAnalysis}
					className="w-full rounded bg-primary px-4 py-3 text-white hover:bg-primary/90 disabled:opacity-50 font-medium transition-colors"
					disabled={loading || !base64Image}
				>
					{loading ? (
						<span className="flex items-center justify-center gap-2">
							<svg
								className="animate-spin h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							{statusMessage || "Przetwarzanie..."}
						</span>
					) : (
						"Analizuj Ubranie"
					)}
				</button>
			</div>

			{error && <div className="rounded bg-red-50 p-3 text-sm text-red-600 border border-red-100">{error}</div>}

			{/* Podgląd wyniku (Debug / Dev mode) */}
			{result && "items" in result && (
				<div className="rounded border bg-green-50 p-3 text-sm overflow-hidden">
					<p className="font-semibold text-green-800 mb-2">Sukces!</p>
					<p>Wykryto {result.items.length} element(ów).</p>
					<pre className="mt-2 max-h-60 overflow-auto text-xs bg-white/50 p-2 rounded border border-green-100">
						{JSON.stringify(result.items, null, 2)}
					</pre>
				</div>
			)}
		</div>
	);
}
