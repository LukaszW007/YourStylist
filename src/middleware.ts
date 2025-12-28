import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});

	const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) => {
					request.cookies.set(name, value);
				});
				response = NextResponse.next({
					request: {
						headers: request.headers,
					},
				});
				cookiesToSet.forEach(({ name, value, options }) => {
					// FIX: Ustawiamy secure tylko na https (produkcja) i localhost
					// Na IP w sieci lokalnej (http) secure musi być false!
					response.cookies.set({
						name,
						value,
						...options,
					});
				});
			},
		},
	});

	// Odświeżenie sesji (To zapobiega wylogowaniu!)
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Ochrona tras
	const protectedPaths = ["/wardrobe", "/outfit", "/capsule", "/scanner", "/admin"];
	const isProtected = protectedPaths.some((path) => request.nextUrl.pathname.includes(path));

	if (isProtected && !user) {
		const url = request.nextUrl.clone();
		const lang = url.pathname.split("/")[1] || "en";
		url.pathname = `/${lang}/sign-in`; // Upewnij się, że masz trasę /sign-in, a nie /login
		url.searchParams.set("next", request.nextUrl.pathname);
		return NextResponse.redirect(url);
	}

	return response;
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
