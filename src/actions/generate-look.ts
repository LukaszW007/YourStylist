"use server";

import { createClient } from "@/lib/supabase/server";
import { generateImage } from "@/lib/image-generation";
import type { Outfit } from "@/views/outfit/TodayOutfitView";

/**
 * Server Action: Generuje wizualizację outfitu.
 * ZMIANA: Przyjmuje weatherContext, aby uwzględnić pogodę w obrazku.
 */

const enum CHARACTER {
	BLONDE30 = "A 30 year old handsome athletic man, dark blonde hair with a classic haircut, light stubble, piercing blue eyes. Keeps one hand in the pants pocket and the other hand out of pockets.",
	GREYISH50 = "Distinguished mature man in his 50s with a normal build. He has neat, short, salt-and-pepper hair combed to the side and a full, well-groomed gray beard and mustache. He wears round, dark-rimmed glasses. Serious, confident expression with a piercing gaze from behind his glasses. Keeps hands out of pockets.",
	FAT40 = "A 45-year-old man with a big fat belly, heavy build. 180cm tall and 130kg weight.Short, greyish hair, almost bold, medium-length beard just on the chin. Rugged but stylish appearance. Keeps hands out of pockets.",
}
export async function generateLook(
	currentOutfit: Outfit,
	weatherContext: string = "Sunny, pleasant weather"
): Promise<{ imageUrl?: string; error?: string }> {
	console.log("📸 [ACTION START] generateLook called for:", currentOutfit.name);
	const supabase = await createClient();

	try {
		// 1. Autoryzacja
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			return { error: "Unauthorized" };
		}

		console.log("🧥 [ACTION] Generating look for:", currentOutfit.name, "| Weather:", weatherContext);

	// 2. SORT GARMENTS BY LAYER HIERARCHY (Bottom to Top)
	// This ensures the AI generates images with correct layering order
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

	console.log("📐 [LAYER ORDER]:", sortedGarments.map(g => `${g.name} (${g.layer_type})`).join(" → "));

	// NEW: Filter out invisible base layers (white t-shirt/undershirt) UNLESS shirt is unbuttoned
	const hasUnbuttonedShirt = currentOutfit.stylingMetadata?.some(meta =>
		(meta.slotName.includes('shirt') || meta.slotName === 'shirt_layer') &&
		(meta.buttoning === 'unbuttoned_over_base' || meta.buttoning === 'half_buttoned')
	) ?? false;
	
	const visibleGarments = sortedGarments.filter(g => {
		const isBaseLayer = g.subcategory?.toLowerCase().includes('t-shirt') || 
						 g.subcategory?.toLowerCase().includes('undershirt') ||
						 (g.subcategory?.toLowerCase() === 'tops' && g.main_color_name?.toLowerCase().includes('white'));
		
		if (!isBaseLayer) return true; // Always show non-base layers
		
		return hasUnbuttonedShirt; // Show base layer only if shirt unbuttoned/half-buttoned
	});
	
	console.log(`👕 [BASE LAYER FILTER] ${hasUnbuttonedShirt ? 'SHOW' : 'HIDE'} base layer in image (${sortedGarments.length} → ${visibleGarments.length} garments)`);

	// 3. Budowanie Promptu - Enhanced garment descriptions with HEX color (using VISIBLE garments)
	const garmentsToList = visibleGarments
		.map((g: any) => {
			const material = Array.isArray(g.material) && g.material.length > 0 ? g.material[0] : "";
			const sub = g.subcategory || g.category;
			const weave = g.fabric_weave && g.fabric_weave !== "Standard" ? g.fabric_weave : "";
			const hexColor = g.main_color_hex || "";
			
			// Detect pattern from name
			const nameLower = g.name?.toLowerCase() || "";
			let pattern = "";
			if (nameLower.includes("stripe") || nameLower.includes("striped")) pattern = "striped";
			else if (nameLower.includes("check") || nameLower.includes("plaid")) pattern = "checked";
			else if (nameLower.includes("herringbone")) pattern = "herringbone";
			else if (nameLower.includes("houndstooth")) pattern = "houndstooth";
			else if (nameLower.includes("cable") || nameLower.includes("aran")) pattern = "cable-knit";
			
			// Build rich description with HEX: "Charcoal (#36454F) herringbone wool flannel Blazer"
			const colorPart = hexColor ? `${g.main_color_name} (${hexColor})` : g.main_color_name;
			const parts = [colorPart, pattern, weave, material, sub].filter(Boolean);
			return parts.join(" ");
		})
		.join(", ");

	const baseStyle = "Professional fashion illustration, architectural concept art style, Copic marker coloring, distinct ink lines, white background.";
	const character = CHARACTER.BLONDE30;
	
	// CRITICAL: Emphasize layering order in prompt
	const layeringInstruction = "LAYERING ORDER (bottom to top, innermost to outermost): ";
	const outfit = `${layeringInstruction}${garmentsToList}. Each layer should be visible underneath the next layer in the order listed.`;
	
	// NEW: Extract styling instructions from template metadata
	const stylingInstructions = currentOutfit.stylingMetadata?.map(meta => {
		const instructions = [];
		
		// Tucked-in instructions
		if (meta.tuckedIn === 'always') {
			instructions.push(`${meta.garmentName}: TUCKED INTO PANTS (belt visible)`);
		} else if (meta.tuckedIn === 'never') {
			instructions.push(`${meta.garmentName}: UNTUCKED, hanging loose over pants`);
		} else if (meta.tuckedIn === 'optional') {
			instructions.push(`${meta.garmentName}: Casual front-tuck only`);
		}
		
		// Buttoning instructions
		if (meta.buttoning === 'one_button_undone') {
			instructions.push(`${meta.garmentName}: ONE TOP BUTTON UNDONE, rest buttoned`);
		} else if (meta.buttoning === 'always_one_undone') {
			instructions.push(`${meta.garmentName}: ONE BUTTON UNDONE (polo/henley rule)`);
		} else if (meta.buttoning === 'unbuttoned_over_base') {
			instructions.push(`${meta.garmentName}: FULLY UNBUTTONED, worn open as overshirt`);
		} else if (meta.buttoning === 'buttoned') {
			instructions.push(`${meta.garmentName}: BUTTONED, except top button undone`);
		}
		
		return instructions.join(', ');
	}).filter(Boolean).join('. ') || '';

	const stylingPrompt = stylingInstructions 
		? `STYLING DETAILS (CRITICAL): ${stylingInstructions}.` 
		: '';
	
	const pictureStyle = "Copic marker coloring, distinct ink lines, emphasis on fabric textures (tweed, wool, denim). Clean white background, studio lighting simulation. High fashion sketch aesthetic. Visible entire person."	

	const finalPrompt = `${baseStyle} CHARACTER: ${character} OUTFIT: ${outfit} ${stylingPrompt} STYLE: ${pictureStyle}`;
		
		//Prompts for photorealistic style of generated pictures
		// const basePrompt = `Professional fashion illustration, architectural concept art style, Copic marker coloring, distinct ink lines, white background. Wearing: ${garmentsToList}. Visible from head to toe, shoes clearly visible.`;
		// const styleSuffix = `Shot on a full-frame DSLR, 50mm lens, sharp focus on the subject, blurry background, street photography style, realistic skin texture, high quality fabrics texture, full-body shot from head to toes.`;
		
		const outfitDescription = finalPrompt;
		
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
			console.warn("⚠️ [ACTION] Prompt flagged. Retrying with simplified prompt...");
			// Simplified prompt without description which might contain brands/celebs
			const safeDescription = finalPrompt;
			const result2 = await generateImage(safeDescription);
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
			console.error("Storage Upload Error:", uploadError);
			throw new Error(`Failed to save generated image: ${uploadError.message}`);
		}

		if (!uploadData?.path) {
			console.error("Upload succeeded but no path returned");
			throw new Error("Upload succeeded but no path returned");
		}

		console.log("✅ [ACTION] Image uploaded to:", uploadData.path);

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

			if (dbError) console.error("⚠️ Failed to update cache in DB:", dbError);
		}

		console.log("✅ [ACTION] Image processed and cached:", publicUrl);
		return { imageUrl: publicUrl };
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : "Could not generate image.";
		console.error("❌ [ACTION] Generate Look Failed:", error);
		return { error: errorMessage };
	}
}
