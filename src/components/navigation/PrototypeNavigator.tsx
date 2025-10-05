"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export type PrototypeOption = {
	id: string;
	title: string;
	description: string;
	badge?: string;
	emoji?: string;
};

export interface PrototypeNavigatorProps {
	onSelect?: (id: string) => void;
	options?: PrototypeOption[];
}

const DEFAULT_OPTIONS: PrototypeOption[] = [
	{
		id: "scanner",
		title: "AI Closet Scanner",
		description: "Instantly add multiple items from a single photo.",
		emoji: "📸",
		badge: "New",
	},
	{
		id: "planner",
		title: "Weekly Outfit Planner",
		description: "Plan every look and stay ready for the weather.",
		emoji: "🗓️",
	},
	{
		id: "capsule",
		title: "Capsule Wardrobe",
		description: "Build a smart wardrobe that reflects your style.",
		emoji: "🎯",
	},
	{
		id: "shopping",
		title: "Shopping Assistant",
		description: "Find the perfect additions curated by Stylo.",
		emoji: "🛍️",
	},
];

export function PrototypeNavigator({ onSelect, options = DEFAULT_OPTIONS }: PrototypeNavigatorProps) {
	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-10 py-12">
			<div className="text-center sm:text-left">
				<Badge className="mx-auto sm:mx-0">Explore flows</Badge>
				<h2 className="mt-4 font-brand text-4xl text-foreground sm:text-5xl">Choose an experience to preview</h2>
				<p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
					Navigate through Stylo prototypes exactly as presented in the design system. Each card mirrors the Figma layout with warm brand
					tones and descriptive copy.
				</p>
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				{options.map((option) => (
					<Card
						key={option.id}
						className="group h-full border-border/60 bg-card/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
					>
						<CardHeader className="flex flex-row items-start justify-between gap-3">
							<span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">{option.emoji ?? "✨"}</span>
							{option.badge ? <Badge variant="muted">{option.badge}</Badge> : null}
						</CardHeader>
						<CardContent className="flex h-full flex-col gap-6">
							<div className="space-y-1">
								<CardTitle className="text-xl font-brand text-foreground">{option.title}</CardTitle>
								<p className="text-sm text-muted-foreground leading-relaxed">{option.description}</p>
							</div>
							<Button
								variant="outline"
								className="w-full justify-center group-hover:bg-primary/10"
								onClick={() => onSelect?.(option.id)}
							>
								Preview flow
							</Button>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

export function PrototypeNavigatorSkeleton() {
	return (
		<div className="mx-auto max-w-5xl py-12">
			<div className="grid gap-4 md:grid-cols-2">
				{Array.from({ length: 4 }).map((_, idx) => (
					<Card
						key={idx}
						className="h-48 animate-pulse border-border/40 bg-card/60"
					/>
				))}
			</div>
		</div>
	);
}
