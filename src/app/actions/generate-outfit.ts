"use server";

import { createClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";

// Server-side only
const GEMINI_API_KEY = process.env.FREE_GEMINI_KEY;

if (!GEMINI_API_KEY) {
	console.error("❌ FREE_GEMINI_KEY is not configured in environment variables");
}

// FIX: Używamy dokładnie tej samej konfiguracji co w analyze-garments (v1 + 2.5-flash-lite)
const genAI = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY, apiVersion: "v1" }) : null;

export async function generateDailyOutfits(userId: string, weatherDescription: string, temperature: number) {
	const supabase = await createClient();
	const today = new Date().toISOString().split("T")[0];

	try {
		// --- 1. SPRAWDZENIE CACHE ---
		const { data: existingEntry } = await supabase
			.from("daily_suggestions")
			.select("suggestions")
			.eq("user_id", userId)
			.eq("date", today)
			.maybeSingle();

		if (existingEntry?.suggestions) {
			console.log("✅ Returning cached outfit suggestions.");
			return existingEntry.suggestions;
		}

		// --- 2. POBRANIE SZAFY ---
		const { data: wardrobe, error: wardrobeError } = await supabase
			.from("garments")
			.select("id, name, category, subcategory, image_url, main_color_name")
			.eq("user_id", userId);

		if (wardrobeError) {
			console.error("❌ Error fetching wardrobe:", wardrobeError);
			return [];
		}

		if (!wardrobe || wardrobe.length < 2) {
			console.log("⚠️ Wardrobe too small (<2 items).");
			return [];
		}

		// --- 3. PRZYGOTOWANIE DANYCH ---
		const wardrobeLite = wardrobe.map((g) => ({
			id: g.id,
			description: `${g.name} (${g.main_color_name}, ${g.category}${g.subcategory ? ` - ${g.subcategory}` : ""})`,
		}));

		// --- 4. ZAPYTANIE DO AI ---
		if (!genAI) {
			throw new Error("Gemini client not initialized");
		}

		const prompt = `
            You are a professional fashion stylist.
            User Wardrobe (JSON): ${JSON.stringify(wardrobeLite)}
            Current Weather: ${weatherDescription}, ${temperature}°C.

            Task: Create 3 DISTINCT outfits suitable for this weather using ONLY the items from the wardrobe list above.
            
            Types:
            1. "Casual" (Everyday wear)
            2. "Smart/Elegant" (Work or Date)
            3. "Experimental/Comfort" (Relaxed or bold mix)

            Requirements:
            - Use ONLY the provided 'id's. Do not invent items.
            - Each outfit must be complete.
            - Return ONLY a valid JSON array. No markdown formatting.
            - Do NOT wrap response in \`\`\`json blocks.

            Output Format (JSON Array):
            [
                {
                    "name": "Casual",
                    "description": "Brief explanation...",
                    "garment_ids": ["id_1", "id_2"]
                }
            ]
        `;

		// FIX: Używamy modelu gemini-2.5-flash-lite, który działa w Twoim route.ts
		const response = await genAI.models.generateContent({
			model: "gemini-2.5-flash-lite",
			contents: [
				{
					role: "user",
					parts: [{ text: prompt }],
				},
			],
		});

		// Pobieranie tekstu - logika hybrydowa (dla pewności, bo SDK bywa kapryśne)
		let text = "";

		// 1. Próba standardowa (funkcja)
		if (typeof response.text === "function") {
			text = response.text();
		}
		// 2. Próba property (czasem w v1 zwraca string bezpośrednio)
		else if (typeof response.text === "string") {
			text = response.text;
		}
		// 3. Próba candidates (surowa odpowiedź)
		else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
			text = response.candidates[0].content.parts[0].text;
		}

		// Czyszczenie formatowania Markdown
		text = text
			.replace(/```json/g, "")
			.replace(/```/g, "")
			.trim();

		let suggestions = [];
		try {
			suggestions = JSON.parse(text);
		} catch (e) {
			console.error("❌ Failed to parse AI JSON:", text);
			return [];
		}

		if (!Array.isArray(suggestions)) return [];

		// --- 5. HYDRACJA DANYCH ---
		const fullSuggestions = suggestions
			.map((outfit: any) => {
				const validGarments = (outfit.garment_ids || [])
					.map((id: string) => wardrobe.find((g) => g.id === id))
					.filter((g: any) => g !== undefined);

				return {
					name: outfit.name || "Outfit",
					description: outfit.description || "",
					garments: validGarments,
				};
			})
			.filter((outfit) => outfit.garments.length > 0);

		// --- 6. ZAPIS DO CACHE ---
		if (fullSuggestions.length > 0) {
			const { error: upsertError } = await supabase.from("daily_suggestions").upsert(
				{
					user_id: userId,
					date: today,
					suggestions: fullSuggestions,
					weather_snapshot: { temp: temperature, desc: weatherDescription },
				},
				{ onConflict: "user_id, date" }
			);

			if (upsertError) console.error("Error caching suggestions:", upsertError);
		}

		return fullSuggestions;
	} catch (error) {
		console.error("❌ Unexpected error in generateDailyOutfits:", JSON.stringify(error, null, 2));
		return [];
	}
}
