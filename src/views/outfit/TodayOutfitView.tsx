"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, LayoutGrid, ArrowLeft, Home } from "lucide-react";
import type { GarmentBase } from "@/types/garment";
import { generateLook } from "@/actions/generate-look";

// Component Imports
import WeatherWidget from "@/components/WeatherWidget";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Skeleton } from "@/components/ui/Skeleton";
import { BottomNavigationBar } from "@/components/navigation/BottomNavigationBar";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";
import Image from "next/image";

// ========== TYPE DEFINITIONS ==========

interface Outfit {
	id: string | number;
	name: string;
	reasoning: string;
	garments: GarmentBase[];
}

interface TodayOutfitViewProps {
	initialOutfit: Outfit;
	lang: string;
	dict: Dictionary;
}

// ========== MAIN COMPONENT ==========

export function TodayOutfitView({ initialOutfit, lang, dict }: TodayOutfitViewProps) {
	const router = useRouter();
	const [viewMode, setViewMode] = useState<"model" | "flatlay">("model");
	const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
	const [isGenerating, setIsGenerating] = useState<boolean>(false);

	const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
		return initialOutfit.garments.reduce((acc, garment) => {
			acc[garment.id] = false;
			return acc;
		}, {} as Record<string, boolean>);
	});

	// ========== DATA & LOGIC ==========

	// Generate AI Model Image on mount
	useEffect(() => {
		const generateOutfitImage = async () => {
			if (!initialOutfit || initialOutfit.garments.length === 0) return;

			setIsGenerating(true);

			const description = `A photorealistic image of a male model wearing ${initialOutfit.garments
				.map((g) => g.name)
				.join(", ")}. Clean background, 8k, high fashion.`;

			const result = await generateLook(description);

			if (result.imageUrl) {
				setAiImageUrl(result.imageUrl);
			} else {
				// Handle error case, maybe show a fallback
				console.error("Failed to generate look:", result.error);
			}
			setIsGenerating(false);
		};

		generateOutfitImage();
	}, [initialOutfit]);

	const checkedCount = useMemo(() => Object.values(checkedItems).filter(Boolean).length, [checkedItems]);

	const handleCheckedChange = (garmentId: string, isChecked: boolean) => {
		setCheckedItems((prev) => ({ ...prev, [garmentId]: isChecked }));
	};

	const todayDict = dict.todayOutfitPage || {
		todayOutfit: "Today's Outfit",
		modelView: "Model View",
		flatLayView: "Flat Lay",
		listOfGarments: "List of Garments",
		of: "of",
		generatingModel: "Generating...",
	};

	// ========== RENDER ==========

	return (
		<div className="min-h-screen bg-background pb-24">
			{/* Header */}
			<header className="flex items-center justify-between px-4 pt-6 pb-4 border-b bg-background/95 backdrop-blur sticky top-0 z-20">
				<Button
					variant="ghost"
					size="icon"
					className="h-9 w-9"
					onClick={() => router.back()}
				>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<h1 className="text-lg font-semibold">{todayDict.todayOutfit}</h1>
				<Link href={`/${lang}/home`}>
					<Button
						variant="ghost"
						size="icon"
						className="h-9 w-9"
					>
						<Home className="h-5 w-5" />
					</Button>
				</Link>
			</header>

			<main className="max-w-md mx-auto p-4 sm:p-6 space-y-6">
				{/* Weather Widget */}
				<WeatherWidget
					lang={lang}
					variant="card"
				/>

				{/* View Mode Toggle */}
				<div className="flex gap-2 bg-secondary p-1 rounded-lg">
					<button
						onClick={() => setViewMode("model")}
						className={cn(
							"flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md transition-all text-sm font-semibold",
							viewMode === "model" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
						)}
					>
						<Eye className="w-4 h-4" />
						<span>{todayDict.modelView}</span>
					</button>
					<button
						onClick={() => setViewMode("flatlay")}
						className={cn(
							"flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md transition-all text-sm font-semibold",
							viewMode === "flatlay" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
						)}
					>
						<LayoutGrid className="w-4 h-4" />
						<span>{todayDict.flatLayView}</span>
					</button>
				</div>

				{/* Main Content: Model or Flat Lay */}
				<div>
					{viewMode === "model" ? (
						<Card className="overflow-hidden bg-card shadow-lg border-border aspect-[3/4] relative">
							{isGenerating && (
								<div className="w-full h-full flex flex-col items-center justify-center bg-muted">
									<Skeleton className="h-24 w-24 rounded-lg" />
									<p className="mt-4 text-sm font-semibold text-muted-foreground">{todayDict.generatingModel || "Generating..."}</p>
								</div>
							)}
							{!isGenerating && aiImageUrl && (
								<Image
									src={aiImageUrl}
									alt={initialOutfit.name}
									fill
									className="w-full h-full object-cover"
									unoptimized // Required for base64 data URLs
								/>
							)}
						</Card>
					) : (
						<Card className="p-4 bg-card shadow-lg border-border">
							<div className="grid grid-cols-2 gap-4">
								{initialOutfit.garments.map((garment) => (
									<div
										key={garment.id}
										className="aspect-square relative rounded-lg overflow-hidden border"
									>
										<Image
											src={garment.image_url || "/placeholder.svg"}
											alt={garment.name}
											fill
											className="w-full h-full object-cover"
										/>
									</div>
								))}
							</div>
						</Card>
					)}
				</div>

				{/* Garment Checklist */}
				<div className="pt-4">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-semibold">{todayDict.listOfGarments}</h2>
						<span className="text-sm text-muted-foreground">
							{checkedCount} {todayDict.of} {initialOutfit.garments.length}
						</span>
					</div>

					<div className="space-y-3">
						{initialOutfit.garments.map((garment) => (
							<Card
								key={garment.id}
								className="p-3 cursor-pointer hover:shadow-md transition-shadow"
								onClick={() => handleCheckedChange(garment.id, !checkedItems[garment.id])}
							>
								<div className="flex items-center gap-4">
									<Checkbox
										checked={checkedItems[garment.id] || false}
										onCheckedChange={(isChecked) => handleCheckedChange(garment.id, isChecked)}
										id={`garment-${garment.id}`}
										aria-label={`Mark ${garment.name} as worn`}
									/>
									<div className="flex-1">
										<label
											htmlFor={`garment-${garment.id}`}
											className={cn(
												"font-medium cursor-pointer",
												checkedItems[garment.id] && "line-through text-muted-foreground"
											)}
										>
											{garment.name}
										</label>
										<p className="text-xs text-muted-foreground mt-0.5">{garment.brand || garment.category}</p>
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>
			</main>

			{/* Bottom Navbar */}
			<BottomNavigationBar
				dict={dict}
				lang={lang}
			/>
		</div>
	);
}
