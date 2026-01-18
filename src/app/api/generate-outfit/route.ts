import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { serverEnv } from "@/env";
import { GarmentBase, LayerType } from "@/types/garment";
import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "@/lib/ai/config";

// ========== INTERFACES ==========

interface RequestBody {
	userId: string;
	weatherTemp: number; // Apparent temperature in Celsius
	isRaining: boolean;
}

type OutfitGenerationStrategy = "FULL_WINTER" | "MID_OR_OUTER_CHOICE" | "BASE_ONLY";

// ========== HELPERS ==========

/**
 * Determines the list of potential garment layers to fetch from the database based on weather.
 * @param temp - The apparent temperature in Celsius.
 * @param isRaining - A boolean indicating if it is raining.
 * @returns An array of layer types to be fetched.
 */
function getLayeringTemplate(temp: number, isRaining: boolean): LayerType[] {
	const layers: LayerType[] = ["base", "bottom", "shoes"];

	// For mild weather, provide both mid and outer layers as options for the AI
	if (temp >= 14 && temp <= 20 && !isRaining) {
		layers.push("mid", "outer");
	} else if (temp < 14) {
		layers.push("mid", "outer");
	} else if (temp > 20 && temp < 25) {
		// Warm, but maybe a light jacket is an option
		layers.push("outer");
	}

	// If it's raining, an outer layer is non-negotiable unless it's very hot
	if (isRaining && temp < 25 && !layers.includes("outer")) {
		layers.push("outer");
	}

	return layers;
}

/**
 * Constructs the prompt for the Gemini AI model based on a dynamic strategy.
 * @param garments - A list of available garments.
 * @param strategy - The generation strategy ('FULL_WINTER', 'MID_OR_OUTER_CHOICE', 'BASE_ONLY').
 * @param isRaining - A boolean indicating if it is raining.
 * @returns A formatted prompt string.
 */
function constructPrompt(garments: GarmentBase[], strategy: OutfitGenerationStrategy, isRaining: boolean): string {
	const context =
		"You are an expert fashion stylist AI. Create a stylish, coherent outfit from the provided list of clothes. Pay close attention to the `color_temperature` (Warm, Cool, Neutral) of the garments to ensure the colors are well-coordinated and harmonious. For example, pair warm colors with other warm or neutral colors.";
	let task = "";
	const weatherContext = isRaining
		? "IMPORTANT: It is raining. You MUST select an 'outer' layer appropriate for rain (e.g., a waterproof jacket). Avoid materials like suede."
		: "";

	const coreLayers = "['base', 'bottom', 'shoes']";

	switch (strategy) {
		case "FULL_WINTER":
			task = `Select one garment ID for each required layer: ['base', 'mid', 'outer', 'bottom', 'shoes']. You must pick all of them. ${weatherContext}`;
			break;
		case "MID_OR_OUTER_CHOICE":
			task = `You must select one garment ID for each of these core layers: ${coreLayers}. Then, to complete the top, you have a choice: select EITHER one 'mid' layer (like a sweater) OR one 'outer' layer (like a light jacket). Do NOT select both 'mid' and 'outer'. The choice should be based on style and creating the best look. ${weatherContext}`;
			break;
		case "BASE_ONLY":
		default:
			task = `Select one garment ID for each required layer: ${coreLayers}. Do not add any other layers. ${weatherContext}`;
			break;
	}

	const garmentData = JSON.stringify(
		garments.map((g) => ({
			id: g.id,
			name: g.name,
			category: g.category,
			subcategory: g.subcategory,
			color: g.main_color_name || "unknown",
			color_temperature: g.color_temperature || "Neutral",
			layer: g.layer_type,
			style: g.style_context || "casual",
			pattern: g.pattern || "solid",
		}))
	);

	const outputInstruction = `Return ONLY a valid JSON object mapping the layer name to the chosen garment ID. Example: {"base": "id-123", "bottom": "id-456", "shoes": "id-789", "mid": "id-abc"}`;
	return `${context}\n\n${task}\n\nAvailable Garments:\n${garmentData}\n\n${outputInstruction}`;
}

