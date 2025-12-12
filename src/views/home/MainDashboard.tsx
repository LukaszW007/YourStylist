"use client";
import { Calendar, Camera, CheckCircle, XCircle, MoreHorizontal, Plane, Search, Shirt, Sun, Trophy, User, Loader, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeatherStore } from "@/store/useWeatherStore";
import { WeatherIcon } from "@/components/ui/WeatherIcon";
import { BottomNavigationBar } from "@/components/navigation/BottomNavigationBar";

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

// Weekly tasks data structure (titles/descriptions are fetched from dict)
const getWeeklyTasks = (dict: Dictionary) => [
	{
		id: 1,
		title: dict.home.weeklyTasks.weeklyOutfitPlanner,
		description: dict.home.weeklyTasks.planOutfits,
		completed: true,
	},
	{
		id: 2,
		title: dict.home.weeklyTasks.travelThisWeek,
		description: dict.home.weeklyTasks.businessTrip,
		completed: true,
		hasTravel: true,
	},
	{
		id: 3,
		title: dict.home.weeklyTasks.travelOutfitList,
		description: dict.home.weeklyTasks.outfitsPacked,
		completed: true,
	},
	{
		id: 4,
		title: dict.home.weeklyTasks.styleChallenge,
		description: dict.home.weeklyTasks.daysSinceChallenge,
		completed: false,
		daysSince: 12,
	},
];

export function MainDashboard({ dict, lang, className }: MainDashboardProps) {
	// Hooks for weather and auth data
	useGeolocation();
	const { location, currentWeather, isLoading, error } = useWeatherStore();
	const { user, loading: authLoading, configured } = useAuth();

	const currentDate = getCurrentDate();

	const displayName = useMemo(() => {
		if (authLoading) return "Loading";
		return user?.user_metadata?.display_name || user?.email?.split("@")[0] || (configured ? "User" : "Guest");
	}, [user, authLoading, configured]);

	// Determine greeting based on time of day
	const greeting = useMemo(() => {
		const hour = new Date().getHours();
		if (hour < 12) return dict.home.goodMorning;
		if (hour < 18) return dict.home.goodAfternoon;
		return dict.home.goodEvening;
	}, [dict]);

	// Get translated weekly tasks
	const weeklyTasks = useMemo(() => getWeeklyTasks(dict), [dict]);

	const renderWeatherContent = () => {
		if (isLoading) {
			return (
				<div className="flex items-center justify-center gap-2 text-muted-foreground">
					<Loader className="h-5 w-5 animate-spin" />
					<span>Loading weather...</span>
				</div>
			);
		}
		if (error) {
			return (
				<div className="flex items-center gap-3 text-red-600 dark:text-red-500">
					<AlertCircle className="h-5 w-5 flex-shrink-0" />
					<span className="text-sm">{error}</span>
				</div>
			);
		}
		if (location && currentWeather) {
			return (
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm text-muted-foreground mb-1">{location.city}</p>
						<div className="flex items-baseline gap-2 mb-1">
							<span className="text-4xl font-brand">{currentWeather.temp}°C</span>
							<span className="text-lg text-muted-foreground">{currentWeather.symbolCode.replace(/_/g, " ")}</span>
						</div>
						{/* <p className="text-sm text-muted-foreground">{dict.home.perfectWeatherFor}</p> */}
					</div>
					<div className="bg-gradient-to-br from-gold to-gold-dark p-4 rounded-full">
						<WeatherIcon
							symbolCode={currentWeather.symbolCode}
							className="h-8 w-8 text-white"
						/>
					</div>
				</div>
			);
		}
		return null;
	};

	return (
		<div className={cn("min-h-screen bg-background pb-24", className)}>
			{/* Header */}
			<div className="bg-gradient-to-b from-primary/5 to-transparent">
				<div className="max-w-md mx-auto px-6 pt-8 pb-6">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h1 className="text-2xl font-brand text-primary mb-1">{dict.home.title}</h1>
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
						<h2 className="text-xl mb-1">
							{greeting}, {displayName}!
						</h2>
						<p className="text-muted-foreground">{dict.home.readyToLookBest}</p>
					</div>
				</div>
			</div>

			<div className="max-w-md mx-auto px-6 space-y-6">
				{/* Weather Card */}
				<Card className="p-6 bg-gradient-to-br from-gold/10 to-transparent border-gold/20">{renderWeatherContent()}</Card>

				{/* Weekly Tasks */}
				<div>
					<div className="flex items-center justify-between mb-4">
						<h3 className="font-semibold">{dict.home.thisWeekOverview}</h3>
						<Link
							href={`/${lang}/capsule`}
							className="text-sm text-primary hover:underline"
						>
							{dict.home.viewPlanner}
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
												<p className="text-xs text-primary mt-1">{dict.home.weeklyTasks.completeChallenge}</p>
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
					<h3 className="font-semibold mb-4">{dict.home.quickActions}</h3>
					<div className="grid grid-cols-2 gap-3">
						<Card className="p-4 cursor-pointer hover:shadow-lg transition-all">
							<Link
								href={`/${lang}/capsule`}
								className="flex flex-col items-center text-center gap-2"
							>
								<div className="bg-primary/10 p-3 rounded-lg">
									<Trophy className="h-5 w-5 text-primary" />
								</div>
								<p className="text-sm font-medium">{dict.home.newChallenge}</p>
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
								<p className="text-sm font-medium">{dict.home.myStatistics}</p>
							</Link>
						</Card>
					</div>
				</div>
			</div>

			{/* Bottom Navigation */}
			<BottomNavigationBar
				dict={dict}
				lang={lang}
			/>
		</div>
	);
}

export default MainDashboard;
