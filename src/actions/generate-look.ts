"use server";

import { createClient } from "@/lib/supabase/server";
import { generateImageUnified } from "@/lib/image-generation";
import type { Outfit } from "@/views/outfit/TodayOutfitView";

/**
 * Server Action: Generuje wizualizację outfitu.
 * ZMIANA: Przyjmuje weatherContext, aby uwzględnić pogodę w obrazku.
 */
export async function generateLook(
	currentOutfit: Outfit,
	weatherContext: string = "Sunny, pleasant weather"
): Promise<{ imageUrl?: string; error?: string }> {
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

		// NOWY PROMPT: Uwzględnia weatherContext
		const outfitDescription = `Full body shot of a blond man with an athletic body build, clean shaven, walking on a Paris street. Weather conditions: ${weatherContext}. Wearing: ${garmentsToList}. Visible from head to toe, shoes clearly visible. Context: ${currentOutfit.description}. Natural lighting matching weather, street photography style, 35mm lens, candid shot, highly detailed textures, realistic anatomy.`;

		// 3. Generowanie Obrazu
		// Używamy FormData (Flux Dev tego wymaga)
		const generatedResult = await generateImageUnified("cloudflare-flux", outfitDescription);

		let imageBuffer: Buffer;

		if (generatedResult.startsWith("data:")) {
			const base64Data = generatedResult.split(",")[1];
			if (!base64Data) throw new Error("Invalid Base64 returned from generator");
			imageBuffer = Buffer.from(base64Data, "base64");
		} else if (generatedResult.startsWith("http")) {
			console.log("⬇️ [ACTION] Fetching fallback image to proxy/cache...");
			const response = await fetch(generatedResult);
			if (!response.ok) throw new Error("Failed to fetch image from external URL");
			const arrayBuffer = await response.arrayBuffer();
			imageBuffer = Buffer.from(arrayBuffer);
		} else {
			throw new Error("Unknown image format returned");
		}

		// --- DETEKTOR I NAPRAWA JSON (Fix dla Cloudflare JSON response) ---
		const startOfFile = imageBuffer.subarray(0, 50).toString().trim();
		if (startOfFile.startsWith("{") && startOfFile.includes("result")) {
			console.warn("⚠️ [ACTION] Detected Cloudflare JSON wrapper. Extracting raw image...");
			try {
				const jsonContent = JSON.parse(imageBuffer.toString());
				if (jsonContent.result && jsonContent.result.image) {
					imageBuffer = Buffer.from(jsonContent.result.image, "base64");
					console.log("✅ [ACTION] Successfully extracted image from JSON wrapper.");
				}
			} catch (parseError) {
				console.error("❌ [ACTION] Failed to parse JSON wrapper:", parseError);
			}
		}

		if (imageBuffer.length === 0) throw new Error("Generated image buffer is empty");

		// 4. Upload do Supabase Storage
		const timestamp = Date.now();
		const fileName = `model-views/${user.id}/${timestamp}-${currentOutfit.name}.png`;

		const { error: uploadError } = await supabase.storage.from("garments").upload(fileName, imageBuffer, {
			contentType: "image/png",
			upsert: false,
		});

		if (uploadError) {
			console.error("Storage Upload Error:", uploadError);
			throw new Error("Failed to save generated image to storage");
		}

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
