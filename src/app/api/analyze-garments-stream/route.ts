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

const SYSTEM_PROMPT = `You are an expert AI fashion analyst and stylist. Your goal is to meticulously analyze images of clothing to extract detailed attributes that are crucial for styling and wardrobe management.

Analyze the image and detect all visible clothing items. For each item, provide:
1. **type**: The general category (e.g., "Shirt", "Jeans", "Jacket", "Sneakers").
2. **sub_type**: The specific style of the item (e.g., "Dress Shirt", "Bomber Jacket", "Chinos", "Chukka Boots", "Oxford Shirt").
3. **style_context**: The primary fashion style this item belongs to (e.g., "Formal", "Business Casual", "Smart Casual", "Streetwear", "Minimalist", "Sportswear", "Utility/Military", "Western/Country").
4. **main_color**: The single, dominant color using a PRECISE descriptive name (e.g., "Navy Blue", "Beige", "Olive Green", "Burgundy", "Charcoal Gray", "Off-White"). DO NOT use generic names like "Blue" or "Red".
5. **secondary_colors**: A JSON array of other significant colors present (e.g., ["White", "Red"] for a logo, or [] if none).
6. **pattern**: The pattern of the fabric (e.g., "Solid", "Striped", "Checked", "Windowpane", "Herringbone", "Floral", "Camouflage").
7. **key_features**: A JSON array of specific details that define the item's character (e.g., "Button-down collar", "Zip-up closure", "Cargo pockets", "Logo on left chest", "Snap buttons", "Hood").
8. **material_guess**: A best guess of the primary material (e.g., "Cotton", "Denim", "Wool", "Leather", "Linen", "Synthetic").
9. **confidence**: Your confidence level (0-100).

Return ONLY a valid JSON array with this exact structure. Do not include markdown code blocks or any text before or after the array.

Example response:
[
  {
    "type": "Shirt",
    "sub_type": "Oxford Shirt",
    "style_context": "Smart Casual",
    "main_color": "Light Blue",
    "secondary_colors": [],
    "pattern": "Solid",
    "key_features": ["Button-down collar", "Chest pocket"],
    "material_guess": "Cotton",
    "confidence": 95
  }
]

Rules:
- Return ONLY the JSON array.
- Be highly specific with color names, sub-types, and features.
- Return an empty array [] if no valid clothing is detected.
- Focus on clothing, footwear, and listed accessories (bags, ties, scarves, belts, hats, caps, gloves).
- Maximum 10 items per image.
- Only return items with confidence > 60.`;

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

		console.log("[API Stream] Starting Gemini AI streaming analysis...");

		// Create a ReadableStream for Server-Sent Events
		const stream = new ReadableStream({
			async start(controller) {
				try {
					const responseStream = await genAI.models.generateContentStream({
						model: "gemini-2.5-flash-lite",
						contents: [
							{
								role: "user",
								parts: [{ inlineData: { mimeType, data: base64Image } }, { text: SYSTEM_PROMPT }],
							},
						],
					});

					let fullText = "";

					for await (const chunk of responseStream) {
						const chunkText = chunk.text ?? "";
						fullText += chunkText;

						// Send progress update
						const data = JSON.stringify({
							type: "chunk",
							text: chunkText,
							progress: fullText.length,
						});
						controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
					}

					console.log("[API Stream] Received complete response, parsing...");

					// Parse the complete response
					let cleanedText = fullText.trim();

					if (cleanedText.startsWith("```json")) {
						cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
					} else if (cleanedText.startsWith("```")) {
						cleanedText = cleanedText.replace(/```\n?/g, "");
					}

					cleanedText = cleanedText.trim();

					// Parse JSON
					let parsedData: Array<{
						type: string;
						sub_type?: string;
						style_context?: string;
						main_color: string;
						secondary_colors?: string[];
						pattern?: string;
						key_features?: string[];
						material_guess?: string;
						confidence: number;
					}>;

					try {
						parsedData = JSON.parse(cleanedText);
					} catch (parseError) {
						console.error("[API Stream] JSON parse error:", parseError);

						// Try to extract JSON array from the text
						const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
						if (jsonMatch) {
							console.log("[API Stream] Found JSON array in text");
							parsedData = JSON.parse(jsonMatch[0]);
						} else {
							const errorData = JSON.stringify({
								type: "error",
								error: "Invalid JSON response from Gemini",
								rawResponse: cleanedText.substring(0, 500),
							});
							controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
							controller.close();
							return;
						}
					}

					if (!Array.isArray(parsedData)) {
						const errorData = JSON.stringify({
							type: "error",
							error: "Response is not an array",
							rawResponse: cleanedText.substring(0, 500),
						});
						controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
						controller.close();
						return;
					}

					console.log(`[API Stream] Successfully detected ${parsedData.length} items`);

					// Filter out excluded categories (underwear, socks) and translate
					const items = await Promise.all(
						parsedData
							.filter((item) => isCategoryAllowed(item.type))
							.map(async (item, index) => ({
								id: `item_${Date.now()}_${index}`,
								detectedCategory: await translateCategory(item.type, lang as "en" | "pl" | "no"),
								detectedColor: await translateColor(item.main_color, lang as "en" | "pl" | "no"),
								subType: item.sub_type,
								styleContext: item.style_context,
								pattern: item.pattern,
								keyFeatures: item.key_features,
								materialGuess: item.material_guess,
								confidence: item.confidence / 100,
							}))
					);

					console.log(`[API Stream] Returning ${items.length} items after filtering`);

					// Send final result
					const resultData = JSON.stringify({
						type: "complete",
						success: true,
						items,
						rawResponse: fullText,
					});
					controller.enqueue(new TextEncoder().encode(`data: ${resultData}\n\n`));
					controller.close();
				} catch (error) {
					console.error("[API Stream] Analysis error:", error);

					// Precise error handling
					let errorMessage = "Unknown error occurred";
					let errorStatus = 500;

					if (error && typeof error === "object" && "status" in error) {
						const apiError = error as { status?: number; message?: string };
						errorMessage = apiError.message || "Gemini API error";
						errorStatus = apiError.status || 500;
					} else if (error instanceof Error) {
						errorMessage = error.message;
					}

					const errorData = JSON.stringify({
						type: "error",
						error: errorMessage,
						status: errorStatus,
					});
					controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
					controller.close();
				}
			},
		});

		return new NextResponse(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	} catch (error) {
		console.error("[API Stream] Setup error:", error);

		// Precise error handling for setup errors
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
