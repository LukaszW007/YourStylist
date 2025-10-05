"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { supabaseServer } from "@/lib/supabase/server";

export type LoginFormState = {
	status: "idle" | "error";
	message?: string;
	values: {
		email: string;
	};
	fieldErrors?: {
		email?: string;
		password?: string;
	};
};

export const initialState: LoginFormState = {
	status: "idle",
	values: {
		email: "",
	},
};

function getValue(entry: FormDataEntryValue | null) {
	return typeof entry === "string" ? entry.trim() : "";
}

function validateCredentials(email: string, password: string) {
	const fieldErrors: LoginFormState["fieldErrors"] = {};

	if (!email) {
		fieldErrors.email = "Email is required.";
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		fieldErrors.email = "Enter a valid email address.";
	}

	if (!password) {
		fieldErrors.password = "Password is required.";
	}

	return fieldErrors;
}

export async function loginAction(lang: string, _prevState: LoginFormState, formData: FormData): Promise<LoginFormState> {
	const email = getValue(formData.get("email"));
	const password = getValue(formData.get("password"));

	const nextState: LoginFormState = {
		status: "idle",
		values: {
			email,
		},
	};

	const fieldErrors = validateCredentials(email, password);

	if (fieldErrors.email || fieldErrors.password) {
		return {
			...nextState,
			status: "error",
			message: "Please fix the highlighted fields and try again.",
			fieldErrors,
		};
	}

	try {
		const supabase = supabaseServer();
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			return {
				...nextState,
				status: "error",
				message: error.message,
			};
		}

		revalidatePath(`/${lang}`);
		redirect(`/${lang}`);
	} catch (error) {
		console.error("loginAction error", error);
		return {
			...nextState,
			status: "error",
			message: "We couldn't sign you in right now. Please try again shortly.",
		};
	}
}
