import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { isCategoryAllowed } from "@/lib/i18n/wardrobeTranslations";
import sharp from "sharp";
import { normalizeLayerType } from "@/lib/utils/garment-guards";
import { AI_CONFIG } from "@/lib/ai/config";

// Server-side only - NOT exposed to browser
const GEMINI_API_KEY = AI_CONFIG.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
	console.error("FREE_GEMINI_KEY (via AI_CONFIG) is not configured in environment variables");
}

// Initialize new GenAI client (stable API v1)
const genAI = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const SYSTEM_PROMPT = `You are an expert AI fashion analyst and stylist. Analyze the image and detect ALL visible clothing items.

For EACH item return a JSON object with EXACTLY these fields (flat, no extra text before/after the array). Each field may use the examples given, but is NOT limited to them (except style_context, pattern and color_temperature which MUST be chosen from their fixed lists):
1. type                -> General category (e.g. "Shirt", "Jeans", "Jacket", "Sneakers", "Dress", "Skirt", "Coat", "Sweater", "Hoodie"). Use singular.
2. sub_type            -> Specific style descriptor (e.g. "Oxford Shirt", "Bomber Jacket", "Slim Fit Jeans", "Low-top Sneakers"). If unknown use an empty string.
3. style_context       -> Array of styles (select 1-3 best matches) from: Formal | Business Casual | Smart Casual | Streetwear | Minimalist | Sportswear | Utility/Military | Western/Country | Vintage | Outdoor | Techwear
4. main_color_name     -> Precise dominant color name (avoid generic terms: prefer "Navy Blue", "Light Blue", "Olive Green", "Charcoal Gray", "Off-White", "Burnt Orange", "Dusty Rose", etc.)
5. main_color_hex      -> 9 char HEX (#RRGGBB or #RRGGBBAA). Include alpha ONLY if visibly translucent.
6. main_color_rgba     -> RGBA string matching the hex (e.g. "rgba(174,198,234,1.0)").
7. secondary_colors    -> Array of objects: [{ "name": "White", "hex": "#FFFFFF" }, ...] (empty array [] if none clearly present). Max 4. INCLUDE HEX WITH ALPHA if color has transparency.
8. pattern             -> MUST be one of: Chalk Stripe | Pinstripe | Houndstooth | Herringbone | Plaid | Paisley | Barleycorn | Floral | Windowpane | Sharkskin | Glen Check | Nailhead | Gingham | Dot | Twill | Tartan | Shepherd's Check | Graph Check | Tattersall | Madras | Birdseye | Awning Stripe | Bengal Stripe | Candy Stripe | Pencil Stripe | Solid | Undefined
9. color_temperature   -> CRITICAL! MUST be one of: Warm | Cool | Neutral. Analyze the tone of the main color.
10. key_features        -> Array of concise feature strings (zippers, pockets, logos, stitching, closures, collars, cuffs, trims, seams, ventilation, reflective, insulation). Prefer <= 8 items. TROUSER-SPECIFIC: If analyzing trousers/pants, add "adjusters" if side adjuster tabs visible, or "gurkha" if built-in fabric belt (these mean NO BELT allowed).
11. materials          -> CRITICAL: Array of FABRIC COMPOSITION only (FIRST element dominant). MATERIALS are what the fabric is MADE OF:
    ALLOWED: Acrylic | Acetate | Alpaca Wool | Angora | Blend | Canvas | Cashmere | Cotton | Cupro | Faux Fur | Faux Leather | Fleece | Hemp | Jute | Lambs Wool | Leather | Linen | Merino Wool | Modal | Mohair | Nylon | Polyester | Rayon | Silk | Spandex | Suede | Synthetic | Terry Cloth | Velvet | Vicuna Wool | Viscose | Wool
    FORBIDDEN: Flannel, Tweed, Seersucker, Fresco, Poplin, Oxford, Denim, Corduroy (these are WEAVE TYPES, use fabric_weave field)
    FORBIDDEN: Herringbone, Houndstooth, Plaid, Stripes (these are PATTERNS, use pattern field)
    If only one return ["Cotton"].
12. brand              -> CAREFULLY examine the garment for visible brand logos, labels, tags, patches, or distinctive brand-specific design elements. Look for text on labels visible in tags/collars, embroidered logos, printed brand names, or recognizable brand signatures (swoosh, three stripes, polo player, etc.). If you can read or identify the brand with confidence, provide the exact brand name (e.g., "Nike", "Adidas", "Ralph Lauren", "Zara", "H&M", "Tommy Hilfiger", "Calvin Klein"). If NO brand is visible or you cannot confidently identify it, return an empty string (""). Do NOT guess or infer brands without visible evidence.
13. description        -> EXACTLY 2 short sentences describing what this garment pairs well with and what occasions or style it suits. Be specific and practical. Example: "This piece works great with dark denim or chinos for smart casual looks. Perfect for office settings, casual meetings, or weekend outings."
14. ai_description -> CRITICAL FOR IMAGE GENERATION. Create a SINGLE, dense sentence describing this garment for AI image re-generation. This will be used in FLUX.2Dev to recreate the item visually.
    Format: [Main Color + Material/Texture] [main_color_hex] [Item Category] featuring [Secondary Color + Material/Placement] [secondary_color_hex] and [Key Distinguishing Detail].
    Strict Rules:
    - NO fluff words ("stylish", "comfortable", "nice", "pair of"). Focus ONLY on visual physics.
    - Mention Hex codes only if the color is ambiguous.
    - Capture texture details precisely (e.g., "chunky cable knit", "rough suede", "shiny nylon", "washed denim", "brushed surface").
    - CRITICAL: Flannel is a WEAVE TYPE (brushed finish), NOT a material. Use fabric_weave field.
    - Capture patterns/prints exactly (e.g., "vertical pinstripes", "tartan check", "buffalo plaid", "horizontal quilting").
    - Include construction details (e.g., "raglan sleeves", "patch pockets", "ribbed cuffs", "contrast stitching").
    Examples:
    - "Tan (#C19A6B) rough-out suede hiking boots featuring contrasting navy blue (#000080) mesh panels and a black outsole with white speckles."
    - "Burnt Orange (#CC5500) shiny nylon puffer jacket with horizontal quilting and black matte shoulder patches."
    - "Forest Green (#228B22) and Navy Blue (#000080) buffalo-check flannel shirt with a button-down collar and chest pocket."
    - "Charcoal gray (#36454F) fine-knit merino wool V-neck sweater with ribbed hem and cuffs."
15. confidence         -> Integer 0-100 (omit items below 60 entirely).
16. box_2d             -> The bounding box [ymin, xmin, ymax, xmax] normalized to 1000. REQUIRED for cropping.
17. fabric_weave -> CRITICAL for physics. Analyze texture and yarn thickness VERY carefully. MUST be one of:
    - Standard (Smooth/Generic)
    - Twill (Diagonal lines, Denim, Chino, Gabardine)
    - Oxford (Basket weave structure)
    - Poplin (Fine ribbed, smooth shirt)
    - Flannel (Brushed, fuzzy surface)
    - Seersucker (Puckered, bumpy texture)
    - Fresco (Open weave, gritty wool)
    - Tweed (Rough, unfinished wool texture)
    - Corduroy (Vertical ridges/wales)
    - Knit Chunky (Thick yarn >3mm, large visible loops, cable knit, aran sweaters, typically Lambs Wool or Mohair)
    - Knit Fine (Thin yarn <2mm, smooth tight knit, dress sweaters, typically Merino/Cashmere/Vicuna/Angora)
    - Jersey (T-shirt fabric, cotton knit)
    - Piqué (Polo shirt texture, raised pattern)
    - Satin (Shiny, smooth)
    - Velvet (Plush pile)
    - Ripstop (Grid pattern reinforcement)
	- Denim (Woven fabric)


18. thickness -> Estimate thermal weight. One of:
    - Ultra-Light (Seersucker, Linen, Silk, Cotton-Linen blend, Fresco Wool, tank top)
    - Light (T-shirt, Dress Shirt)
    - Mid (Chinos, Hoodie, Flannel, NOT WOOL SWEATERS, wool polos long sleeves)
    - Heavy (Denim, Fine Knit Wool, Leather, Corduroy)
    - Ultra-Heavy (Parka, Shearling, Puffer, THICK KNITS(Lambswool, Shetland, Cable/Chunky Knit, Heavy Cardigans), Tweed, Wool Coats (Pea Coat, Overcoat))
    - Insulated (Padded coats with technical fill: Down, Primaloft, Thinsulate, Arctic outerwear, extreme cold gear)

19. sleeve_length -> CRITICAL for tops only. Analyze sleeve length carefully:
    - "short-sleeve" - Short sleeves (above elbow, t-shirts, short-sleeve shirts, short-sleeve polos)
    - "long-sleeve" - Long sleeves (full length to wrist, long-sleeve shirts, long-sleeve polos, sweaters)
    - "none" - Not applicable (pants, shoes, jackets, outerwear, sleeveless tops, accessories)
    ONLY set "short-sleeve" or "long-sleeve" if type is: "Shirt", "Polo", "T-Shirt", "Sweater", "Hoodie".
    For outerwear, bottoms, shoes, and accessories always use "none".


Return ONLY a JSON array: [ { ... }, { ... } ] with those keys. NO markdown fences, NO commentary.
Limit to MAX 10 items. If nothing valid: return []. Exclude underwear and socks entirely.

Example (abbreviated):
[
  {
    "type": "Shirt",
    "sub_type": "Oxford Shirt",
    "style_context": ["Smart Casual"],
    "main_color_name": "Light Blue",
    "main_color_hex": "#AEC6EA",
    "main_color_rgba": "rgba(174,198,234,1.0)",
    "secondary_colors": [],
    "pattern": "Solid",
    "color_temperature": "Cool",
    "key_features": ["Button-down collar", "Chest pocket"],
    "materials": ["Cotton"],
    "brand": "Ralph Lauren",
    "description": "This versatile Oxford pairs perfectly with navy blazers, chinos, or dark denim for polished casual looks. Ideal for business casual offices, weekend brunches, or smart casual events.",
    "ai_description": "Light blue (#AEC6EA) cotton oxford shirt with button-down collar and chest pocket",
    "confidence": 94,
    "box_2d": [100, 200, 300, 400],
    "fabric_weave": "Oxford",
    "thermal_profile": "Light",
    "sleeve_length": "short-sleeve"
  }
]

Be STRICT with field names. Do NOT invent or rename fields. If a value is unknown use an empty string ("") for strings or [] for arrays.`;

