// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

// 1. Funkcja fabryczna
export function createClient() {
	return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
		cookieOptions: {
			// FIX: Wyłączamy flagę Secure w trybie developerskim (LAN)
			secure: process.env.NODE_ENV === "production",
		},
	});
}

// 2. Singleton dla przeglądarki
// FIX: Tutaj wywołujemy createClient(), aby eksportować OBIEKT, a nie funkcję!
// Dzięki temu w queries.ts zadziała supabaseBrowser.from()
export const supabaseBrowser = createClient();

// 3. Helper dla auth.ts / WardrobePageClient
// Jeśli inne pliki oczekują funkcji zwracającej klienta, dajemy im wrapper.
export const tryGetSupabaseBrowser = () => supabaseBrowser;
