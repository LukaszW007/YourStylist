"use client";
import { Calendar, Camera, CheckCircle, XCircle, MoreHorizontal, Plane, Search, Shirt, Sun, Trophy, User } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";

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

// Weekly tasks data
const weeklyTasks = [
	{
		id: 1,
		title: "Weekly Outfit Planner",
		description: "Plan outfits for the week ahead",
		completed: true,
	},
	{
		id: 2,
		title: "Travel This Week",
		description: "Business trip to New York",
		completed: true,
		hasTravel: true,
	},
	{
		id: 3,
		title: "Travel Outfit List",
		description: "5 outfits packed and ready",
		completed: true,
	},
	{
		id: 4,
		title: "Style Challenge",
		description: "12 days since last challenge",
		completed: false,
		daysSince: 12,
	},
];

const weather = {
	temp: 72,
	condition: "Sunny",
	location: "San Francisco, CA",
};

export function MainDashboard({ dict, lang, className }: MainDashboardProps) {
	const currentDate = getCurrentDate();
	const { user, loading, configured } = useAuth();
	const displayName = useMemo(() => {
		if (loading) return "Loading";
		return user?.user_metadata?.display_name || user?.email?.split("@")[0] || (configured ? "User" : "Guest");
	}, [user, loading, configured]);

	// Touch dict so lint knows it's intentionally used for future i18n
	void dict;

	return (
		<div className={cn("min-h-screen bg-background pb-24", className)}>
			{/* Header */}
			<div className="bg-gradient-to-b from-primary/5 to-transparent">
				<div className="max-w-md mx-auto px-6 pt-8 pb-6">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h1 className="text-2xl font-brand text-primary mb-1">WardrobeAI</h1>
							<p className="text-sm text-muted-foreground">{currentDate}</p>
						</div>
						<div className="flex items-center gap-2">
							<DarkModeToggle />
							<Button
								variant="ghost"
								size="icon"
								className="h-9 w-9"
								asChild
							>
								<Link href={`/${lang}/profile`}>
									<User className="h-5 w-5" />
								</Link>
							</Button>
						</div>
					</div>

					{/* Welcome Message */}
					<div className="mb-6">
						<h2 className="text-xl mb-1">Good morning, {displayName}!</h2>
						<p className="text-muted-foreground">Ready to look your best today?</p>
					</div>
				</div>
			</div>

			<div className="max-w-md mx-auto px-6 space-y-6">
				{/* Weather Card */}
				<Card className="p-6 bg-gradient-to-br from-gold/10 to-transparent border-gold/20">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-muted-foreground mb-1">{weather.location}</p>
							<div className="flex items-baseline gap-2 mb-1">
								<span className="text-4xl font-brand">{weather.temp}°</span>
								<span className="text-lg text-muted-foreground">{weather.condition}</span>
							</div>
							<p className="text-sm text-muted-foreground">Perfect weather for a light jacket</p>
						</div>
						<div className="bg-gradient-to-br from-gold to-gold-dark p-4 rounded-full">
							<Sun className="h-8 w-8 text-white" />
						</div>
					</div>
				</Card>

				{/* Weekly Tasks */}
				<div>
					<div className="flex items-center justify-between mb-4">
						<h3 className="font-semibold">This Week&apos;s Overview</h3>
						<Link
							href={`/${lang}/capsule`}
							className="text-sm text-primary hover:underline"
						>
							View Planner
						</Link>
					</div>

					<div className="space-y-3">
						{weeklyTasks.map((task) => {
							const isOverdue = !task.completed && task.daysSince && task.daysSince > 7;

							return (
								<Card
									key={task.id}
									className={cn(
										"p-4 transition-all",
										task.completed
											? "bg-card hover:shadow-md"
											: isOverdue
											? "border-primary/30 bg-primary/5"
											: "bg-card hover:shadow-md"
									)}
								>
									<div className="flex items-start gap-3">
										<div
											className={cn(
												"mt-0.5",
												task.completed ? "text-gold" : isOverdue ? "text-primary" : "text-muted-foreground"
											)}
										>
											{task.completed ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<h4 className="font-medium">{task.title}</h4>
												{task.hasTravel && <Plane className="h-4 w-4 text-gold" />}
											</div>
											<p className="text-sm text-muted-foreground">{task.description}</p>
											{task.daysSince && !task.completed && (
												<p className="text-xs text-primary mt-1">Complete a new challenge to stay on track!</p>
											)}
										</div>
									</div>
								</Card>
							);
						})}
					</div>
				</div>

				{/* Quick Actions */}
				<div>
					<h3 className="font-semibold mb-4">Quick Actions</h3>
					<div className="grid grid-cols-2 gap-3">
						<Card className="p-4 cursor-pointer hover:shadow-lg transition-all">
							<Link
								href={`/${lang}/capsule`}
								className="flex flex-col items-center text-center gap-2"
							>
								<div className="bg-primary/10 p-3 rounded-lg">
									<Trophy className="h-5 w-5 text-primary" />
								</div>
								<p className="text-sm font-medium">New Challenge</p>
							</Link>
						</Card>
						<Card className="p-4 cursor-pointer hover:shadow-lg transition-all">
							<Link
								href={`/${lang}`}
								className="flex flex-col items-center text-center gap-2"
							>
								<div className="bg-gold/10 p-3 rounded-lg">
									<Calendar className="h-5 w-5 text-gold" />
								</div>
								<p className="text-sm font-medium">My Statistics</p>
							</Link>
						</Card>
					</div>
				</div>
			</div>

			{/* Bottom Navigation */}
			<nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background">
				<div className="mx-auto flex h-16 w-full max-w-md items-center justify-around px-6">
					<Link
						href={`/${lang}/wardrobe`}
						className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
					>
						<Shirt className="h-5 w-5" />
						<span className="text-xs">Wardrobe</span>
					</Link>
					<Link
						href={`/${lang}/wardrobe/scan`}
						className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
					>
						<Camera className="h-5 w-5" />
						<span className="text-xs">Scanner</span>
					</Link>
					<Link
						href={`/${lang}`}
						className="flex flex-col items-center gap-1"
					>
						<div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dark shadow-lg -mt-6">
							<Sun className="h-6 w-6 text-white" />
						</div>
						<span className="text-xs text-foreground font-medium">Today</span>
					</Link>
					<Link
						href={`/${lang}/shopping`}
						className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
					>
						<Search className="h-5 w-5" />
						<span className="text-xs">Shopping</span>
					</Link>
					<Link
						href={`/${lang}/features`}
						className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
					>
						<MoreHorizontal className="h-5 w-5" />
						<span className="text-xs">More</span>
					</Link>
				</div>
			</nav>
		</div>
	);
}

export default MainDashboard;
