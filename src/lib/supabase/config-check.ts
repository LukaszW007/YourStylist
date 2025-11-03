/**
 * Safe helper to check if Supabase is configured
 * This checks environment variables without triggering requireEnv() errors
 */

export function isSupabaseConfigured(): boolean {
	try {
		// Check both server and client side
		// In browser, Next.js exposes NEXT_PUBLIC_ vars as strings in the bundle
		const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
		return Boolean(url && key);
	} catch {
		return false;
	}
}
