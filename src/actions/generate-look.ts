"use server";

import { createClient } from "@/lib/supabase/server";
import { generateImage } from "@/lib/image-generation";
import type { Outfit } from "@/views/outfit/TodayOutfitView";

// ============================================================================
// FLUX.2 Native JSON Prompting Schema (Black Forest Labs / Cloudflare)
// ============================================================================

type ColorMatch = "exact" | "approximate";

interface FluxSubject {
	type?: string;          // e.g., "Man", "Shirt", "Cardigan"
	description: string;    // Visual description + styling (e.g. "buttoned", "tucked")
	action?: string;        // Specific to the character (e.g., "Hand in pocket")
	position?: string;      // e.g., "center", "background"
	color_match?: ColorMatch;
	color_palette?: string[]; // HEX codes e.g. ["#000080"]
}

interface FluxJsonPrompt {
	scene: string;          // Global context + Weather
	subjects: FluxSubject[];
	style: string;          // Artistic style
	focus: string;          // Texture focus
}

// ============================================================================
// Character Definitions
// ============================================================================

const CHARACTER = {
	BLONDE30: {
		description: "30yo athletic man, dark blonde with a classic haircut, stubble, blue eyes",
		action: "One hand in pocket revealing belt",
		position: "center"
	},
	GREYISH50: {
		description: "Distinguished mature man in his 50s with a normal build, salt-and-pepper hair combed to the side and a full gray beard, round dark glasses",
		action: "One hand in pocket revealing belt",
		position: "center"
	},
	FAT40: {
		description: "45yo man with heavy build, short greyish hair, chin beard",
		action: "One hand in pocket revealing belt",
		position: "center"
	}
} as const;

/**
 * Server Action: Generates outfit visualization using Flux.2 Native JSON Prompting.
 * Uses structured JSON schema for precise color control and layering.
 */
