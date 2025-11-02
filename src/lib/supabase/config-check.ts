/**
 * Safe helper to check if Supabase is configured
 * This checks environment variables without triggering requireEnv() errors
 */

export function isSupabaseConfigured(): boolean {
	if (typeof window === "undefined") {
		return false;
	}

	try {
		const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
		return Boolean(url && key);
	} catch {
		return false;
	}
}

