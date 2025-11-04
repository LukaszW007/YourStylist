// Strict retrieval (server-only recommended). Avoid using requireEnv in client code.
function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing environment variable: ${name}`);
	}
	return value;
}

function optionalEnv(...names: string[]): string | undefined {
	for (const name of names) {
		const value = process.env[name];
		if (value) {
			return value;
		}
	}
	return undefined;
}

// Use getters to lazy-load env vars instead of eager evaluation
// This prevents errors during module import when env vars aren't loaded yet
// Non-throwing client env access. Returns empty string if missing so callers can guard.
export const clientEnv = {
	get supabaseUrl(): string {
		return process.env.NEXT_PUBLIC_SUPABASE_URL || "";
	},
	get supabaseAnonKey(): string {
		return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
	},
	get isSupabaseConfigured(): boolean {
		return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
	},
};

export const serverEnv = {
	get freeGeminiKey(): string | undefined {
		return optionalEnv("FREE_GEMINI_KEY", "GEMINI_API_KEY", "NEXT_PUBLIC_GEMINI_API_KEY");
	},
	get paidGeminiKey(): string | undefined {
		return optionalEnv("PAID_GEMINI_KEY");
	},
	get supabaseServiceKey(): string | undefined {
		return optionalEnv("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_ANON_KEY");
	},
	get supabaseUrl(): string {
		return requireEnv("NEXT_PUBLIC_SUPABASE_URL");
	},
	get supabaseAnonKey(): string {
		return requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
	},
};
