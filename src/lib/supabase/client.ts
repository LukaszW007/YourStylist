"use client";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { clientEnv } from "@/env";
import type { Database } from "./types";

let _supabaseBrowser: SupabaseClient<Database> | null = null;

export function tryGetSupabaseBrowser(): SupabaseClient<Database> | null {
	if (!clientEnv.isSupabaseConfigured) return null;
	if (!_supabaseBrowser) {
		_supabaseBrowser = createClient<Database>(clientEnv.supabaseUrl, clientEnv.supabaseAnonKey, {
			auth: {
				autoRefreshToken: true,
				persistSession: true,
				detectSessionInUrl: true,
			},
		});
	}
	return _supabaseBrowser;
}

// Deprecated direct proxy export kept for backward compatibility but made safe (returns noop stubs when unconfigured)
export const supabaseBrowser = new Proxy({} as SupabaseClient<Database>, {
	get(_target, prop) {
		const client = tryGetSupabaseBrowser();
		if (!client) {
			// Provide minimal auth stub to avoid crashes when referenced inadvertently.
			if (prop === "auth") {
				return {
					signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
					signUp: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
					signInWithOAuth: async () => ({ error: { message: "Supabase not configured" } }),
					getSession: async () => ({ data: { session: null } }),
					getUser: async () => ({ data: { user: null } }),
					signOut: async () => ({ error: null }),
					onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => void 0 } } }),
				};
			}
			return undefined;
		}
		const value = client[prop as keyof SupabaseClient<Database>];
		return typeof value === "function" ? value.bind(client) : value;
	},
});
