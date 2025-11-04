"use client";

import { ArrowLeft, FileText, LogOut, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LanguageSelect } from "@/components/ui/LanguageSelect";

type ProfilePageClientProps = {
	lang: string;
};

export default function ProfilePageClient({ lang }: ProfilePageClientProps) {
	const router = useRouter();
	const { user, loading, configured } = useAuth();
	const [email, setEmail] = useState<string>("");
	const [isEditingEmail, setIsEditingEmail] = useState(false);

	useEffect(() => {
		if (user?.email) {
			setEmail(user.email);
		} else if (!loading) {
			// Demo / not configured fallback
			setEmail("demo.user@example.com");
		}
	}, [user, loading]);

	const handleSignOut = async () => {
		try {
			// Only attempt Supabase sign out if it's configured
			const { isSupabaseConfigured } = await import("@/lib/supabase/config-check");
			if (isSupabaseConfigured()) {
				const { signOut } = await import("@/lib/supabase/auth");
				const { error } = await signOut();
				if (error) {
					console.error("Error signing out:", error);
				}
			}
		} catch (err) {
			// Silently ignore if Supabase not configured or any error occurs
			// This prevents crashing when env vars are missing
			console.debug("Sign out skipped (Supabase not configured or error):", err);
		}

		// Always navigate to sign-in page regardless of Supabase state
		router.push(`/${lang}/sign-in`);
	};

	const handleEditEmail = () => {
		setIsEditingEmail(!isEditingEmail);
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

			<div className="px-5 py-8">
				{/* Profile Icon and Language Selector */}
				<div className="mb-8 flex items-center justify-center gap-4">
					<div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#8b6f47]">
						<User className="h-12 w-12 text-white" />
					</div>
					<LanguageSelect currentLang={lang} />
				</div>

				{/* User Name */}
				<div className="mb-8 text-center">
					<h2 className="mb-1 text-2xl font-bold text-foreground">
						{loading ? "Loading..." : user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Demo User"}
					</h2>
					<p className="text-sm text-muted-foreground">{configured && user ? "Signed in" : "Demo mode (not synced)"}</p>
				</div>

				{/* Email Card */}
				<Card className="mb-4 w-full rounded-xl border border-border bg-card p-4">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<div className="mb-2 flex items-center gap-2">
								<Mail className="h-5 w-5 text-muted-foreground" />
								<span className="font-medium text-foreground">Email Address</span>
							</div>
							{isEditingEmail ? (
								<input
									type="email"
									defaultValue={email}
									onBlur={(e) => {
										setEmail(e.target.value);
										setIsEditingEmail(false);
									}}
									className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
									autoFocus
								/>
							) : (
								<p className="text-sm text-muted-foreground">{email || (loading ? "Loading..." : "demo.user@example.com")}</p>
							)}
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleEditEmail}
							className="text-sm text-foreground"
						>
							{isEditingEmail ? "Save" : "Edit"}
						</Button>
					</div>
				</Card>

				{/* Current Plan Card */}
				<Card className="mb-4 w-full rounded-xl border border-border bg-card p-4">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<div className="mb-3 flex items-center justify-between">
								<span className="font-medium text-foreground">Current Plan</span>
								<Button
									variant="ghost"
									size="sm"
									className="text-sm text-foreground"
								>
									Manage
								</Button>
							</div>
							<div className="mb-2 flex items-center gap-3">
								<span className="rounded-full bg-[#8b6f47] px-3 py-1 text-xs font-medium text-white">Premium</span>
								<span className="font-medium text-foreground">$9.99/month</span>
							</div>
							<p className="text-sm text-muted-foreground">
								Premium features include unlimited AI suggestions, advanced wardrobe analytics, and priority support.
							</p>
						</div>
					</div>
				</Card>

				{/* Terms of Use */}
				<Button
					variant="outline"
					className="mb-4 w-full justify-between rounded-xl border border-border bg-card p-4"
					asChild
				>
					<Link href={`/${lang}/terms`}>
						<div className="flex items-center gap-3">
							<FileText className="h-5 w-5 text-foreground" />
							<span className="font-medium text-foreground">Terms of Use</span>
						</div>
						<ArrowLeft className="h-5 w-5 rotate-180 text-foreground" />
					</Link>
				</Button>

				{/* Sign Out */}
				<Button
					variant="outline"
					className="w-full justify-between rounded-xl border border-destructive bg-card p-4 hover:bg-destructive/10"
					onClick={handleSignOut}
				>
					<div className="flex items-center gap-3">
						<LogOut className="h-5 w-5 text-destructive" />
						<span className="font-medium text-destructive">Sign Out</span>
					</div>
					<ArrowLeft className="h-5 w-5 rotate-180 text-destructive" />
				</Button>
			</div>
		</main>
	);
}
