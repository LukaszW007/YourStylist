"use client";

import { supabaseBrowser } from "./client";
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
	try {
		const { data, error } = await supabaseBrowser.auth.signInWithPassword({
			email,
			password,
		});

		return {
			user: data.user,
			session: data.session,
			error: error,
		};
	} catch (error) {
		return {
			user: null,
			session: null,
			error: error as AuthError,
		};
	}
}

/**
 * Sign up with email and password
 * Automatically creates user_profile and user_preferences via database trigger
 */
export async function signUpWithEmail({ email, password, displayName }: SignUpCredentials): Promise<AuthResult> {
	try {
		const { data, error } = await supabaseBrowser.auth.signUp({
			email,
			password,
			options: {
				data: {
					display_name: displayName || email.split("@")[0],
				},
			},
		});

		return {
			user: data.user,
			session: data.session,
			error: error,
		};
	} catch (error) {
		return {
			user: null,
			session: null,
			error: error as AuthError,
		};
	}
}

/**
 * Sign in with Google OAuth
 * Requires Google OAuth to be configured in Supabase Dashboard
 */
export async function signInWithGoogle(redirectTo?: string): Promise<{ error: AuthError | null }> {
	try {
		const { error } = await supabaseBrowser.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
			},
		});

		return { error };
	} catch (error) {
		return {
			error: error as AuthError,
		};
	}
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
	try {
		const { error } = await supabaseBrowser.auth.signOut();
		return { error };
	} catch (error) {
		return {
			error: error as AuthError,
		};
	}
}

/**
 * Get the current session
 */
export async function getSession(): Promise<Session | null> {
	const {
		data: { session },
	} = await supabaseBrowser.auth.getSession();
	return session;
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
	const {
		data: { user },
	} = await supabaseBrowser.auth.getUser();
	return user;
}

/**
 * Listen to auth state changes
 * Useful for updating UI when user signs in/out
 */
export function onAuthStateChange(
	callback: (event: string, session: Session | null) => void
) {
	return supabaseBrowser.auth.onAuthStateChange((event, session) => {
		callback(event, session);
	});
}

