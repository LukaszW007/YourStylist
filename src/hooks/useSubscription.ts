"use client";
import { useEffect, useState } from "react";

export type Plan = "free" | "pro" | "elite";

export type Limits = {
	aiPhotoPerWindow: number | null;
	inStorePerWindow: number | null;
	wardrobeMax: number | null;
	outfitPlanner: "today" | "week" | "advanced";
	weatherAlerts: boolean;
	styleAcademy: "basic" | "all" | "exclusive";
	ads: boolean;
};

const PLAN_LIMITS: Record<Plan, Limits> = {
	free: {
		aiPhotoPerWindow: 3,
		inStorePerWindow: 1,
		wardrobeMax: 30,
		outfitPlanner: "today",
		weatherAlerts: false,
		styleAcademy: "basic",
		ads: true,
	},
	pro: {
		aiPhotoPerWindow: 15,
		inStorePerWindow: 10,
		wardrobeMax: 200,
		outfitPlanner: "week",
		weatherAlerts: true,
		styleAcademy: "all",
		ads: false,
	},
	elite: {
		aiPhotoPerWindow: null,
		inStorePerWindow: null,
		wardrobeMax: null,
		outfitPlanner: "advanced",
		weatherAlerts: true,
		styleAcademy: "exclusive",
		ads: false,
	},
};

export function useSubscription() {
	const [plan, setPlan] = useState<Plan>("free");

	useEffect(() => {
		// TODO: replace with Supabase session fetch
		setPlan("free");
	}, []);

	return { plan, limits: PLAN_LIMITS[plan] } as const;
}
