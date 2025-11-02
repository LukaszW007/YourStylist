"use client";
/**
 * safeQueries: Wraps Supabase data queries; returns stubbed implementations when not configured.
 */
import { isSupabaseConfigured } from "@/lib/supabase/config-check";

import type { Database } from "./types";

// Minimal shape definitions (avoid importing queries if not configured)
export type UserPreferences = Database["public"]["Tables"]["user_preferences"]["Row"];
export type Garment = Database["public"]["Tables"]["garments"]["Row"];
export type Outfit = Database["public"]["Tables"]["outfits"]["Row"];

export type SafeQueriesApi = {
  configured: boolean;
  getUserPreferences: (userId: string) => Promise<UserPreferences | null>;
  updateUserPreferences: (userId: string, updates: Partial<UserPreferences>) => Promise<UserPreferences | null>;
  getGarments: (
    userId: string,
    filters?: { category?: string; color?: string; season?: string; brand?: string }
  ) => Promise<Garment[]>;
  createGarment: (
    userId: string,
    garment: Omit<Garment, "id" | "user_id" | "created_at" | "updated_at" | "wear_count">
  ) => Promise<Garment | null>;
  updateGarment: (
    garmentId: string,
    updates: Partial<Omit<Garment, "id" | "user_id" | "created_at" | "updated_at">>
  ) => Promise<Garment | null>;
  deleteGarment: (garmentId: string) => Promise<boolean>;
  markGarmentAsWorn: (garmentId: string) => Promise<Garment | null>;
};

export async function safeQueries(): Promise<SafeQueriesApi> {
  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      getUserPreferences: async () => null,
      updateUserPreferences: async (_userId, updates) => {
        // Construct a minimal preferences object using provided updates
        return {
          ...(updates as Partial<UserPreferences>),
          user_id: _userId,
        } as UserPreferences;
      },
      getGarments: async () => [],
      createGarment: async () => null,
      updateGarment: async () => null,
      deleteGarment: async () => true,
      markGarmentAsWorn: async () => null,
    };
  }
  const queries = await import("@/lib/supabase/queries");
  return {
    configured: true,
    getUserPreferences: queries.getUserPreferences,
    updateUserPreferences: queries.updateUserPreferences,
    getGarments: queries.getGarments,
    createGarment: queries.createGarment,
    updateGarment: queries.updateGarment,
    deleteGarment: queries.deleteGarment,
    markGarmentAsWorn: queries.markGarmentAsWorn,
  };
}