// Prompts must remain English-only; LLM output should be English (DB canonical language).

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

		// Build language-aware prompt
		const response = await genAI.models.generateContent({
			model: AI_CONFIG.IMAGE_ANALYSIS.model,
			contents: [
				{
					role: "user",
					parts: [{ inlineData: { mimeType, data: base64Image } }, { text: SYSTEM_PROMPT }],
				},
			],
		});

		// Fallback text extraction: try response.text first, then parse candidates
		let text = "";
		if (response.candidates?.[0]?.content?.parts) {
			const parts = response.candidates[0].content.parts;
			text = parts.map((p: any) => p.text || "").join("");
		}

		if (!text) {
			console.log("[API] Extracted text from response.candidates[0].content.parts (backup method used)");
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
			style_context?: string[] | string;
			main_color?: string; // legacy
			main_color_name?: string;
			main_color_hex?: string;
			main_color_rgba?: string;
			secondary_colors?: Array<string | { name?: string; hex?: string; rgba?: string }>;
			pattern?: string;
			color_temperature?: "Warm" | "Cool" | "Neutral";
			key_features?: string[];
			materials?: string[] | string;
			brand?: string;
			thickness?: string;
			description?: string;
			ai_description?: string;  // RENAMED: Unified with DB column name
			confidence: number;
			box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized to 1000
			fabricWeave: string,
			sleeve_length?: "short-sleeve" | "long-sleeve" | "none";
			thermal_profile?: "Light" | "Medium" | "Heavy";
		}>;

		try {
			parsedData = JSON.parse(cleanedText);
			// console.error("[API] JSON parse data:", parsedData);
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
			// Handle single object response edge case
			if (typeof parsedData === "object") parsedData = [parsedData];
			return NextResponse.json({ error: "Response is not an array", rawResponse: cleanedText.substring(0, 500) }, { status: 500 });
		}

		console.log(`[API] Successfully detected ${parsedData.length} items`);

		// 2. Sharp Cropping
		const imageBuffer = Buffer.from(base64Image, "base64");
		const sharpImage = sharp(imageBuffer);
		const metadata = await sharpImage.metadata();
		const imgWidth = metadata.width || 0;
		const imgHeight = metadata.height || 0;

		// 3. Process Items (Filter -> Crop -> Map)
		// Filter out excluded categories (underwear, socks) and translate
		const items = await Promise.all(
			parsedData
				.filter((item) => isCategoryAllowed(item.type))
				.map(async (item, index) => {
					// --- CROPPING LOGIC ---
					let base64Crop = null;
					if (item.box_2d && Array.isArray(item.box_2d) && imgWidth > 0) {
						try {
							const [ymin, xmin, ymax, xmax] = item.box_2d;
							let top = Math.floor((ymin / 1000) * imgHeight);
							let left = Math.floor((xmin / 1000) * imgWidth);
							let height = Math.floor(((ymax - ymin) / 1000) * imgHeight);
							let width = Math.floor(((xmax - xmin) / 1000) * imgWidth);

							// Padding 5%
							const padY = Math.floor(height * 0.05);
							const padX = Math.floor(width * 0.05);
							top = Math.max(0, top - padY);
							left = Math.max(0, left - padX);
							height = Math.min(imgHeight - top, height + padY * 2);
							width = Math.min(imgWidth - left, width + padX * 2);

							const cropBuffer = await sharpImage
								.clone()
								.extract({ left, top, width, height })
								.resize(600, 600, { fit: "inside" })
								.toFormat("png")
								.toBuffer();

							base64Crop = `data:image/png;base64,${cropBuffer.toString("base64")}`;
						} catch (e) {
							console.warn(`[API] Crop failed for item ${index}`);
						}
					}

					// Determine color name (new or legacy)
					const rawColorName = item.main_color_name || item.main_color || "";
					// Use raw English color name directly (LLM instructed to output English)
					const translatedColorName = rawColorName;
					// Normalize secondary colors
					const secondaryColors = (item.secondary_colors || []).map((c) => {
						if (typeof c === "string") return { name: c };
						return { name: c.name, hex: c.hex, rgba: c.rgba };
					});
					const normalizedLayer = normalizeLayerType(item.type, item.sub_type);
				
					// Validate materials array - catch common LLM mistakes
					let fabricArray = (() => {
						if (Array.isArray(item.materials)) return item.materials.filter(Boolean) as string[];
						if (typeof item.materials === "string" && item.materials.trim()) return [item.materials.trim()];
						return [];
					})();
			
			// 1. Fabric Weave - Declare early to avoid scope issues
			let detectedWeave = item.fabricWeave || null;
					
					// Validate: Flannel should NEVER be in materials (it's a weave type)
					if (fabricArray.some(f => f.toLowerCase().includes('flannel'))) {
						console.warn('⚠️ [VALIDATION] Flannel detected in materials, moving to fabric_weave');
						fabricArray = fabricArray.filter(f => !f.toLowerCase().includes('flannel'));
						if (!item.fabricWeave || item.fabricWeave === 'Standard') {
							detectedWeave = 'Flannel';
						}
					}					
					// CRITICAL: Add fallback material if array is empty after flannel removal
					if (fabricArray.length === 0) {
						fabricArray = ['Cotton'];
						console.log('   └─ Materials empty after flannel removal, added Cotton fallback');
					}
					
					
					// Fallback pattern detection if weave not detected by AI
					if (!detectedWeave) {
						const fullText = (item.type + " " + (item.sub_type || "") + " " + (item.materials || "")).toLowerCase();
						if (fullText.includes("seersucker")) detectedWeave = "Seersucker";
						else if (fullText.includes("fresco") || fullText.includes("high twist")) detectedWeave = "Fresco";
						else if (fullText.includes("flannel")) detectedWeave = "Flannel";
						else if (fullText.includes("tweed")) detectedWeave = "Tweed";
						else if (fullText.includes("poplin")) detectedWeave = "Poplin";
						else if (fullText.includes("oxford")) detectedWeave = "Oxford";
						else if (fullText.includes("chambray")) detectedWeave = "Twill";
						else if (fullText.includes("twill") || fullText.includes("chino") || fullText.includes("gabardine")) detectedWeave = "Twill";
						else if (fullText.includes("denim") || fullText.includes("jeans")) detectedWeave = "Twill";
						else if (fullText.includes("knit") || fullText.includes("sweater")) detectedWeave = "Knit Chunky";
						else if (fullText.includes("corduroy")) detectedWeave = "Corduroy";
						else if (fullText.includes("jersey") || fullText.includes("t-shirt")) detectedWeave = "Jersey";
						else if (fullText.includes("piqué") || fullText.includes("polo")) detectedWeave = "Piqué";
						else if (fullText.includes("satin")) detectedWeave = "Satin";
						else if (fullText.includes("velvet")) detectedWeave = "Velvet";
						else if (fullText.includes("ripstop")) detectedWeave = "Ripstop";
						else detectedWeave = "Standard";
					}

					// 2. Thickness -> Thermal Profile
                    // AI zwraca "thickness", my mapujemy to na "thermal_profile" w bazie
                    let thermalProfile = item.thickness || "Mid";
                    // Upewniamy się, że pasuje do naszej bazy (wielka litera)
                    thermalProfile = thermalProfile.charAt(0).toUpperCase() + thermalProfile.slice(1);
					
					return {
						id: `item_${Date.now()}_${index}`,
						base64_image: base64Crop,
						detectedCategory: item.type,
						detectedColor: translatedColorName,
						colorName: translatedColorName,
						colorHex: item.main_color_hex || null,
						colorRgba: item.main_color_rgba || null,
						colorTemperature: item.color_temperature || null,
						secondaryColors,
						subType: item.sub_type || null,
						styleContext: Array.isArray(item.style_context) ? item.style_context : (item.style_context ? [item.style_context] : []),
						layerType: normalizedLayer, // Znormalizowana warstwa
						fabricWeave: detectedWeave, // AI-detected or fallback
						pattern: item.pattern || null,
						keyFeatures: item.key_features || [],
						materials: (() => {
							if (Array.isArray(item.materials)) return item.materials.filter(Boolean) as string[];
							if (typeof item.materials === "string" && item.materials.trim()) return [item.materials.trim()];
							// legacy single-material field removed; ignore if present
							return [];
						})(),
						brand: item.brand || null,
						description: item.description || null,
						ai_description: item.ai_description || null,  // RENAMED: Unified naming
						confidence: item.confidence / 100, // 0-1
						thermalProfile: thermalProfile,
						sleeveLength: item.sleeve_length || "none"
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

		// Handle 429 Gracefully
		if (typeof error === "object" && error !== null && "status" in error && (error as any).status === 429) {
			return NextResponse.json({ error: "Server busy. Please try again in 1 minute." }, { status: 429 });
		}

		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Unknown error occurred",
			},
			{ status: 500 }
		);
	}
}
