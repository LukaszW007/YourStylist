import { createClient } from "@supabase/supabase-js";

import { serverEnv } from "@/env";

export function supabaseServer() {
	const serviceKey = serverEnv.supabaseServiceKey ?? serverEnv.supabaseAnonKey;
	if (!serverEnv.supabaseUrl) {
		throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
	}
	if (!serviceKey) {
		throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
	}
	return createClient(serverEnv.supabaseUrl, serviceKey);
}