export async function POST(request: Request) {
	try {
		const { userId, weatherTemp, isRaining }: RequestBody = await request.json();
		if (!userId || typeof weatherTemp !== "number") {
			return NextResponse.json({ error: "Invalid input" }, { status: 400 });
		}

		// 1. Determine strategy and layers to fetch
		let strategy: OutfitGenerationStrategy;
		const coreRequiredLayers: LayerType[] = ["base", "bottom", "shoes"];

		if (weatherTemp < 14) {
			strategy = "FULL_WINTER";
		} else if (weatherTemp >= 14 && weatherTemp <= 20 && !isRaining) {
			strategy = "MID_OR_OUTER_CHOICE";
		} else {
			strategy = "BASE_ONLY";
		}
		// If it's raining in mild/warm weather, we just force an outer layer, simplifying the choice
		if (isRaining && weatherTemp >= 14) {
			strategy = "BASE_ONLY"; // The template will add 'outer'
		}

		const potentialLayers = getLayeringTemplate(weatherTemp, isRaining);

		// 2. Fetch all potential garments
		const supabase = await createClient();
		const { data: allGarments, error } = await supabase
			.from("garments")
			.select(
				"id, name, category, subcategory, layer_type, main_color_name, color_temperature, pattern, style_context, image_url, comfort_min_c, comfort_max_c"
			)
			.eq("user_id", userId)
			.in("layer_type", potentialLayers);

		if (error) throw new Error(error.message);
		if (!allGarments?.length) return NextResponse.json({ error: "Empty wardrobe for the required layers." }, { status: 404 });

		// 3. Filter garments in JS based on nuanced rules
		const filteredGarments = (allGarments as GarmentBase[]).filter((g) => {
			if (g.layer_type === "outer") {
				if (isRaining && weatherTemp < 25) return true; // For rain, we need waterproof options regardless of temp

				// Lightweight outer layers for mild weather
				if (weatherTemp >= 14 && weatherTemp <= 20) {
					return g.comfort_max_c === null || g.comfort_max_c >= 15;
				}
				// Standard winter outer layers
				if (weatherTemp < 14) {
					return g.comfort_min_c === null || g.comfort_min_c <= weatherTemp;
				}
				// Don't include heavy outer layers if it's warm
				return false;
			}
			return true;
		});

		if (filteredGarments.length === 0) {
			return NextResponse.json({ error: "No suitable garments found after filtering." }, { status: 404 });
		}

		// 4. AI Generation
		const geminiKey = serverEnv.freeGeminiKey;
		if (!geminiKey) throw new Error("GEMINI_API_KEY is not configured.");

		const genAI = new GoogleGenAI({ apiKey: geminiKey });

		const prompt = constructPrompt(filteredGarments, strategy, isRaining);

		console.log('filteredGarments', filteredGarments)

		const result = await genAI.models.generateContent({
			model: AI_CONFIG.OUTFIT_GENERATION.model,
			config: { responseMimeType: "application/json" },
			contents: [{ role: 'user', parts: [{ text: prompt }] }]
		});
		
		let responseText = "";
		if (result.candidates?.[0]?.content?.parts) {
			responseText = result.candidates[0].content.parts.map((p: any) => p.text || "").join("");
		}

		const selectedIds = JSON.parse(responseText) as Record<string, string>;

		// 5. Validate and map the result
		const finalOutfit: Record<string, GarmentBase> = {};
		const selectedLayers = Object.keys(selectedIds);

		// Core validation
		for (const layer of coreRequiredLayers) {
			if (!selectedLayers.includes(layer)) {
				throw new Error(`AI response missing core layer: ${layer}`);
			}
		}

		// Strategy-based validation
		if (strategy === "MID_OR_OUTER_CHOICE") {
			const hasMid = selectedLayers.includes("mid");
			const hasOuter = selectedLayers.includes("outer");
			if ((hasMid && hasOuter) || (!hasMid && !hasOuter)) {
				throw new Error("AI failed the 'mid OR outer' choice constraint.");
			}
		} else if (strategy === "FULL_WINTER") {
			if (!selectedLayers.includes("mid") || !selectedLayers.includes("outer")) {
				throw new Error("AI response missing mid or outer layer for winter strategy.");
			}
		}

		// Map IDs to full garment objects
		for (const layer of selectedLayers) {
			const id = selectedIds[layer];
			const garment = filteredGarments.find((g) => g.id === id);
			if (garment) {
				finalOutfit[layer] = garment;
			} else {
				throw new Error(`AI selected a garment ID (${id}) that was not in the provided list.`);
			}
		}

		return NextResponse.json(finalOutfit);
	} catch (error: unknown) {
		let errorMessage = "An unknown error occurred during outfit generation.";
		if (error instanceof Error) {
			errorMessage = error.message;
		}
		console.error("Outfit Generation Error:", errorMessage);
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
