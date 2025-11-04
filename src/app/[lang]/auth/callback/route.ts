import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * OAuth callback handler for Supabase Auth
 * Handles the redirect after Google OAuth sign in
 * Guarded to handle missing Supabase configuration gracefully
 */
export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");
	// Derive lang from dynamic segment /{lang}/auth/callback
	const pathParts = requestUrl.pathname.split("/").filter(Boolean);
	const lang = pathParts[0] || "en";
	const next = requestUrl.searchParams.get("next") || `/${lang}`;

	// Check if Supabase is configured before attempting to exchange code
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		// Supabase not configured, redirect to sign-in with error (respect language)
		console.warn("OAuth callback called but Supabase is not configured");
		return NextResponse.redirect(new URL(`/${lang}/sign-in?error=auth_unavailable`, requestUrl.origin));
	}

	if (code) {
		const supabase = createClient(supabaseUrl, supabaseAnonKey);

		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (!error) {
			// Successfully authenticated, redirect to the app
			return NextResponse.redirect(new URL(next, requestUrl.origin));
		}
	}

	// If there's an error or no code, redirect to sign-in
	return NextResponse.redirect(new URL(`/${lang}/sign-in`, requestUrl.origin));
}
