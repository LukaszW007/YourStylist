import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { clientEnv } from "@/env";

/**
 * OAuth callback handler for Supabase Auth
 * Handles the redirect after Google OAuth sign in
 */
export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");
	const next = requestUrl.searchParams.get("next") || "/en";

	if (code) {
		const supabase = createClient(clientEnv.supabaseUrl, clientEnv.supabaseAnonKey);

		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (!error) {
			// Successfully authenticated, redirect to the app
			return NextResponse.redirect(new URL(next, requestUrl.origin));
		}
	}

	// If there's an error or no code, redirect to sign-in
	return NextResponse.redirect(new URL("/en/sign-in", requestUrl.origin));
}

