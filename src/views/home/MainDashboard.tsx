import { Calendar, Camera, Check, MoreHorizontal, Plane, Search, Shirt, Sun, Trophy, User, X } from "lucide-react";
import Link from "next/link";

import WeatherWidget from "@/components/WeatherWidget";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";

interface MainDashboardProps {
	dict: Dictionary;
	lang: string;
	className?: string;
}

// Get current date formatted as "Sunday, November 2"
function getCurrentDate(): string {
	const date = new Date();
	const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" };
	return date.toLocaleDateString("en-US", options);
}

export function MainDashboard({ dict, lang, className }: MainDashboardProps) {
	const currentDate = getCurrentDate();

	return (
		<section className={cn("relative flex min-h-[100svh] w-full flex-col gap-6 bg-background px-5 pb-24 pt-6", className)}>
			{/* Top Header */}
			<header className="flex items-start justify-between">
				<div>
					<h1 className="text-xl font-bold text-primary">WardrobeAI</h1>
					<p className="mt-1 text-sm text-muted-foreground">{currentDate}</p>
				</div>
				<div className="flex items-center gap-2">
					<DarkModeToggle />
					<Link
						href={`/${lang}/profile`}
						className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-muted"
						aria-label="Profile"
					>
						<User className="h-5 w-5 text-foreground" />
					</Link>
				</div>
			</header>

			{/* Greeting Section */}
			<div className="space-y-2">
				<h2 className="text-2xl font-bold text-foreground">Good morning, Emma!</h2>
				<p className="text-base text-muted-foreground">Ready to look your best today?</p>
			</div>

			{/* Weather Card */}
			<Card className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
				<div className="flex-1 space-y-1">
					<p className="text-sm text-muted-foreground">San Francisco, CA</p>
					<div className="flex items-baseline gap-2">
						<span className="text-3xl font-bold text-foreground">72°</span>
						<span className="text-lg text-foreground">Sunny</span>
					</div>
					<p className="text-sm text-muted-foreground">Perfect weather for a light jacket</p>
				</div>
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold">
					<Sun className="h-8 w-8 text-gold-foreground" />
				</div>
			</Card>

			{/* This Week's Overview */}
			<section className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-bold text-foreground">This Week's Overview</h3>
					<Link
						href={`/${lang}/capsule`}
						className="text-sm text-primary hover:underline"
					>
						View Planner
					</Link>
				</div>

				<div className="space-y-3">
					{/* Weekly Outfit Planner */}
					<Card className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-transparent">
							<Check className="h-5 w-5 text-gold" />
						</div>
						<div className="flex-1">
							<p className="font-semibold text-foreground">Weekly Outfit Planner</p>
							<p className="text-sm text-muted-foreground">Plan outfits for the week ahead</p>
						</div>
					</Card>

					{/* Travel This Week */}
					<Card className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-transparent">
							<Check className="h-5 w-5 text-gold" />
						</div>
						<div className="flex-1">
							<div className="flex items-center gap-2">
								<p className="font-semibold text-foreground">Travel This Week</p>
								<Plane className="h-4 w-4 text-gold" />
							</div>
							<p className="text-sm text-muted-foreground">Business trip to New York</p>
						</div>
					</Card>

					{/* Travel Outfit List */}
					<Card className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-transparent">
							<Check className="h-5 w-5 text-gold" />
						</div>
						<div className="flex-1">
							<p className="font-semibold text-foreground">Travel Outfit List</p>
							<p className="text-sm text-muted-foreground">5 outfits packed and ready</p>
						</div>
					</Card>

					{/* Style Challenge */}
					<Card className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-destructive bg-transparent">
							<X className="h-5 w-5 text-destructive" />
						</div>
						<div className="flex-1">
							<p className="font-semibold text-foreground">Style Challenge</p>
							<p className="text-sm text-muted-foreground">12 days since last challenge</p>
							<p className="mt-1 text-sm text-destructive">Complete a new challenge to stay on track!</p>
						</div>
					</Card>
				</div>
			</section>

			{/* Quick Actions */}
			<section className="space-y-4">
				<h3 className="text-lg font-bold text-foreground">Quick Actions</h3>
				<div className="grid grid-cols-2 gap-4">
					<Button
						variant="secondary"
						className="h-24 flex-col gap-2 rounded-xl bg-card"
						asChild
					>
						<Link href={`/${lang}/capsule`}>
							<Trophy className="h-8 w-8 text-primary" />
							<span className="text-base font-medium text-foreground">New Challenge</span>
						</Link>
					</Button>
					<Button
						variant="secondary"
						className="h-24 flex-col gap-2 rounded-xl bg-card"
						asChild
					>
						<Link href={`/${lang}`}>
							<Calendar className="h-8 w-8 text-gold" />
							<span className="text-base font-medium text-foreground">My Statistics</span>
						</Link>
					</Button>
				</div>
			</section>

			{/* Bottom Navigation */}
			<footer className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background">
				<nav className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-6">
					<Link
						href={`/${lang}/wardrobe`}
						className="flex flex-col items-center gap-1 text-muted-foreground"
					>
						<Shirt className="h-5 w-5" />
						<span className="text-xs">Wardrobe</span>
					</Link>
					<Link
						href={`/${lang}/wardrobe/scan`}
						className="flex flex-col items-center gap-1 text-muted-foreground"
					>
						<Camera className="h-5 w-5" />
						<span className="text-xs">Scanner</span>
					</Link>
					<Link
						href={`/${lang}`}
						className="flex flex-col items-center gap-1"
					>
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold">
							<Sun className="h-5 w-5 text-gold-foreground" />
						</div>
						<span className="text-xs text-foreground">Today</span>
					</Link>
					<Link
						href={`/${lang}/shopping`}
						className="flex flex-col items-center gap-1 text-muted-foreground"
					>
						<Search className="h-5 w-5" />
						<span className="text-xs">Shopping</span>
					</Link>
					<Link
						href={`/${lang}/features`}
						className="flex flex-col items-center gap-1 text-muted-foreground"
					>
						<MoreHorizontal className="h-5 w-5" />
						<span className="text-xs">Menu</span>
					</Link>
				</nav>
			</footer>
		</section>
	);
}

export default MainDashboard;
