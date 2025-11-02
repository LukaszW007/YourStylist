"use client";
import { createClient } from "@supabase/supabase-js";

import { clientEnv } from "@/env";
import type { Database } from "./types";

export const supabaseBrowser = createClient<Database>(
	clientEnv.supabaseUrl,
	clientEnv.supabaseAnonKey,
	{
		auth: {
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: true,
		},
	}
);
