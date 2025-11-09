import { tryGetSupabaseBrowser } from "./client";
import { clientEnv } from "@/env";
import type { Database } from "./types";

type GarmentInsert = Database["public"]["Tables"]["garments"]["Insert"];

export interface GarmentData {
	name: string;
	category: string;
	color: string;
	image_url: string;
	image_storage_path?: string;
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
		const garmentRecords: GarmentInsert[] = garments.map((garment) => ({
			user_id: user.id,
			name: garment.name,
			category: mapCategoryToDb(garment.category),
			color: garment.color,
			image_url: garment.image_url,
			image_storage_path: garment.image_storage_path,
		}));

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
 * Maps Polish category names to database enum values
 */
function mapCategoryToDb(polishCategory: string): string {
	const categoryMap: Record<string, string> = {
		Koszulka: "tops",
		Spodnie: "bottoms",
		Bluza: "tops",
		Kurtka: "outerwear",
		Buty: "shoes",
		Akcesoria: "accessories",
		Bielizna: "underwear",
		Inne: "other",
	};

	return categoryMap[polishCategory] || "other";
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
