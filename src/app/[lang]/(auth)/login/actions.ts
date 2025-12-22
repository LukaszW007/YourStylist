"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server"; // Nowy import
import { getDictionary } from "@/lib/i18n/get-dictionary"; // Upewnij się co do ścieżki słownika

export type LoginFormState = {
	errors?: {
		email?: string[];
		password?: string[];
		form?: string[];
	};
	message?: string;
};

export async function loginAction(lang: string, prevState: LoginFormState, formData: FormData): Promise<LoginFormState> {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	// Walidacja podstawowa
	if (!email || !password) {
		return {
			errors: {
				form: ["Email and password are required"],
			},
		};
	}

	// UWAGA: createClient jest teraz async w Next.js 15
	const supabase = await createClient();

	const { error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		console.error("Login error:", error.message);
		return {
			errors: {
				form: ["Invalid login credentials"],
			},
		};
	}

	// Przekierowanie po sukcesie
	redirect(`/${lang}/outfit/today`);
}
