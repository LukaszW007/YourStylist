import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * OAuth callback handler for Supabase Auth
 * Handles the redirect after Google OAuth sign in
 * Guarded to handle missing Supabase configuration gracefully
 */
export async function GET(request: Request) {
	const requestUrl = new URL(request.url);

	// Fix: Use the Host header to get the actual origin (preserves mobile IP)
	const host = request.headers.get("host") || requestUrl.host;
	const protocol = host.includes("localhost") || host.includes("192.168") ? "http" : "https";
	const actualOrigin = `${protocol}://${host}`;

	const code = requestUrl.searchParams.get("code");
	// Derive lang from dynamic segment /{lang}/auth/callback
	const pathParts = requestUrl.pathname.split("/").filter(Boolean);
	const lang = pathParts[0] || "en";
	const next = requestUrl.searchParams.get("next") || `/${lang}`;

	console.log("📱 Callback received from:", host);
	console.log("   Actual origin:", actualOrigin);
	console.log("   Request URL origin:", requestUrl.origin);

	// Check if Supabase is configured before attempting to exchange code
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		// Supabase not configured, redirect to sign-in with error (respect language)
		console.warn("OAuth callback called but Supabase is not configured");
		return NextResponse.redirect(new URL(`/${lang}/sign-in?error=auth_unavailable`, actualOrigin));
	}

	if (code) {
		const supabase = createClient(supabaseUrl, supabaseAnonKey);

		console.log("🔐 OAuth Callback Debug:");
		console.log("  - Request URL:", requestUrl.href);
		console.log("  - Request Origin:", requestUrl.origin);
		console.log("  - Code received:", code.substring(0, 20) + "...");
		console.log("  - Next param:", next);
		console.log("  - Lang:", lang);

		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (!error) {
			// Successfully authenticated, redirect to the app using actual origin
			const redirectUrl = new URL(next, actualOrigin);
			console.log("  ✅ Auth successful, redirecting to:", redirectUrl.href);
			return NextResponse.redirect(redirectUrl);
		} else {
			console.log("  ❌ Auth error:", error.message);
		}
	}

	// If there's an error or no code, redirect to sign-in using actual origin
	const fallbackUrl = new URL(`/${lang}/sign-in`, actualOrigin);
	console.log("  ⚠️ No code or error, redirecting to:", fallbackUrl.href);
	return NextResponse.redirect(fallbackUrl);
}
