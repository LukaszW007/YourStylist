"use client";

import { supabaseBrowser } from "./client";
import type { Database } from "./types";

// Type definitions from database schema
type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
type UserPreferences = Database["public"]["Tables"]["user_preferences"]["Row"];
type Garment = Database["public"]["Tables"]["garments"]["Row"];
type Outfit = Database["public"]["Tables"]["outfits"]["Row"];
type OutfitInsert = Database["public"]["Tables"]["outfits"]["Insert"];

/**
 * USER PROFILE QUERIES
 */

/**
 * Get user profile by user ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
	const { data, error } = await supabaseBrowser
		.from("user_profiles")
		.select("*")
		.eq("id", userId)
		.single();

	if (error) {
		console.error("Error fetching user profile:", error);
		return null;
	}

	return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
	userId: string,
	updates: Partial<Pick<UserProfile, "display_name" | "avatar_url">>
): Promise<UserProfile | null> {
	const { data, error } = await supabaseBrowser
		.from("user_profiles")
		.update(updates)
		.eq("id", userId)
		.select()
		.single();

	if (error) {
		console.error("Error updating user profile:", error);
		return null;
	}

	return data;
}

/**
 * USER PREFERENCES QUERIES
 */

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
	const { data, error } = await supabaseBrowser
		.from("user_preferences")
		.select("*")
		.eq("user_id", userId)
		.single();

	if (error) {
		console.error("Error fetching user preferences:", error);
		return null;
	}

	return data;
}

/**
 * Update user preferences (e.g., language, theme)
 */
export async function updateUserPreferences(
	userId: string,
	updates: Partial<UserPreferences>
): Promise<UserPreferences | null> {
	const { data, error } = await supabaseBrowser
		.from("user_preferences")
		.update(updates)
		.eq("user_id", userId)
		.select()
		.single();

	if (error) {
		console.error("Error updating user preferences:", error);
		return null;
	}

	return data;
}

/**
 * GARMENTS QUERIES
 */

/**
 * Get all garments for a user
 */
export async function getGarments(
	userId: string,
	filters?: {
		category?: string;
		color?: string;
		season?: string;
		brand?: string;
	}
): Promise<Garment[]> {
	let query = supabaseBrowser.from("garments").select("*").eq("user_id", userId);

	if (filters?.category) {
		query = query.eq("category", filters.category);
	}
	if (filters?.color) {
		query = query.eq("color", filters.color);
	}
	if (filters?.brand) {
		query = query.eq("brand", filters.brand);
	}
	if (filters?.season) {
		query = query.contains("season", [filters.season]);
	}

	const { data, error } = await query.order("created_at", { ascending: false });

	if (error) {
		console.error("Error fetching garments:", error);
		return [];
	}

	return data || [];
}

/**
 * Create a new garment
 */
export async function createGarment(
	userId: string,
	garment: Omit<Garment, "id" | "user_id" | "created_at" | "updated_at" | "wear_count">
): Promise<Garment | null> {
	const { data, error } = await supabaseBrowser
		.from("garments")
		.insert({
			...garment,
			user_id: userId,
		})
		.select()
		.single();

	if (error) {
		console.error("Error creating garment:", error);
		return null;
	}

	return data;
}

/**
 * Update a garment
 */
export async function updateGarment(
	garmentId: string,
	updates: Partial<Omit<Garment, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<Garment | null> {
	const { data, error } = await supabaseBrowser
		.from("garments")
		.update(updates)
		.eq("id", garmentId)
		.select()
		.single();

	if (error) {
		console.error("Error updating garment:", error);
		return null;
	}

	return data;
}

/**
 * Delete a garment
 */
export async function deleteGarment(garmentId: string): Promise<boolean> {
	const { error } = await supabaseBrowser.from("garments").delete().eq("id", garmentId);

	if (error) {
		console.error("Error deleting garment:", error);
		return false;
	}

	return true;
}

/**
 * Update last worn date and increment wear count
 */
export async function markGarmentAsWorn(garmentId: string): Promise<Garment | null> {
	const { data: garment } = await supabaseBrowser
		.from("garments")
		.select("*")
		.eq("id", garmentId)
		.single();

	if (!garment) return null;

	const { data, error } = await supabaseBrowser
		.from("garments")
		.update({
			last_worn_date: new Date().toISOString().split("T")[0],
			wear_count: (garment.wear_count || 0) + 1,
		})
		.eq("id", garmentId)
		.select()
		.single();

	if (error) {
		console.error("Error marking garment as worn:", error);
		return null;
	}

	return data;
}