export async function generateLook(
	currentOutfit: Outfit,
	weatherContext: string = "Sunny, pleasant weather"
): Promise<{ imageUrl?: string; error?: string }> {
	const supabase = await createClient();

	try {
		// 1. Authorization
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			return { error: "Unauthorized" };
		}

		// 2. SORT GARMENTS BY LAYER HIERARCHY (Bottom to Top)
		const LAYER_ORDER: Record<string, number> = {
			'base': 0,        // Undershirt/T-shirt (innermost)
			'mid': 1,         // Shirt/Polo/Turtleneck
			'mid_layer': 2,   // Sweater/Cardigan  
			'outer': 3,       // Blazer/Coat/Jacket (outermost)
			'shoes': 4,       // Footwear
			'accessory': 5,   // Belts, scarves, etc.
			'bottoms': 6      // Trousers (rendered last for clarity)
		};

	// Sort garments: base layer first, outer layer last
		const sortedGarments = [...currentOutfit.garments].sort((a, b) => {
			const layerA = a.layer_type?.toLowerCase() || 'mid';
			const layerB = b.layer_type?.toLowerCase() || 'mid';
			const orderA = LAYER_ORDER[layerA] ?? 99;
			const orderB = LAYER_ORDER[layerB] ?? 99;
			return orderA - orderB;
		});

	//console.log("📐 [LAYER ORDER]:", sortedGarments.map(g => g.layer_type !=='base' ? `${g.full_name} (${g.layer_type})` : '').join(" → "));

	// NEW: Filter out invisible base layers (white t-shirt/undershirt) UNLESS shirt is unbuttoned
		const hasUnbuttonedShirt = currentOutfit.stylingMetadata?.some(meta =>
			(meta.slotName.includes('shirt') || meta.slotName === 'shirt_layer') &&
			(meta.buttoning === 'unbuttoned_over_base' || meta.buttoning === 'half_buttoned')
		) ?? false;

		const visibleGarments = sortedGarments.filter(g => {
			const isBaseLayer = g.subcategory?.toLowerCase().includes('t-shirt') || 
							 g.subcategory?.toLowerCase().includes('undershirt') ||
							 (g.subcategory?.toLowerCase() === 'tops' && g.main_color_name?.toLowerCase().includes('white'));
			
			if (!isBaseLayer) return true;
			return hasUnbuttonedShirt;
		});

			//console.log("📐 [VISIBLE GARMENTS]:", visibleGarments.map(g => `${g.full_name} (${g.layer_type})`).join(" → "));
	//console.log(`👕 [BASE LAYER FILTER] ${hasUnbuttonedShirt ? 'SHOW' : 'HIDE'} base layer in image (${sortedGarments.length} → ${visibleGarments.length} garments)`);
		// 3. Build FluxJsonPrompt Object
		const subjects: FluxSubject[] = [];

		// Subject 0: The Man (Character)
		const characterDef = CHARACTER.BLONDE30;
		subjects.push({
			description: characterDef.description,
			action: characterDef.action,
			position: characterDef.position
		});

		// Subjects 1..N: The Garments
		for (const garment of visibleGarments) {
			const layerType = garment.layer_type?.toLowerCase() || 'mid';
			const subcategoryLower = garment.subcategory?.toLowerCase() || '';
			
			// Build layering instruction based on layer type
			let layeringInstruction = "";
			
			// MID_LAYER (Cardigans, Vests, Sweaters)
			if (layerType === 'mid_layer') {
				const isCardigan = subcategoryLower.includes('cardigan');
				const isVest = subcategoryLower.includes('vest') || subcategoryLower.includes('gilet');
				const isZip = garment.full_name?.toLowerCase().includes('zip');
				
				if (isCardigan) {
					if (isZip) {
						layeringInstruction = ", zipped up to chest";
					} else {
						// CRITICAL FIX: Cardigans must be explicitly buttoned
						layeringInstruction = ", the closure is strictly FULLY BUTTONED up to the chest";
					}
				} else if (isVest) {
					layeringInstruction = ", worn closed";
				} else {
					// Sweaters/pullovers - no closure instruction needed
					layeringInstruction = "";
				}
			}
			
			// OUTER LAYER (Coats, Jackets, Blazers)
			if (layerType === 'outer') {
				// Check if metadata says buttoned
				const outerMetadata = currentOutfit.stylingMetadata?.find(
					meta => meta.garmentName?.toLowerCase()?.includes(subcategoryLower)
				);
				const shouldBeButtoned = outerMetadata?.buttoning === 'buttoned';
				
				if (shouldBeButtoned) {
					layeringInstruction = ", worn buttoned";
				} else {
					// CRITICAL FIX: Outer layers open to reveal inner layers
					layeringInstruction = ", worn WIDE OPEN to reveal the inner cardigan/layers entirely";
				}
			}
			
			// MID LAYER (Shirts, Polos)
			if (layerType === 'mid') {
				const shirtMetadata = currentOutfit.stylingMetadata?.find(
					meta => meta.slotName?.includes('shirt') || meta.slotName === 'shirt_layer'
				);
				
				if (shirtMetadata?.buttoning === 'unbuttoned_over_base') {
					layeringInstruction = ", fully unbuttoned worn open over base layer";
				} else {
					layeringInstruction = ", high closure with top button undone showing bare neck";
				}
			}
			
			// Check if this garment is a polo or henley
			if (subcategoryLower.includes('polo') && !subcategoryLower.includes('merino') || subcategoryLower.includes('henley')) {
				layeringInstruction = ", one button undone at the collar";
			} 

			// BOTTOMS (Jeans, Trousers, Chinos)
			if (layerType === 'bottoms') {
				layeringInstruction = ", hem falls naturally over boots, pants overlay and cover the boot shafts completely";
			}

			// Build description
			const baseDescription = garment.ai_description || garment.full_name || garment.subcategory || "";
			const fullDescription = `${baseDescription}${layeringInstruction}`;

			const subject: FluxSubject = {
				type: garment.subcategory || garment.category,
				description: fullDescription,
				color_match: "exact",
				color_palette: garment.main_color_hex ? [garment.main_color_hex] : undefined
			};

			subjects.push(subject);
		}

		// Construct the complete FluxJsonPrompt
		const fluxJsonPrompt: FluxJsonPrompt = {
			scene: `Fashion illustration of a man regarding architectural concept art style. Context: ${weatherContext}`,
			subjects: subjects,
			style: "Copic marker illustration with distinct ink lines and white background",
			focus: "fabric textures: wool, suede, denim, leather"
		};

		// Convert to JSON string for the API
		const outfitDescription = JSON.stringify(fluxJsonPrompt);
		
		console.log("🎨 [IMAGE GENERATION PROMPT]:", outfitDescription);
		
		// 3. Generowanie Obrazu
		let generatedResult: string | undefined;
		let generationError: string | undefined;

		// Attempt 1: Full Prompt
		const result1 = await generateImage(outfitDescription);
		
		if (result1?.base64) {
			generatedResult = result1.base64;
		} else if (result1?.error) {
			generationError = result1.error;
		}

		// Retry Logic for Policy/Content Errors
		const isPolicyError = generationError && (generationError.includes("copyright") || generationError.includes("public personas") || generationError.includes("nsfw"));
		
		if (!generatedResult && isPolicyError) {
			//console.warn("⚠️ [ACTION] Prompt flagged. Retrying with simplified prompt...");
			// Retry with the same JSON prompt (policy errors are usually about text, not structure)
			const result2 = await generateImage(outfitDescription);
			if (result2?.base64) {
				generatedResult = result2.base64;
			} else {
				throw new Error(result2?.error || "Retry failed");
			}
		} else if (!generatedResult) {
			throw new Error(generationError || "Image generation failed unknown");
		}

		// At this point generatedResult should be a base64 string starting with "data:image..."
		if (!generatedResult) throw new Error("No result returned");

		// Buffer handling
		let imageBuffer: Buffer;
		if (generatedResult.startsWith("data:")) {
			const base64Data = generatedResult.split(",")[1];
			imageBuffer = Buffer.from(base64Data, "base64");
		} else {
			// In case the library returns a URL in future (though currently it returns base64)
			throw new Error("Unexpected format from generateImage");
		}

		// 4. Upload do Supabase Storage
		const timestamp = Date.now();
		// Sanitize outfit name for URL-safe filename (replace spaces and special chars with hyphens)
		const safeOutfitName = currentOutfit.name
			.replace(/[^a-zA-Z0-9-]/g, '-')  // Replace non-alphanumeric chars with hyphen
			.replace(/-+/g, '-')              // Replace multiple hyphens with single
			.replace(/^-|-$/g, '');           // Remove leading/trailing hyphens
		const fileName = `model-views/${user.id}/${timestamp}-${safeOutfitName}.png`;

		const { data: uploadData, error: uploadError } = await supabase.storage.from("garments").upload(fileName, imageBuffer, {
			contentType: "image/png",
			upsert: false,
		});

		if (uploadError) {
			//console.error("Storage Upload Error:", uploadError);
			throw new Error(`Failed to save generated image: ${uploadError.message}`);
		}

		if (!uploadData?.path) {
			//console.error("Upload succeeded but no path returned");
			throw new Error("Upload succeeded but no path returned");
		}

		//console.log("✅ [ACTION] Image uploaded to:", uploadData.path);

		// 5. Pobranie Publicznego URL
		const {
			data: { publicUrl },
		} = supabase.storage.from("garments").getPublicUrl(fileName);

		// 6. Aktualizacja Cache w DB
		const today = new Date().toISOString().split("T")[0];

		const { data: suggestionRecord } = await supabase
			.from("daily_suggestions")
			.select("id, generated_model_images")
			.eq("user_id", user.id)
			.eq("date", today)
			.single();

		if (suggestionRecord) {
			const currentImages = (suggestionRecord.generated_model_images as Record<string, string>) || {};
			const updatedImages = { ...currentImages, [currentOutfit.name]: publicUrl };

			const { error: dbError } = await supabase
				.from("daily_suggestions")
				.update({ generated_model_images: updatedImages })
				.eq("id", suggestionRecord.id);

			//if (dbError) //console.error("⚠️ Failed to update cache in DB:", dbError);
		}

		//console.log("✅ [ACTION] Image processed and cached:", publicUrl);
		return { imageUrl: publicUrl };
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : "Could not generate image.";
		//console.error("❌ [ACTION] Generate Look Failed:", error);
		return { error: errorMessage };
	}
}
