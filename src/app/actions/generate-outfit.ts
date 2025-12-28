"use server";

import { createClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";

// Server-side only
const GEMINI_API_KEY = process.env.FREE_GEMINI_KEY;

if (!GEMINI_API_KEY) {
	console.error("❌ FREE_GEMINI_KEY is not configured in environment variables");
}

// Używamy v1 + 2.5-flash-lite
const genAI = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY, apiVersion: "v1" }) : null;

export async function generateDailyOutfits(userId: string, weatherDescription: string, temperature: number) {
	const supabase = await createClient();
	const today = new Date().toISOString().split("T")[0];

	console.log(`✔ ${weatherDescription}, ${temperature}°C`);

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
		// FIX: Zmieniono 'materials' na 'material' (błąd z poprzedniego loga)
		const { data: wardrobe, error: wardrobeError } = await supabase
			.from("garments")
			.select("id, name, category, subcategory, image_url, main_color_name, brand, material")
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
			type: `${g.main_color_name} ${g.subcategory || g.category} (${g.name})`,
			// FIX: Bezpieczna obsługa pola material
			context: `Brand: ${g.brand || "Unknown"}, Material: ${Array.isArray(g.material) ? g.material.join(", ") : g.material || "Standard"}`,
		}));

		// --- 4. ZAPYTANIE DO AI ---
		if (!genAI) {
			throw new Error("Gemini client not initialized");
		}
		console.log(`✔ ${weatherDescription}, ${temperature}°C`);
		console.log(`✔ ${JSON.stringify(wardrobeLite)}`);
		const prompt = `
            ROLE: You are a world-class Sartorial Men's Fashion Stylist (Old Money & Italian Sprezzatura expert).
            
            CONTEXT:
            - User Wardrobe: ${JSON.stringify(wardrobeLite)}
            - Weather: ${weatherDescription}, ${temperature}°C.

            STRICT WEATHER RULES:
            - If Temp < 10°C: Layering and Outerwear (Coat/Jacket) are MANDATORY. MUST include a Coat/Jacket/Outerwear layer. No t-shirts as outer layer.
            - If Temp < 5°C: Scarves/Gloves recommended if available.
            - If Temp > 25°C: No heavy wool, no coats. Breathable fabrics only.
            - Match colors to the weather vibe.
			- If Rainy: Suggest water-resistant items if available.
			- If Windy: Suggest windbreaker or layered outfits.
			- If Snowy: Suggest warm, insulated outfits with boots if available.
			- If Sunny: Suggest lighter colors and breathable fabrics.
			- Each outfit MUST be weather-appropriate.
			- Each outfit MUST consists of shoes, trouser, and top layers at minimum.

			OBJECTIVE:
			Create 3 DISTINCT outfits strictly from the provided wardrobe IDs that fit the weather conditions.

            TASK: Create 3 DISTINCT outfits strictly from the provided wardrobe IDs.
            
            STYLES:
            1. "Casual" (Refined weekend look)
            2. "Smart Casual" (Office or Dinner - "Old Money" vibe)
            3. "Casual/Smart Casual" (More flexibility based on wardrobe)

            OUTPUT FORMAT REQUIREMENTS:
            - "description": A concise, sartorial description (max 2 sentences). Explain WHY it works. Example: "Combining the navy wool blazer with beige chinos creates a timeless club aesthetic."
            - "garment_ids": EXACT IDs from the input list. DO NOT HALLUCINATE ITEMS.
            - Return ONLY a raw JSON array.

            Example Output:
            [
                {
                    "name": "Smart Casual",
                    "description": "This pairing of a charcoal cashmere sweater with raw denim offers texture and warmth.",
                    "garment_ids": ["id_1", "id_2", "id_3", "id_4"]
                }
            ]
        `;

		const response = await genAI.models.generateContent({
			model: "gemini-2.5-flash-lite",
			contents: [{ role: "user", parts: [{ text: prompt }] }],
		});

		// Pobieranie tekstu
		let text = "";
		if (typeof response.text === "function") text = response.text();
		else if (typeof response.text === "string") text = response.text;
		else if (response.candidates?.[0]?.content?.parts?.[0]?.text) text = response.candidates[0].content.parts[0].text;

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

				// Fail-safe na pogodę
				const hasOuterwear = validGarments.some((g: any) => g.category === "Outerwear" || g.category === "Jacket" || g.category === "Coat");
				if (temperature < 10 && !hasOuterwear) {
					outfit.name += " (Light Layer)";
				}

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
