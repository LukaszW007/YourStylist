import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { translateCategory, translateColor, isCategoryAllowed } from "@/lib/i18n/wardrobeTranslations";

// Server-side only - NOT exposed to browser
const GEMINI_API_KEY = process.env.FREE_GEMINI_KEY;

if (!GEMINI_API_KEY) {
	console.error("FREE_GEMINI_KEY is not configured in environment variables");
}

// Initialize new GenAI client (stable API v1)
const genAI = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY, apiVersion: "v1" }) : null;

const SYSTEM_PROMPT = `You are an expert AI fashion analyst and stylist. Analyze the image and detect ALL visible clothing items.

For EACH item return a JSON object with EXACTLY these fields (flat, no extra text before/after the array). Each field may use the examples given, but is NOT limited to them (except style_context and pattern which MUST be chosen from their fixed lists):
1. type                -> General category (e.g. "Shirt", "Jeans", "Jacket", "Sneakers", "Dress", "Skirt", "Coat", "Sweater", "Hoodie"). Use singular.
2. sub_type            -> Specific style descriptor (e.g. "Oxford Shirt", "Bomber Jacket", "Slim Fit Jeans", "Low-top Sneakers"). If unknown use an empty string.
3. style_context       -> One of EXACTLY: Formal | Business Casual | Smart Casual | Streetwear | Minimalist | Sportswear | Utility/Military | Western/Country | Vintage | Outdoor | Techwear
4. main_color_name     -> Precise dominant color name (avoid generic terms: prefer "Navy Blue", "Light Blue", "Olive Green", "Charcoal Gray", "Off-White", "Burnt Orange", "Dusty Rose", etc.)
5. main_color_hex      -> 9 char HEX (#RRGGBB or #RRGGBBAA). Include alpha ONLY if visibly translucent.
6. main_color_rgba     -> RGBA string matching the hex (e.g. "rgba(174,198,234,1.0)").
7. secondary_colors    -> Array of objects: [{ "name": "White", "hex": "#FFFFFF" }, ...] (empty array [] if none clearly present). Max 4.
8. pattern             -> MUST be one of: Chalk Stripe | Pinstripe | Houndstooth | Herringbone | Plaid | Paisley | Barleycorn | Floral | Windowpane | Sharkskin | Glen Check | Nailhead | Gingham | Dot | Twill | Tartan | Shepherd's Check | Graph Check | Tattersall | Madras | Birdseye | Awning Stripe | Bengal Stripe | Candy Stripe | Pencil Stripe | Solid | Undefined
9. key_features        -> Array of concise feature strings (zippers, pockets, logos, stitching, closures, collars, cuffs, trims, seams, ventilation, reflective, insulation). Prefer <= 8 items.
10. material_guess     -> Dominant material (choose ONE): Cotton | Denim | Wool | Leather | Linen | Silk | Synthetic | Polyester | Nylon | Fleece | Suede | Canvas
11. confidence         -> Integer 0-100 (omit items below 60 entirely).

Return ONLY a JSON array: [ { ... }, { ... } ] with those keys. NO markdown fences, NO commentary.
Limit to MAX 10 items. If nothing valid: return []. Exclude underwear and socks entirely.

Example (abbreviated):
[
  {
    "type": "Shirt",
    "sub_type": "Oxford Shirt",
    "style_context": "Smart Casual",
    "main_color_name": "Light Blue",
    "main_color_hex": "#AEC6EA",
    "main_color_rgba": "rgba(174,198,234,1.0)",
    "secondary_colors": [],
    "pattern": "Solid",
    "key_features": ["Button-down collar", "Chest pocket"],
    "material_guess": "Cotton",
    "confidence": 94
  }
]

Be STRICT with field names. Do NOT invent or rename fields. If a value is unknown use an empty string ("") for strings or [] for arrays.`;

