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
	id?: string | number;
	name: string;
	description: string;
	garments: GarmentBase[];
}

interface TodayOutfitViewProps {
	initialOutfits: Outfit[];
	lang: string;
	dict: Dictionary;
}

//komponent FlatLayGrid wewnątrz tego pliku lub obok
const FlatLayGrid = ({ garments }: { garments: GarmentBase[] }) => {
	// Ensure we only render items that have a valid image URL
	const validGarments = garments.filter((g) => g.image_url && g.image_url.trim() !== "");

	// Filtrujemy kategorie, żeby ułożyć je ładnie
	const tops = validGarments.filter((g) => g.category === "Top" || g.category === "Outerwear");
	const bottoms = validGarments.filter((g) => g.category === "Bottom");
	const shoes = validGarments.filter((g) => g.category === "Shoes");
	const others = validGarments.filter((g) => !tops.includes(g) && !bottoms.includes(g) && !shoes.includes(g));

	return (
		<div className="w-full aspect-[3/4] bg-gray-100 rounded-lg p-4 grid grid-cols-2 gap-4 content-center relative overflow-hidden">
			{/* Tło "podłogi" */}
			<div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares_gray.png')]"></div>

			{/* Lewa kolumna: Góry */}
			<div className="flex flex-col gap-2 justify-center items-center">
				{tops.map((item) => (
					<Image
						key={item.id}
						src={item.image_url!}
						alt={item.name}
						width={128}
						height={128}
						className="w-32 h-auto drop-shadow-xl transform -rotate-2 hover:scale-105 transition-transform"
					/>
				))}
			</div>

			{/* Prawa kolumna: Doły + Buty */}
			<div className="flex flex-col gap-4 justify-center items-center">
				{bottoms.map((item) => (
					<Image
						key={item.id}
						src={item.image_url!}
						alt={item.name}
						width={112}
						height={112}
						className="w-28 h-auto drop-shadow-xl"
					/>
				))}
				<div className="flex gap-2">
					{shoes.map((item) => (
						<Image
							key={item.id}
							src={item.image_url!}
							alt={item.name}
							width={80}
							height={80}
							className="w-20 h-auto drop-shadow-md transform rotate-12"
						/>
					))}
				</div>
			</div>

			{/* Akcesoria gdzieś pomiędzy */}
			{others.length > 0 && (
				<div className="absolute bottom-4 left-4">
					{others.map((item) => (
						<Image
							key={item.id}
							src={item.image_url!}
							alt={item.name}
							width={64}
							height={64}
							className="w-16 h-auto drop-shadow-md"
						/>
					))}
				</div>
			)}
		</div>
	);
};

// ========== MAIN COMPONENT ==========

export function TodayOutfitView({ initialOutfits, lang, dict }: TodayOutfitViewProps) {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState(0);
	const [viewMode, setViewMode] = useState<"model" | "flatlay">("model");

	// Store generated images by outfit index to prevent re-generation
	const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
	const [isGenerating, setIsGenerating] = useState<boolean>(false);

	const currentOutfit = initialOutfits && initialOutfits.length > 0 ? initialOutfits[activeTab] : null;

	const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
		// Initialize checked state for all garments in all outfits
		const initialChecks: Record<string, boolean> = {};
		(initialOutfits || []).forEach((outfit) => {
			outfit.garments.forEach((g) => {
				initialChecks[g.id] = false;
			});
		});
		return initialChecks;
	});

	// ========== DATA & LOGIC ==========

	// Generate AI Model Image when active tab changes, if not already generated
	useEffect(() => {
		const generateOutfitImage = async () => {
			if (!currentOutfit || currentOutfit.garments.length === 0) return;

			// If we already have an image for this outfit index, don't regenerate
			if (generatedImages[activeTab]) return;

			setIsGenerating(true);

			const description = `A photorealistic image of a male model wearing ${currentOutfit.garments
				.map((g) => g.name)
				.join(", ")}. Clean background, 8k, high fashion.`;

			const result = await generateLook(description);

			if (result.imageUrl) {
				setGeneratedImages((prev) => ({ ...prev, [activeTab]: result.imageUrl! }));
			} else {
				// Handle error case, maybe show a fallback
				console.error("Failed to generate look:", result.error);
			}
			setIsGenerating(false);
		};

		generateOutfitImage();
	}, [activeTab, currentOutfit, generatedImages]);

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

	if (!currentOutfit) {
		return <div className="p-8 text-center">No outfits found for today. Try scanning more clothes!</div>;
	}

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

				{/* Outfit Tabs */}
				<div className="flex gap-2 overflow-x-auto pb-2">
					{initialOutfits &&
						initialOutfits.map((outfit, index) => (
							<Button
								key={index}
								variant={activeTab === index ? "default" : "outline"}
								size="sm"
								onClick={() => setActiveTab(index)}
								className="whitespace-nowrap"
							>
								{outfit.name}
							</Button>
						))}
				</div>

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
					{viewMode === "flatlay" ? (
						<Card className="overflow-hidden bg-card shadow-lg border-border aspect-[3/4] relative">
							<FlatLayGrid garments={currentOutfit.garments} />
						</Card>
					) : (
						<Card className="overflow-hidden bg-card shadow-lg border-border aspect-[3/4] relative">
							{isGenerating && (
								<div className="w-full h-full flex flex-col items-center justify-center bg-muted">
									<Skeleton className="h-24 w-24 rounded-lg" />
									<p className="mt-4 text-sm font-semibold text-muted-foreground">{todayDict.generatingModel || "Generating..."}</p>
								</div>
							)}
							{!isGenerating && generatedImages[activeTab] && (
								<Image
									src={generatedImages[activeTab]}
									alt={currentOutfit.name}
									fill
									className="w-full h-full object-cover"
									unoptimized // Required for base64 data URLs
								/>
							)}
							{/* Fallback dla Model View, gdy nie ma jeszcze wygenerowanego obrazka */}
							{!isGenerating && !generatedImages[activeTab] && (
								<div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
									<p>Image not generated</p>
								</div>
							)}
						</Card>
					)}
				</div>

				{/* Garment Checklist */}
				<div className="pt-4">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-semibold">{currentOutfit.name}</h2>
						<span className="text-sm text-muted-foreground">{currentOutfit.description}</span>
					</div>

					<div className="space-y-3">
						{currentOutfit.garments.map((garment) => (
							<Card
								key={garment.id}
								className="p-3 cursor-pointer hover:shadow-md transition-shadow"
								onClick={() => handleCheckedChange(garment.id, !checkedItems[garment.id])}
							>
								<div className="flex items-center gap-4">
									<Checkbox
										checked={checkedItems[garment.id] || false}
										onCheckedChange={(isChecked) => handleCheckedChange(garment.id, Boolean(isChecked))}
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
