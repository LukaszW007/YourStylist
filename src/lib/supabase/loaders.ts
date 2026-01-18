"use client";
/**
 * Data loader helpers built on top of safeQueries.
 * These abstract away configuration checks and provide unified responses.
 */
import { safeQueries } from "@/lib/supabase/safeQueries";
import type { Database } from "@/lib/supabase/types";

type GarmentRow = Database["public"]["Tables"]["garments"]["Row"];

export type LoaderResult<T> = {
	data: T;
	configured: boolean;
};

export async function fetchWardrobe(
	userId: string,
	filters?: {
		category?: string;
		color?: string;
		season?: string;
		brand?: string;
	}
): Promise<LoaderResult<GarmentRow[]>> {
	const queries = await safeQueries();
	if (!queries.configured) {
		return { data: [], configured: false };
	}
	const garments = await queries.getGarments(userId, filters);
	return { data: garments, configured: true };
}

type BasicOutfit = { id: string; name: string };

export async function fetchOutfits(): Promise<LoaderResult<BasicOutfit[]>> {
	const queries = await safeQueries();
	if (!queries.configured) {
		return { data: [], configured: false };
	}
	// Placeholder: implement real outfit query when available in queries.ts
	// For now return empty until queries expose getOutfits
	return { data: [], configured: true };
}

export async function updateGarment(garmentId: string, updates: Record<string, unknown>): Promise<LoaderResult<unknown>> {
	const queries = await safeQueries();
	if (!queries.configured) {
		return { data: null, configured: false };
	}

	const result = await queries.updateGarment(garmentId, updates);
	return { data: result, configured: true };
}
