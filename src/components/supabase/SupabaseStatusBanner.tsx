"use client";
import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config-check";

export function SupabaseStatusBanner() {
	const [configured, setConfigured] = useState<boolean | null>(null);

	useEffect(() => {
		setConfigured(isSupabaseConfigured());
	}, []);

	if (configured === null) return null; // hydration guard
	if (configured) return null;

	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 m-2 rounded-lg border border-yellow-600 bg-yellow-100 px-4 py-3 text-sm text-yellow-900 shadow">
			<strong className="font-semibold">Demo Mode:</strong> Cloud sync disabled. Supabase environment variables not configured. Data changes are
			local/ephemeral.
		</div>
	);
}
