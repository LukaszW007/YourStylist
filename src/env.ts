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

export const clientEnv = {
	supabaseUrl: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
	supabaseAnonKey: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
};

export const serverEnv = {
	freeGeminiKey: optionalEnv("FREE_GEMINI_KEY", "GEMINI_API_KEY", "NEXT_PUBLIC_GEMINI_API_KEY"),
	paidGeminiKey: optionalEnv("PAID_GEMINI_KEY"),
	supabaseServiceKey: optionalEnv("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_ANON_KEY"),
	supabaseUrl: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
	supabaseAnonKey: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
};
