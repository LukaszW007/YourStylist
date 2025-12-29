import { tryGetSupabaseBrowser } from "./client";
import { clientEnv } from "@/env";
import type { Database } from "./types";
import { computeComfortRange, deriveColorFamily } from "@/lib/wardrobe/classification";

type GarmentInsert = Database["public"]["Tables"]["garments"]["Insert"];

export interface GarmentData {
	name: string;
	category: string;
	image_url: string;
	image_storage_path?: string;
	brand?: string;
	subcategory?: string;
	notes?: string;
	tags?: string[];
	description?: string;
	style_context?: string;
	main_color_name?: string;
	main_color_hex?: string;
	color_temperature?: "Warm" | "Cool" | "Neutral";
	secondary_colors?: { name?: string; hex?: string }[];
	pattern?: string;
	key_features?: string[];
	material?: string[];
	// computed fields (optional input; will be computed if missing)
	comfort_min_c?: number;
	comfort_max_c?: number;
	thermal_profile?: string;
	color_family?: string;
}

/**
 * Adds multiple garments to the user's wardrobe.
 * Returns the created garment records.
 */
export async function addGarmentsToWardrobe(garments: GarmentData[]): Promise<{ success: boolean; error?: string }> {
	if (!clientEnv.isSupabaseConfigured) {
		return { success: false, error: "Supabase is not configured" };
	}

	const supabase = tryGetSupabaseBrowser();

	if (!supabase) {
		return { success: false, error: "Supabase client not available" };
	}

	try {
		// Get current user
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			return { success: false, error: "User not authenticated" };
		}

		// Prepare garment records
		const garmentRecords: GarmentInsert[] = garments.map((garment) => {
			const computed = computeComfortRange(garment.material, garment.category);
			const colorFamily = deriveColorFamily(garment.main_color_name || "");
			console.log(
				"Computed comfort range for",
				garment.name,
				":",
				computed,
				garment.color_temperature == null ? `Color temperature: ${garment.color_temperature}` : "",
				garment.comfort_min_c == null ? `Min C: ${computed.min}` : "",
				garment.comfort_max_c == null ? `Max C: ${computed.max}` : "",
				garment.thermal_profile == null ? `Thermal profile: ${computed.thermalProfile}` : ""
			);
			return {
				user_id: user.id,
				name: garment.name,
				category: mapCategoryToDb(garment.category),
				image_url: garment.image_url,
				image_storage_path: garment.image_storage_path,
				brand: garment.brand,
				subcategory: garment.subcategory,
				notes: garment.notes,
				tags: garment.tags,
				description: garment.description,
				style_context: garment.style_context,
				main_color_name: garment.main_color_name,
				main_color_hex: garment.main_color_hex,
				color_temperature: garment.color_temperature,
				secondary_colors: garment.secondary_colors,
				pattern: garment.pattern,
				key_features: garment.key_features,
				material: garment.material,
				comfort_min_c: garment.comfort_min_c ?? computed.min,
				comfort_max_c: garment.comfort_max_c ?? computed.max,
				thermal_profile: garment.thermal_profile ?? computed.thermalProfile,
				color_family: garment.color_family ?? colorFamily,
			};
		});

		console.log("Computed comfort range for", garmentRecords);

		// Insert garments into database
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { error: insertError } = await supabase.from("garments").insert(garmentRecords as any);

		if (insertError) {
			console.error("Error inserting garments:", insertError);
			return { success: false, error: insertError.message };
		}

		return { success: true };
	} catch (error) {
		console.error("Unexpected error adding garments:", error);
		return { success: false, error: "An unexpected error occurred" };
	}
}

/**
 * Maps category names (both English and Polish) to database enum values
 */
function mapCategoryToDb(category: string): string {
	const categoryMap: Record<string, string> = {
		// English names (from scanner)
		Shirt: "tops",
		"T-Shirt": "tops",
		Polo: "tops",
		"Tank Top": "tops",
		Sweatshirt: "tops",
		Hoodie: "tops",
		Sweater: "tops",
		Cardigan: "tops",
		Jeans: "bottoms",
		Pants: "bottoms",
		Shorts: "bottoms",
		Chinos: "bottoms",
		Jacket: "outerwear",
		Blazer: "outerwear",
		Coat: "outerwear",
		Sneakers: "shoes",
		"Dress Shoes": "shoes",
		Boots: "shoes",
		Sandals: "shoes",
		Dress: "dresses",
		Skirt: "bottoms",
		Other: "other",
		// Polish names (legacy support)
		Koszulka: "tops",
		Spodnie: "bottoms",
		Bluza: "tops",
		Kurtka: "outerwear",
		Buty: "shoes",
		Akcesoria: "accessories",
		Bielizna: "underwear",
		Inne: "other",
	};

	return categoryMap[category] || "other";
}

/**
 * Uploads an image to Supabase Storage and returns the public URL.
 */
export async function uploadGarmentImage(file: File, userId: string): Promise<{ url?: string; path?: string; error?: string }> {
	if (!clientEnv.isSupabaseConfigured) {
		return { error: "Supabase is not configured" };
	}

	const supabase = tryGetSupabaseBrowser();

	if (!supabase) {
		return { error: "Supabase client not available" };
	}

	try {
		// Generate unique filename
		const fileExt = file.name.split(".").pop();
		const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
		const filePath = `garments/${fileName}`;

		// Upload file to storage
		const { error: uploadError } = await supabase.storage.from("wardrobe-images").upload(filePath, file, {
			cacheControl: "3600",
			upsert: false,
		});

		if (uploadError) {
			console.error("Error uploading image:", uploadError);
			return { error: uploadError.message };
		}

		// Get public URL
		const {
			data: { publicUrl },
		} = supabase.storage.from("wardrobe-images").getPublicUrl(filePath);

		return { url: publicUrl, path: filePath };
	} catch (error) {
		console.error("Unexpected error uploading image:", error);
		return { error: "An unexpected error occurred" };
	}
}
