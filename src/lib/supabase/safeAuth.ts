"use client";
/**
 * safeAuth: Provides an auth API that gracefully no-ops when Supabase is not configured.
 */
import { isSupabaseConfigured } from "@/lib/supabase/config-check";

import type { AuthError, Session, User } from "@supabase/supabase-js";

export type SafeAuthApi = {
  configured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ user: User | null; session: Session | null; error: AuthError | null }>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<{ user: User | null; session: Session | null; error: AuthError | null }>;
  signInWithGoogle: (redirectTo?: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  getCurrentUser: () => Promise<User | null>;
  getSession: () => Promise<Session | null>;
};

export async function safeAuth(): Promise<SafeAuthApi> {
  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      signInWithEmail: async () => ({ user: null, session: null, error: null }),
      signUpWithEmail: async () => ({ user: null, session: null, error: null }),
      signInWithGoogle: async () => ({ error: null }),
      signOut: async () => ({ error: null }),
      getCurrentUser: async () => null,
      getSession: async () => null,
    };
  }
  const auth = await import("@/lib/supabase/auth");
  return {
    configured: true,
    signInWithEmail: async (email, password) => auth.signInWithEmail({ email, password }),
    signUpWithEmail: async (email, password, displayName) => auth.signUpWithEmail({ email, password, displayName }),
    signInWithGoogle: auth.signInWithGoogle,
    signOut: auth.signOut,
    getCurrentUser: auth.getCurrentUser,
    getSession: auth.getSession,
  };
}