export async function POST(request: NextRequest) {
	try {
		if (!genAI) {
			return NextResponse.json({ error: "Gemini API is not configured on server" }, { status: 500 });
		}

		const body = await request.json();
		const { base64Image, mimeType, lang = "en" } = body;

		if (!base64Image || !mimeType) {
			return NextResponse.json({ error: "Missing base64Image or mimeType" }, { status: 400 });
		}

		// Validate language
		if (!["en", "pl", "no"].includes(lang)) {
			return NextResponse.json({ error: "Invalid language. Supported: en, pl, no" }, { status: 400 });
		}

		console.log("[API] Starting Gemini AI analysis...");

		// New @google/genai API call using models.generateContent
		const response = await genAI.models.generateContent({
			model: "gemini-2.5-flash-lite",
			contents: [
				{
					role: "user",
					parts: [{ inlineData: { mimeType, data: base64Image } }, { text: SYSTEM_PROMPT }],
				},
			],
		});

		// Fallback text extraction: try response.text first, then parse candidates
		let text = response.text ?? "";

		if (!text && response.candidates?.[0]?.content?.parts) {
			const parts = response.candidates[0].content.parts;
			text = parts.map((p: { text?: string }) => p.text || "").join("");
			console.log("[API] Extracted text from response.candidates[0].content.parts");
		}

		if (!text) {
			console.error("[API] Empty response from Gemini");
			return NextResponse.json({ error: "Empty response from Gemini AI" }, { status: 500 });
		}

		console.log("[API] Raw Gemini response:", text.substring(0, 200) + "...");

		// Clean the response - remove markdown code blocks
		let cleanedText = text.trim();

		if (cleanedText.startsWith("```json")) {
			cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
		} else if (cleanedText.startsWith("```")) {
			cleanedText = cleanedText.replace(/```\n?/g, "");
		}

		cleanedText = cleanedText.trim();

		// Parse JSON (support new extended color fields + backward compatibility)
		let parsedData: Array<{
			type: string;
			sub_type?: string;
			style_context?: string;
			main_color?: string; // legacy
			main_color_name?: string;
			main_color_hex?: string;
			main_color_rgba?: string;
			secondary_colors?: Array<string | { name?: string; hex?: string; rgba?: string }>;
			pattern?: string;
			key_features?: string[];
			material_guess?: string;
			confidence: number;
		}>;

		try {
			parsedData = JSON.parse(cleanedText);
		} catch (parseError) {
			console.error("[API] JSON parse error:", parseError);

			// Try to extract JSON array from the text
			const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
			if (jsonMatch) {
				console.log("[API] Found JSON array in text");
				parsedData = JSON.parse(jsonMatch[0]);
			} else {
				return NextResponse.json({ error: "Invalid JSON response from Gemini", rawResponse: cleanedText.substring(0, 500) }, { status: 500 });
			}
		}

		if (!Array.isArray(parsedData)) {
			return NextResponse.json({ error: "Response is not an array", rawResponse: cleanedText.substring(0, 500) }, { status: 500 });
		}

		console.log(`[API] Successfully detected ${parsedData.length} items`);

		// Filter out excluded categories (underwear, socks) and translate
		const items = await Promise.all(
			parsedData
				.filter((item) => isCategoryAllowed(item.type))
				.map(async (item, index) => {
					// Determine color name (new or legacy)
					const rawColorName = item.main_color_name || item.main_color || "";
					const translatedColorName = rawColorName ? await translateColor(rawColorName, lang as "en" | "pl" | "no") : "";
					// Normalize secondary colors
					const secondaryColors = (item.secondary_colors || []).map((c) => {
						if (typeof c === "string") {
							return { name: c };
						}
						return { name: c.name, hex: c.hex, rgba: c.rgba };
					});
					return {
						id: `item_${Date.now()}_${index}`,
						detectedCategory: await translateCategory(item.type, lang as "en" | "pl" | "no"),
						detectedColor: translatedColorName,
						colorName: translatedColorName,
						colorHex: item.main_color_hex || null,
						colorRgba: item.main_color_rgba || null,
						secondaryColors,
						subType: item.sub_type || null,
						styleContext: item.style_context || null,
						pattern: item.pattern || null,
						keyFeatures: item.key_features || [],
						materialGuess: item.material_guess || null,
						confidence: item.confidence / 100, // 0-1
					};
				})
		);

		console.log(`[API] Returning ${items.length} items after filtering (removed underwear/socks)`);

		return NextResponse.json({
			success: true,
			items,
			rawResponse: text,
		});
	} catch (error) {
		console.error("[API] Analysis error:", error);

		// Precise error handling for ApiError from @google/genai
		if (error && typeof error === "object" && "status" in error) {
			const apiError = error as { status?: number; message?: string };
			return NextResponse.json(
				{
					error: apiError.message || "Gemini API error",
					status: apiError.status,
				},
				{ status: apiError.status || 500 }
			);
		}

		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Unknown error occurred",
			},
			{ status: 500 }
		);
	}
}
