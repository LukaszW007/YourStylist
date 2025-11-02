"use client";

import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
// Auth functions are dynamically imported after checking Supabase config to avoid env errors
// import { signInWithEmail, signInWithGoogle, signUpWithEmail } from "@/lib/supabase/auth";

type SignInPageClientProps = {
	lang: string;
};

export default function SignInPageClient({ lang }: SignInPageClientProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSignIn = async () => {
		setIsLoading(true);
		setError(null);

		// For demo: Open a modal for email/password input
		// In production, you'd have a form here
		const email = prompt("Enter your email:");
		const password = prompt("Enter your password:");

		if (!email || !password) {
			setIsLoading(false);
			return;
		}

		// Dynamically import auth only if Supabase is configured
		try {
			const { isSupabaseConfigured } = await import("@/lib/supabase/config-check");
			if (!isSupabaseConfigured()) {
				setError("Authentication service not configured.");
				setIsLoading(false);
				return;
			}
			const { signInWithEmail, signUpWithEmail } = await import("@/lib/supabase/auth");
			// Try to sign in first
			const { user, session, error: signInError } = await signInWithEmail({ email, password });

			if (signInError) {
				// If sign in fails with "Invalid login credentials", try to sign up (create account)
				if (signInError.message.includes("Invalid login credentials")) {
					const {
						user: newUser,
						session: newSession,
						error: signUpError,
					} = await signUpWithEmail({
						email,
						password,
					});

					if (signUpError || !newUser) {
						setError(signUpError?.message || "Failed to create account. Please try again.");
						setIsLoading(false);
						return;
					}

					// New user created successfully
					if (newSession) {
						router.push(`/${lang}`);
					} else {
						// Email confirmation might be required
						setError("Please check your email to confirm your account.");
						setIsLoading(false);
					}
				} else {
					setError(signInError.message);
					setIsLoading(false);
				}
			} else if (user && session) {
				// Sign in successful
				router.push(`/${lang}`);
			}

			setIsLoading(false);
		} catch (err) {
			console.debug("Sign in skipped (Supabase not configured or error):", err);
			setError("Authentication currently unavailable.");
			setIsLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const { isSupabaseConfigured } = await import("@/lib/supabase/config-check");
			if (!isSupabaseConfigured()) {
				setError("Authentication service not configured.");
				setIsLoading(false);
				return;
			}
			const { signInWithGoogle } = await import("@/lib/supabase/auth");
			const { error: oauthError } = await signInWithGoogle(`${window.location.origin}/${lang}/auth/callback`);

			if (oauthError) {
				setError(oauthError.message);
				setIsLoading(false);
			}
		} catch (err) {
			console.debug("Google sign-in skipped (Supabase not configured or error):", err);
			setError("Authentication currently unavailable.");
			setIsLoading(false);
		}
		// Google OAuth redirects away, so we don't need to handle success here
	};

	return (
		<main className="min-h-screen bg-background pb-24">
			{/* Header */}
			<header className="flex items-center justify-between border-b border-border bg-background px-5 py-4">
				<Link
					href={`/${lang}`}
					className="text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="h-5 w-5" />
				</Link>
				<h1 className="text-lg font-semibold text-foreground">Profile</h1>
				<div
					className="w-5"
					aria-hidden="true"
				/>
			</header>

			<div className="flex flex-col items-center px-5 py-12">
				{/* Profile Icon */}
				<div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#8b6f47]">
					<User className="h-12 w-12 text-white" />
				</div>

				{/* Welcome Message */}
				<h2 className="mb-2 text-2xl font-bold text-foreground">Welcome to WardrobeAI</h2>
				<p className="mb-8 text-center text-sm text-muted-foreground">
					Sign in to sync your wardrobe across devices and unlock premium features.
				</p>

				{/* Error Message */}
				{error && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

				{/* Sign In Button */}
				<Button
					onClick={handleSignIn}
					disabled={isLoading}
					className="mb-6 h-12 w-full rounded-xl bg-primary text-primary-foreground"
					size="lg"
				>
					{isLoading ? "Processing..." : "Sign In / Create Account"}
				</Button>

				{/* Separator */}
				<div className="mb-6 flex w-full items-center gap-3">
					<div className="flex-1 border-t border-border" />
					<span className="text-xs text-muted-foreground">OR CONTINUE WITH</span>
					<div className="flex-1 border-t border-border" />
				</div>

				{/* Google Sign In Button */}
				<Button
					onClick={handleGoogleSignIn}
					disabled={isLoading}
					variant="outline"
					className="h-12 w-full rounded-xl border border-border bg-card"
					size="lg"
				>
					<div className="flex items-center gap-3">
						<div className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
							<svg
								className="h-5 w-5"
								viewBox="0 0 24 24"
							>
								<path
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									fill="#4285F4"
								/>
								<path
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									fill="#34A853"
								/>
								<path
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									fill="#FBBC05"
								/>
								<path
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									fill="#EA4335"
								/>
							</svg>
						</div>
						<span className="font-medium text-foreground">Continue with Google</span>
					</div>
				</Button>
			</div>
		</main>
	);
}
