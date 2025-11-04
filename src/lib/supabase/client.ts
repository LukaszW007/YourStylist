"use client";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { clientEnv } from "@/env";
import type { Database } from "./types";

// Lazy-load Supabase client to avoid accessing env vars during module import
let _supabaseBrowser: SupabaseClient<Database> | null = null;

export function tryGetSupabaseBrowser(): SupabaseClient<Database> | null {
	if (_supabaseBrowser) return _supabaseBrowser;
	const url = clientEnv.supabaseUrl;
	const key = clientEnv.supabaseAnonKey;
	if (!url || !key) return null; // Not configured – return null instead of throwing.
	_supabaseBrowser = createClient<Database>(url, key, {
		auth: {
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: true,
		},
	});
	return _supabaseBrowser;
}

// Backwards-compatible proxy (will throw only when a method is actually invoked on missing config)
export const supabaseBrowser = new Proxy({} as SupabaseClient<Database>, {
	get(_target, prop) {
		const client = tryGetSupabaseBrowser();
		if (!client) {
			throw new Error("Supabase client requested but environment variables are not configured.");
		}
		const value = client[prop as keyof SupabaseClient<Database>];
		return typeof value === "function" ? value.bind(client) : value;
	},
});
