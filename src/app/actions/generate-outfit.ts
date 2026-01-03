"use server";

import { createClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";
import { getSeason, isGarmentWeatherAppropriate } from "@/lib/utils/weather-season";

// Server-side only
const GEMINI_API_KEY = process.env.FREE_GEMINI_KEY;

if (!GEMINI_API_KEY) {
	console.error("❌ FREE_GEMINI_KEY is not configured in environment variables");
}

// Używamy v1 + 2.5-flash-lite
const genAI = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY, apiVersion: "v1" }) : null;

export async function generateDailyOutfits(
  userId: string, 
  weatherDescription: string, 
  temperature: number,
  lat?: number // Dodajemy lat/lon do kontekstu jeśli dostępne, domyślnie 52 (Warszawa)
) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const userLat = lat || 52.0; // Fallback na półkulę północną
  const currentSeason = getSeason(userLat);

  console.log(`🌍 Location Lat: ${userLat}, Season: ${currentSeason}, Temp: ${temperature}°C`);

  try {
    // 1. CHECK CACHE
    const { data: existingEntry } = await supabase
      .from("daily_suggestions")
      .select("suggestions")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();

    if (existingEntry?.suggestions) {
      return existingEntry.suggestions;
    }

    // 2. POBRANIE SZAFY (Więcej pól!)
    const { data: wardrobe, error: wardrobeError } = await supabase
      .from("garments")
      .select("id, name, category, subcategory, image_url, main_color_name, brand, material, layer_type, comfort_min_c, comfort_max_c, season")
      .eq("user_id", userId);

    if (wardrobeError || !wardrobe || wardrobe.length < 2) return [];

    // 3. HARD FILTERING (Sartorial Guard)
    // Nie wysyłamy do AI sandałów, jeśli jest -8 stopni. Oszczędzamy tokeny i eliminujemy błędy.
    const validGarments = wardrobe.filter(g => isGarmentWeatherAppropriate(g, temperature, currentSeason));
    
    // Sprawdź czy mamy w ogóle z czego budować
    const hasCoats = validGarments.some(g => g.category === 'outerwear' || g.layer_type === 'outer' || g.subcategory?.toLowerCase().includes('coat') || g.subcategory?.toLowerCase().includes('jacket'));
    const hasShoes = validGarments.some(g => g.category === 'shoes' || g.category === 'footwear');

    if (temperature < 10 && !hasCoats) {
        console.warn("⚠️ Użytkownik nie ma kurtek w szafie na tę pogodę!");
        // Tutaj można by zwrócić specjalny komunikat do UI, ale na razie puszczamy to co jest
    }

    // 4. PRZYGOTOWANIE PAYLOADU DLA AI
    // Wysyłamy TYLKO istotne pola, ale precyzyjnie opisane
    const wardrobePayload = validGarments.map((g) => ({
      id: g.id,
      txt: `${g.main_color_name} ${g.subcategory || g.category} (${g.name})`,
      cat: g.category.toLowerCase(), // top, bottom, shoes, outerwear
      layer: g.layer_type || 'unknown', // base, mid, outer
      mat: Array.isArray(g.material) ? g.material.join(", ") : "Standard",
    }));

    // 5. ZAPYTANIE DO AI (Structured Prompt)
    if (!genAI) throw new Error("Gemini client not initialized");

    const needsCoat = temperature < 12;
    const needsWarmShoes = temperature < 5;

    const prompt = `
      You are a strict Sartorial AI Stylist. 
      CONTEXT: Weather is ${weatherDescription}, ${temperature}°C, Season: ${currentSeason}.
      
      RULES:
      1.  It is ${temperature}°C. ${needsCoat ? "User MUST wear an OUTER layer (Coat/Jacket)." : "Light layers are fine."}
      2.  ${needsWarmShoes ? "Select boots or warm leather shoes. NO sneakers if possible." : ""}
      3.  Outfit MUST have: 1 Shoes + 1 Bottom + 1 Top + ${needsCoat ? "1 Outerwear" : "(Optional Outerwear)"}.
      4.  Do not mix clashing formalities (e.g. no Suit Jacket with Sweatpants).

      INVENTORY (JSON):
      ${JSON.stringify(wardrobePayload)}

      TASK:
      Generate 3 distinct outfits.
      Return strictly a JSON array. Each object must have:
      - "name": string
      - "description": string (explain why it fits ${temperature}°C)
      - "garment_ids": array of strings (The UUIDs)

      Example Output:
      [
        { "name": "Winter Smart", "description": "...", "garment_ids": ["uuid-shoe", "uuid-pant", "uuid-shirt", "uuid-coat"] }
      ]
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Użyj stabilnego modelu
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json|```/g, "").trim();

    const suggestions = JSON.parse(responseText);

    // 6. HYDRACJA I VALIDACJA KOŃCOWA
    const fullSuggestions = suggestions.map((outfit: any) => {
        // Mapujemy ID na pełne obiekty
        const hydratedGarments = (outfit.garment_ids || [])
            .map((id: string) => wardrobe.find(g => g.id === id))
            .filter(Boolean);

        // OSTATECZNY CHECK: Czy AI posłuchało o kurtce?
        const hasOuter = hydratedGarments.some((g:any) => 
            g.layer_type === 'outer' || 
            ['outerwear', 'jacket', 'coat'].includes(g.category.toLowerCase()) ||
            ['coat', 'jacket', 'parka'].some(t => g.subcategory?.toLowerCase().includes(t))
        );

        // Jeśli jest -8C i nie ma kurtki, a w szafie były kurtki - odrzucamy ten outfit jako błędny
        if (temperature < 5 && !hasOuter && hasCoats) {
            console.warn(`⚠️ Odrzucono outfit "${outfit.name}" - brak kurtki przy ${temperature}°C`);
            return null; 
        }

        return {
            name: outfit.name,
            description: outfit.description,
            garments: hydratedGarments
        };
    }).filter(Boolean); // Usuwamy null-e

    // ... ZAPIS DO BAZY (bez zmian) ...
    if (fullSuggestions.length > 0) {
        await supabase.from("daily_suggestions").upsert({
            user_id: userId,
            date: today,
            suggestions: fullSuggestions,
            weather_snapshot: { temp: temperature, desc: weatherDescription },
        }, { onConflict: "user_id, date" });
    }

    return fullSuggestions;

  } catch (error) {
    console.error("❌ Generate Outfit Error:", error);
    return [];
  }
}