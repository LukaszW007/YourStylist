"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextValue {
	user: User | null;
	session: Session | null;
	loading: boolean;
	refresh: () => Promise<void>;
	configured: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [configured, setConfigured] = useState(false);
	const [loading, setLoading] = useState(true);

	const init = useCallback(async () => {
		try {
			const { isSupabaseConfigured } = await import("@/lib/supabase/config-check");
			const ok = isSupabaseConfigured();
			setConfigured(ok);
			if (!ok) {
				setLoading(false);
				return;
			}
			const { getSession, getCurrentUser, onAuthStateChange } = await import("@/lib/supabase/auth");
			const currentSession = await getSession();
			setSession(currentSession);
			if (currentSession?.user) setUser(currentSession.user);
			else {
				const maybeUser = await getCurrentUser();
				setUser(maybeUser);
			}
			// subscribe to changes
			const { data: subscription } = onAuthStateChange((event, s) => {
				setSession(s);
				setUser(s?.user ?? null);
			});
			setLoading(false);
			return () => {
				subscription.subscription?.unsubscribe();
			};
		} catch (e) {
			console.debug("AuthProvider init skipped", e);
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		init();
	}, [init]);

	const refresh = useCallback(async () => {
		if (!configured) return;
		try {
			const { getSession } = await import("@/lib/supabase/auth");
			const s = await getSession();
			setSession(s);
			setUser(s?.user ?? null);
		} catch (e) {
			console.debug("Refresh failed", e);
		}
	}, [configured]);

	return <AuthContext.Provider value={{ user, session, loading, refresh, configured }}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
