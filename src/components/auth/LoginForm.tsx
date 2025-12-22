"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card } from "@/components/ui/Card";
import { loginAction } from "@/app/[lang]/(auth)/login/actions";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { tryGetSupabaseBrowser } from "@/lib/supabase/client"; // Import z Kroku 2

// Prosta ikona Google
function GoogleIcon() {
	return (
		<svg
			className="mr-2 h-4 w-4"
			aria-hidden="true"
			focusable="false"
			data-prefix="fab"
			data-icon="google"
			role="img"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 488 512"
		>
			<path
				fill="currentColor"
				d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
			></path>
		</svg>
	);
}

type LoginFormState = {
	errors?: {
		email?: string[];
		password?: string[];
		form?: string[];
	};
	message?: string;
};

const initialState: LoginFormState = {
	message: "",
	errors: {},
};

type LoginFormProps = {
	lang: string;
};

export default function LoginForm({ lang }: LoginFormProps) {
	const [state, formAction, isPending] = useActionState(loginAction.bind(null, lang), initialState);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);

	// Obsługa logowania Google
	const handleGoogleLogin = async () => {
		setIsGoogleLoading(true);
		const supabase = tryGetSupabaseBrowser();
		if (!supabase) {
			console.error("Supabase client not initialized");
			// Tutaj można by też ustawić stan błędu w formularzu
			setIsGoogleLoading(false);
			return;
		}
		await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${window.location.origin}/${lang}/auth/callback`,
			},
		});
		// Nie ustawiamy false, bo nastąpi przekierowanie
	};

	return (
		<div className="w-full flex flex-col items-center gap-6">
			<div className="text-center space-y-2">
				<h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
				<p className="text-sm text-muted-foreground">Sign in to manage your smart wardrobe</p>
			</div>

			<Card className="w-full max-w-md p-6 border-border/60 shadow-xl shadow-primary/5 bg-card">
				{/* Logowanie Email/Hasło */}
				<form
					action={formAction}
					className="space-y-4"
				>
					{state.errors?.form && (
						<div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">{state.errors.form.join(", ")}</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="name@example.com"
							required
							className={state.errors?.email ? "border-red-500" : ""}
						/>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="password">Password</Label>
							<Link
								href={`/${lang}/forgot-password`}
								className="text-xs text-primary hover:underline"
							>
								Forgot password?
							</Link>
						</div>
						<Input
							id="password"
							name="password"
							type="password"
							required
							className={state.errors?.password ? "border-red-500" : ""}
						/>
					</div>

					<Button
						type="submit"
						className="w-full"
						disabled={isPending || isGoogleLoading}
					>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Signing in...
							</>
						) : (
							"Log in"
						)}
					</Button>
				</form>

				<div className="relative my-6">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-card px-2 text-muted-foreground">Or continue with</span>
					</div>
				</div>

				{/* Przycisk Google */}
				<Button
					variant="outline"
					type="button"
					className="w-full"
					onClick={handleGoogleLogin}
					disabled={isPending || isGoogleLoading}
				>
					{isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
					Continue with Google
				</Button>

				<div className="mt-4 text-center text-sm">
					<span className="text-muted-foreground">New to Stylo? </span>
					<Link
						href={`/${lang}/register`}
						className="font-medium text-primary hover:underline"
					>
						Create account
					</Link>
				</div>
			</Card>
		</div>
	);
}
