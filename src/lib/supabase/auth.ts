"use client";

import { tryGetSupabaseBrowser } from "./client";
import { clientEnv } from "../../env";
import type { AuthError, User, Session } from "@supabase/supabase-js";

/**
 * Authentication helper functions for Supabase Auth
 * Handles: email/password sign in, sign up, Google OAuth, sign out
 */

export type SignInCredentials = {
	email: string;
	password: string;
};

export type SignUpCredentials = {
	email: string;
	password: string;
	displayName?: string;
};

export type AuthResult = {
	user: User | null;
	session: Session | null;
	error: AuthError | null;
};

/**
 * Sign in with email and password
 */
export async function signInWithEmail({ email, password }: SignInCredentials): Promise<AuthResult> {
	if (!clientEnv.isSupabaseConfigured) {
		return { user: null, session: null, error: null };
	}
	try {
		const client = tryGetSupabaseBrowser();
		const { data, error } = await client!.auth.signInWithPassword({ email, password });
		return { user: data.user, session: data.session, error };
	} catch (error) {
		return { user: null, session: null, error: error as AuthError };
	}
}

/**
 * Sign up with email and password
 * Automatically creates user_profile and user_preferences via database trigger
 */
export async function signUpWithEmail({ email, password, displayName }: SignUpCredentials): Promise<AuthResult> {
	if (!clientEnv.isSupabaseConfigured) {
		return { user: null, session: null, error: null };
	}
	try {
		const client = tryGetSupabaseBrowser();
		const { data, error } = await client!.auth.signUp({
			email,
			password,
			options: { data: { display_name: displayName || email.split("@")[0] } },
		});
		return { user: data.user, session: data.session, error };
	} catch (error) {
		return { user: null, session: null, error: error as AuthError };
	}
}

/**
 * Sign in with Google OAuth
 * Requires Google OAuth to be configured in Supabase Dashboard
 */
export async function signInWithGoogle(redirectTo?: string): Promise<{ error: AuthError | null }> {
	if (!clientEnv.isSupabaseConfigured) {
		return { error: null }; // silently noop for demo mode
	}
	try {
		const client = tryGetSupabaseBrowser();

		// Use the current origin (preserves IP address for mobile testing)
		const origin = typeof window !== "undefined" ? window.location.origin : "";
		const defaultRedirect = `${origin}/en/auth/callback`;
		const finalRedirectTo = redirectTo || defaultRedirect;

		console.log("🔐 OAuth Debug:");
		console.log("  - Current origin:", origin);
		console.log("  - Redirect URL:", finalRedirectTo);
		console.log("  - User agent:", navigator.userAgent.substring(0, 50));

		const { error } = await client!.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: finalRedirectTo,
				skipBrowserRedirect: false,
			},
		});
		return { error };
	} catch (error) {
		return { error: error as AuthError };
	}
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
	if (!clientEnv.isSupabaseConfigured) return { error: null };
	try {
		const client = tryGetSupabaseBrowser();
		const { error } = await client!.auth.signOut();
		return { error };
	} catch (error) {
		return { error: error as AuthError };
	}
}

/**
 * Get the current session
 */
export async function getSession(): Promise<Session | null> {
	if (!clientEnv.isSupabaseConfigured) return null;
	const client = tryGetSupabaseBrowser();
	const { data } = await client!.auth.getSession();
	return data.session;
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
	if (!clientEnv.isSupabaseConfigured) return null;
	const client = tryGetSupabaseBrowser();
	const { data } = await client!.auth.getUser();
	return data.user;
}

/**
 * Listen to auth state changes
 * Useful for updating UI when user signs in/out
 */
export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
	const client = tryGetSupabaseBrowser();
	if (!client) {
		// return dummy subscription
		// Minimal typed stub matching shape { data: { subscription: { unsubscribe: () => void } } }
		return { data: { subscription: { unsubscribe: () => void 0 } } } as { data: { subscription: { unsubscribe: () => void } } };
	}
	return client.auth.onAuthStateChange((event, session) => callback(event, session));
}
