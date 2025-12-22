// src/middleware.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});

	const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
		cookies: {
			get(name: string) {
				return request.cookies.get(name)?.value;
			},
			set(name: string, value: string, options: CookieOptions) {
				// FIX: Konsekwentne wymuszanie secure: false
				const cookieOptions = {
					...options,
					secure: process.env.NODE_ENV === "production",
				};

				request.cookies.set({ name, value, ...cookieOptions });
				response = NextResponse.next({
					request: { headers: request.headers },
				});
				response.cookies.set({ name, value, ...cookieOptions });
			},
			remove(name: string, options: CookieOptions) {
				const cookieOptions = {
					...options,
					secure: process.env.NODE_ENV === "production",
				};

				request.cookies.set({ name, value: "", ...cookieOptions });
				response = NextResponse.next({
					request: { headers: request.headers },
				});
				response.cookies.set({ name, value: "", ...cookieOptions });
			},
		},
	});

	const {
		data: { user },
	} = await supabase.auth.getUser();

	const protectedPaths = ["/wardrobe", "/outfit", "/capsule", "/scanner", "/admin"];
	const isProtected = protectedPaths.some((path) => request.nextUrl.pathname.includes(path));

	if (isProtected && !user) {
		const url = request.nextUrl.clone();
		const lang = url.pathname.split("/")[1] || "en";
		url.pathname = `/${lang}/login`;
		url.searchParams.set("next", request.nextUrl.pathname);
		return NextResponse.redirect(url);
	}

	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public files (images, etc)
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
