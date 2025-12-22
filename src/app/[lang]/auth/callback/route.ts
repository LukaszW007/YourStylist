import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");
	const next = requestUrl.searchParams.get("next") ?? "/";

	// 1. USTALENIE POPRAWNEGO ADRESU ZWROTNEGO (FIX DLA 0.0.0.0)
	// Zamiast ufać request.url (który widzi serwer), bierzemy nagłówek Host (który widzi przeglądarka)
	const host = request.headers.get("host") ?? requestUrl.host;
	const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
	const origin = `${protocol}://${host}`;

	// Wyciągamy język z URL callbacku, np. /en/auth/callback -> en
	const pathParts = request.nextUrl.pathname.split("/").filter(Boolean);
	const lang = pathParts[0] === "auth" ? "en" : pathParts[0] || "en";

	if (code) {
		const cookieStore = await cookies();

		const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
					} catch {
						// Ignorujemy błędy setAll w Server Component (Next.js specific)
					}
				},
			},
		});

		// Wymiana kodu na sesję
		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (!error) {
			// 2. PRZEKIEROWANIE NA POPRAWNY ORIGIN (192.168...)
			// Upewniamy się, że ścieżka zaczyna się od "/"
			const cleanNext = next.startsWith("/") ? next : `/${next}`;

			// Budujemy finalny URL z uwzględnieniem języka
			// Jeśli next już zawiera język (np. /en/wardrobe), nie dodajemy go ponownie
			const targetPath = cleanNext.startsWith(`/${lang}`) ? cleanNext : `/${lang}${cleanNext === "/" ? "" : cleanNext}`;

			const finalUrl = `${origin}${targetPath}`;

			console.log(`✅ Auth Success via ${host}. Redirecting to: ${finalUrl}`);
			return NextResponse.redirect(finalUrl);
		} else {
			console.error("❌ Auth Exchange Error:", error);
		}
	}

	// Fallback w przypadku błędu
	return NextResponse.redirect(`${origin}/${lang}/sign-in?error=auth_code_error`);
}
