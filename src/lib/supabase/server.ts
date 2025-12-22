// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
	const cookieStore = await cookies();

	return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
		cookies: {
			getAll() {
				return cookieStore.getAll();
			},
			setAll(cookiesToSet) {
				try {
					cookiesToSet.forEach(({ name, value, options }) => {
						// FIX: Wymuszamy secure: false w dev, niezależnie co sugeruje Supabase
						cookieStore.set(name, value, {
							...options,
							secure: process.env.NODE_ENV === "production",
						});
					});
				} catch {
					// Ignorujemy błąd w Server Components (nie-Action)
				}
			},
		},
	});
}
