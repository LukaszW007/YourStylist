"use server";

import { createClient } from "@/lib/supabase/server";
import { generateImage } from "@/lib/image-generation";
import type { Outfit } from "@/views/outfit/TodayOutfitView";

/**
 * Server Action: Generuje wizualizację outfitu.
 * ZMIANA: Przyjmuje weatherContext, aby uwzględnić pogodę w obrazku.
 */
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

		// 2. Budowanie Promptu
		const garmentsToList = currentOutfit.garments
			.map((g) => {
				const material = Array.isArray(g.material) && g.material.length > 0 ? g.material[0] : "";
				const sub = g.subcategory || g.category;
				return `${g.main_color_name} ${material} ${sub}`;
			})
			.join(", ");

		const basePrompt = `Full body shot of a blond man with an athletic body build, clean shaven, walking on a Paris street. Weather conditions: ${weatherContext}. Wearing: ${garmentsToList}. Visible from head to toe, shoes clearly visible.`;
		const styleSuffix = `Natural lighting matching weather, street photography style, 35mm lens, candid shot, highly detailed textures, realistic anatomy.`;
		
		let outfitDescription = `${basePrompt} Context: ${currentOutfit.description}. ${styleSuffix}`;
		
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
             const safeDescription = `${basePrompt} ${styleSuffix}`;
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
	} catch (error: any) {
		console.error("❌ [ACTION] Generate Look Failed:", error);
		return { error: error.message || "Could not generate image." };
	}
}
