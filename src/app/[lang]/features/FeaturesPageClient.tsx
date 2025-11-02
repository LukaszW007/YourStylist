"use client";

import {
	ArrowLeft,
	BarChart3,
	Bookmark,
	Calendar,
	Camera,
	CheckSquare,
	CloudLightning,
	GraduationCap,
	Heart,
	Home,
	Image as ImageIcon,
	Luggage,
	Monitor,
	Search,
	Shirt,
	Star,
	Handbag,
	Target,
	TrendingUp,
	Trophy,
	Umbrella,
} from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/Card";

type FeaturesPageClientProps = {
	lang: string;
};

type Feature = {
	id: string;
	title: string;
	description: string;
	icon: React.ElementType;
	href?: string;
};

const features: Feature[] = [
	{
		id: "ai-scanner",
		title: "AI Closet Scanner",
		description: "Instantly add multiple items of clothing from a single photo",
		icon: Camera,
		href: "/wardrobe/scan",
	},
	{
		id: "today-outfit",
		title: "Today's Outfit",
		description: "Get personalized outfit suggestions for your day",
		icon: TrendingUp,
		href: "/today-outfit",
	},
	{
		id: "capsule-wardrobe",
		title: "Capsule Wardrobe",
		description: "Build your ideal wardrobe with guided style development",
		icon: Target,
		href: "/capsule",
	},
	{
		id: "ai-shopping",
		title: "AI Shopping Assistant",
		description: "Find the perfect items with intelligent product curation",
		icon: Search,
		href: "/shopping",
	},
	{
		id: "special-occasion",
		title: "Special Occasion Outfits",
		description: "Perfect looks for weddings, interviews, and special events",
		icon: Heart,
	},
	{
		id: "weekly-planner",
		title: "Weekly Outfit Planner",
		description: "Plan your outfits in advance and never worry about what to wear",
		icon: Calendar,
	},
	{
		id: "pack-suitcase",
		title: "Pack My Suitcase",
		description: "Smart packing lists that maximize outfit combinations",
		icon: Handbag,
	},
	{
		id: "my-wardrobe",
		title: "My Wardrobe",
		description: "Browse, filter, and manage your clothing collection",
		icon: Shirt,
		href: "/wardrobe",
	},
	{
		id: "wardrobe-stats",
		title: "Wardrobe Statistics",
		description: "Discover your style patterns and optimize your wardrobe",
		icon: BarChart3,
	},
	{
		id: "style-challenge",
		title: "Style Challenge",
		description: "Weekly challenges to experiment with new looks",
		icon: Trophy,
	},
	{
		id: "style-inspiration",
		title: "Style Inspiration",
		description: "Curated lookbooks and personal moodboards",
		icon: Bookmark,
		href: "/inspiration",
	},
	{
		id: "virtual-fitting",
		title: "Virtual Fitting Room",
		description: "Preview how new items work with your existing wardrobe",
		icon: Monitor,
	},
	{
		id: "outfit-creator",
		title: "Outfit Creator from Photo",
		description: "Upload inspiration and get AI-matched outfits from your wardrobe",
		icon: ImageIcon,
	},
	{
		id: "complete-outfit",
		title: "Complete My Outfit",
		description: "Select 1-2 items and get complementary suggestions",
		icon: Star,
	},
	{
		id: "fitting-assistant",
		title: "Fitting Room Assistant",
		description: "Scan items in-store to see wardrobe compatibility",
		icon: Luggage,
	},
	{
		id: "weather-alert",
		title: "Smart Weather Alert",
		description: "Proactive outfit modifications based on weather changes",
		icon: Umbrella,
	},
	{
		id: "readiness-check",
		title: "Outfit Readiness Check",
		description: "Weekly checklist for planned outfits",
		icon: CheckSquare,
	},
	{
		id: "make-impression",
		title: "Look Today: Make an Impression",
		description: "Bold styling suggestions for special confidence days",
		icon: CloudLightning,
	},
	{
		id: "style-academy",
		title: "Style Academy",
		description: "Educational content about fashion principles and history",
		icon: GraduationCap,
	},
];

export default function FeaturesPageClient({ lang }: FeaturesPageClientProps) {
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
				<div className="flex flex-col items-center">
					<h1 className="text-xl font-bold text-primary">WARDROBEAI</h1>
					<p className="text-sm text-muted-foreground">All Features</p>
				</div>
				<Link
					href={`/${lang}`}
					className="text-muted-foreground hover:text-foreground"
				>
					<Home className="h-5 w-5" />
				</Link>
			</header>

			{/* Features List - 2 Column Grid */}
			<div className="grid grid-cols-2 gap-3 px-5 py-6">
				{features.map((feature) => {
					const Icon = feature.icon;
					const content = (
						<Card className="flex h-[220px] flex-col items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-center transition hover:bg-muted">
							{/* Icon Container - Fixed Size - Absolutely Consistent */}
							<div className="flex aspect-square h-14 w-14 min-h-[3.5rem] min-w-[3.5rem] max-h-[3.5rem] max-w-[3.5rem] shrink-0 items-center justify-center rounded-lg bg-primary">
								<Icon className="h-7 w-7 shrink-0 text-primary-foreground" />
							</div>
							{/* Text Container - Consistent Padding and Responsive */}
							<div className="flex min-h-0 flex-1 flex-col justify-top space-y-1 px-2">
								<h3 className="text-xs font-semibold leading-tight text-foreground sm:text-sm md:text-base">{feature.title}</h3>
								<p className="text-[10px] leading-snug text-muted-foreground sm:text-xs md:text-sm">{feature.description}</p>
							</div>
						</Card>
					);

					if (feature.href) {
						return (
							<Link
								key={feature.id}
								href={`/${lang}${feature.href}`}
								className="h-full"
							>
								{content}
							</Link>
						);
					}

					return (
						<div
							key={feature.id}
							className="h-full cursor-pointer"
						>
							{content}
						</div>
					);
				})}
			</div>
		</main>
	);
}
