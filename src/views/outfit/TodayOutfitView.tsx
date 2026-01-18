"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Home, User, Layers, CheckCircle2, RefreshCw, Sparkles } from "lucide-react";
import type { GarmentBase } from "@/types/garment";
import { generateLook } from "@/actions/generate-look";
import { generateDailyOutfits } from "@/app/actions/generate-outfit";
import { useWeatherStore } from "@/store/useWeatherStore";
import Image from "next/image";
import WeatherWidget from "@/components/WeatherWidget";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { BottomNavigationBar } from "@/components/navigation/BottomNavigationBar";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";

export interface Outfit {
	id?: string;
	name: string;
	description: string;
	garments: GarmentBase[];
}

interface TodayOutfitViewProps {
	userId: string;
	initialOutfits?: Outfit[];
	lang: string;
	dict: any;
}

// --- HELPER: Deduplikacja (Fix na błędy "Duplicate keys") ---
const deduplicateGarments = (garments: GarmentBase[]): GarmentBase[] => {
	const seen = new Set<string>();
	return garments.filter((g) => {
		if (!g.id) return false;
		if (seen.has(g.id)) return false;
		seen.add(g.id);
		return true;
	});
};

// --- FLAT LAY (Strict Categories) ---
const FlatLayGrid = ({ garments }: { garments: GarmentBase[] }) => {
	// 1. Najpierw usuwamy duplikaty
	const uniqueGarments = useMemo(() => deduplicateGarments(garments), [garments]);

	// 2. Kategoryzacja z wykluczaniem (żeby but nie trafił do kurtek)
	const hasCategory = (g: GarmentBase, keywords: string[]) => {
		const cat = (g.category || "").toLowerCase();
		const sub = (g.subcategory || "").toLowerCase();
		return keywords.some((k) => cat.includes(k) || sub.includes(k));
	};

	// Definiujemy grupy rozłącznie
	const shoes = uniqueGarments.filter((g) => hasCategory(g, ["shoe", "footwear", "sneaker", "boot", "loafer"]));
	const bottoms = uniqueGarments.filter((g) => hasCategory(g, ["bottom", "pants", "jeans", "shorts", "trousers", "chinos"]));

	// Outerwear i Tops mogą się mylić, więc robimy to ostrożnie
	const outerwear = uniqueGarments.filter(
		(g) => !shoes.includes(g) && !bottoms.includes(g) && hasCategory(g, ["outerwear", "jacket", "coat", "blazer", "bomber", "parka"])
	);

	const tops = uniqueGarments.filter(
		(g) =>
			!shoes.includes(g) &&
			!bottoms.includes(g) &&
			!outerwear.includes(g) &&
			hasCategory(g, ["top", "shirt", "sweater", "t-shirt", "hoodie", "polo", "cardigan", "sweatshirt"])
	);

	// Akcesoria (wszystko co zostało i ma zdjęcie)
	const accessories = uniqueGarments.filter(
		(g) => g.image_url && !shoes.includes(g) && !bottoms.includes(g) && !outerwear.includes(g) && !tops.includes(g)
	);

	const hasItems = [...shoes, ...bottoms, ...outerwear, ...tops, ...accessories].length > 0;

	if (!hasItems)
		return <div className="h-full flex items-center justify-center text-muted-foreground text-xs">No garments available for flat lay</div>;

	return (
		<div className="w-full h-full bg-[#f8f8f8] p-4 relative overflow-hidden">
			<div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />

			<div className="grid grid-cols-2 gap-4 h-full content-center relative z-10">
				{/* Lewa: Wierzchnie + Góra */}
				<div className="flex flex-col gap-4 justify-center items-center">
					{outerwear.map((g, i) => (
						<div
							key={g.id}
							className="relative w-32 h-32"
							style={{ transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)` }}
						>
							<Image
								src={g.image_url!}
								alt={g.name}
								fill
								className="object-contain drop-shadow-xl"
								sizes="128px"
							/>
						</div>
					))}
					{tops.map((g) => (
						<div
							key={g.id}
							className="relative w-28 h-28 -mt-6"
						>
							<Image
								src={g.image_url!}
								alt={g.name}
								fill
								className="object-contain drop-shadow-lg"
								sizes="112px"
							/>
						</div>
					))}
					{/* Dodajemy akcesoria po lewej jeśli są */}
					{accessories.map((g) => (
						<div
							key={g.id}
							className="relative w-20 h-20 -mt-4 opacity-90"
						>
							<Image
								src={g.image_url!}
								alt={g.name}
								fill
								className="object-contain drop-shadow-md"
								sizes="80px"
							/>
						</div>
					))}
				</div>

				{/* Prawa: Dół + Buty */}
				<div className="flex flex-col gap-4 justify-center items-center">
					{bottoms.map((g) => (
						<div
							key={g.id}
							className="relative w-24 h-40"
						>
							<Image
								src={g.image_url!}
								alt={g.name}
								fill
								className="object-contain drop-shadow-md"
								sizes="96px"
							/>
						</div>
					))}
					<div className="flex gap-2">
						{shoes.map((g) => (
							<div
								key={g.id}
								className="relative w-20 h-16 transform -rotate-12"
							>
								<Image
									src={g.image_url!}
									alt={g.name}
									fill
									className="object-contain drop-shadow-md"
									sizes="80px"
								/>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export function TodayOutfitView({ userId, initialOutfits, lang, dict }: TodayOutfitViewProps) {
	const router = useRouter();
	const { currentWeather, isLoading: isWeatherLoading } = useWeatherStore();

	const [outfits, setOutfits] = useState<Outfit[]>(initialOutfits || []);
	const [isLoadingOutfits, setIsLoadingOutfits] = useState(!initialOutfits || initialOutfits.length === 0);
	const [activeTab, setActiveTab] = useState(0);
	const [viewMode, setViewMode] = useState<"model" | "flatlay">("model");
	const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
	const [isGeneratingImage, setIsGeneratingImage] = useState(false);
	const [imageLoadFailed, setImageLoadFailed] = useState<Record<number, boolean>>({});
	const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

	const hasFetched = useRef(false);

	// --- FETCH OUTFITS ---
	useEffect(() => {
		const fetchOutfits = async () => {
			if (hasFetched.current) return;
			if (!currentWeather) return;
			if (outfits.length > 0) return;

			console.log("🌦️ [VIEW] Weather detected:", currentWeather);
			setIsLoadingOutfits(true);
			hasFetched.current = true;

			try {
				const description = `${currentWeather.description || "Clear sky"}`;
				const temp = Math.round(currentWeather.temp);

				console.log(`🚀 [VIEW] Generating outfits for: ${description}, ${temp}°C`);
				const result = await generateDailyOutfits(userId, description, temp);
				
				// Handle new return structure: { outfits, cachedImages }
				const fetchedOutfits = result.outfits || [];
				const cachedImages = result.cachedImages || {};

				// CLEANUP: Czyścimy duplikaty zaraz po pobraniu z backendu
				const cleanOutfits = fetchedOutfits.map((o: Outfit) => ({
					...o,
					garments: deduplicateGarments(o.garments),
				}));

				setOutfits(cleanOutfits);
				
				// Initialize generatedImages from cache
				if (Object.keys(cachedImages).length > 0) {
					console.log("📦 [VIEW] Using cached images:", Object.keys(cachedImages));
					const imagesByIndex: Record<number, string> = {};
					cleanOutfits.forEach((outfit: Outfit, index: number) => {
						const cachedUrl = cachedImages[outfit.name];
						if (cachedUrl) {
							imagesByIndex[index] = cachedUrl;
						}
					});
					setGeneratedImages(imagesByIndex);
				}
			} catch (error) {
				console.error("❌ [VIEW] Failed to fetch outfits:", error);
			} finally {
				setIsLoadingOutfits(false);
			}
		};

		if (!isWeatherLoading && currentWeather) {
			fetchOutfits();
		}
	}, [currentWeather, isWeatherLoading, userId, outfits.length]);

	// Zabezpieczenie przed brakiem danych
	const currentOutfit = outfits?.[activeTab]
		? {
				...outfits[activeTab],
				garments: deduplicateGarments(outfits[activeTab].garments), // Double check przy renderze
		  }
		: null;

	// --- GENEROWANIE OBRAZKA AI ---
	const handleGenerateImage = async () => {
		if (!currentOutfit || generatedImages[activeTab] || isGeneratingImage) return;

		setIsGeneratingImage(true);
		console.log("🚀 [VIEW] Triggering AI Image generation for:", currentOutfit.name);

		// Budujemy precyzyjny string pogodowy dla AI
		const weatherContext = currentWeather
			? `Weather condition: ${currentWeather.description}, Temperature: ${Math.round(currentWeather.temp)}°C`
			: "Weather: Sunny, pleasant temperature";

		try {
			const res = await generateLook(currentOutfit, weatherContext);

			if (res.imageUrl) {
				console.log("✅ [VIEW] Image received successfully.");
				setGeneratedImages((prev) => ({ ...prev, [activeTab]: res.imageUrl! }));
			} else {
				console.error("❌ [VIEW] No image URL returned:", res.error);
			}
		} catch (e) {
			console.error("❌ [VIEW] Generation failed:", e);
		} finally {
			setIsGeneratingImage(false);
		}
	};

	useEffect(() => {
		if (viewMode === "model" && currentOutfit && !isLoadingOutfits) {
			handleGenerateImage();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTab, viewMode, currentOutfit?.id, isLoadingOutfits]); // Zmiana ID outfitu lub zakończenie ładowania triggeruje generowanie

	return (
		<div className="min-h-screen bg-background pb-24">
			<header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-3 grid grid-cols-3 items-center">
				<div className="justify-self-start">
					<Tooltip side="bottom" text="Back">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => router.back()}
							className="text-muted-foreground hover:text-foreground"
						>
							<ArrowLeft className="w-5 h-5" />
						</Button>
					</Tooltip>
				</div>
				<h1 className="text-base font-semibold text-center whitespace-nowrap">Today&apos;s Outfit</h1>
				<div className="justify-self-end">
					<Tooltip side="bottom" text="Home">
						<Link href={`/${lang}/home`}>
							<Button
								variant="ghost"
								size="icon"
								className="text-muted-foreground hover:text-foreground"
							>
								<Home className="w-5 h-5" />
							</Button>
						</Link>
					</Tooltip>
				</div>
			</header>

			<main className="max-w-md mx-auto p-4 space-y-6">
				<WeatherWidget
					lang={lang}
					variant="inline"
				/>

				{isLoadingOutfits ? (
					<div className="flex flex-col items-center justify-center py-20 gap-4">
						<Sparkles className="w-10 h-10 text-primary animate-pulse" />
						<p className="text-muted-foreground animate-pulse">Consulting AI Stylist based on local weather...</p>
					</div>
				) : !currentOutfit ? (
					<div className="p-8 text-center">No outfits found.</div>
				) : (
					<>
						<div className="flex justify-center gap-2">
							{outfits.map((_, idx) => (
								<button
									key={idx}
									onClick={() => setActiveTab(idx)}
									className={cn(
										"px-4 py-2 text-sm font-medium rounded-md transition-all border",
										activeTab === idx
											? "bg-primary text-primary-foreground border-primary"
											: "bg-card text-muted-foreground border-border hover:border-primary/50"
									)}
								>
									Outfit #{idx + 1}
								</button>
							))}
						</div>

						<div className="relative">
							<div className="absolute top-4 right-4 z-20 flex bg-black/70 rounded-lg p-1 backdrop-blur-sm">
								<button
									onClick={() => setViewMode("model")}
									className={cn(
										"p-2 rounded-md text-xs font-medium transition",
										viewMode === "model" ? "bg-white text-black" : "text-white/70"
									)}
								>
									<User className="w-4 h-4" />
								</button>
								<button
									onClick={() => setViewMode("flatlay")}
									className={cn(
										"p-2 rounded-md text-xs font-medium transition",
										viewMode === "flatlay" ? "bg-white text-black" : "text-white/70"
									)}
								>
									<Layers className="w-4 h-4" />
								</button>
							</div>

							<Card className="aspect-[3/4] w-full overflow-hidden rounded-xl border-0 shadow-lg relative bg-neutral-100">
								{viewMode === "model" ? (
									<>
										{isGeneratingImage ? (
											<div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-neutral-50">
												<Skeleton className="w-full h-full absolute inset-0" />
												<div className="z-10 bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-sm flex flex-col items-center gap-2">
													<div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
													<span className="text-xs font-bold tracking-widest text-primary">CREATING LOOK...</span>
												</div>
											</div>
										) : generatedImages[activeTab] && !imageLoadFailed[activeTab] ? (
											<Image
												src={`${generatedImages[activeTab]}?t=${Date.now()}`}
												alt="AI Generated Outfit"
												fill
												unoptimized
												className="object-cover animate-in fade-in duration-700"
												sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
												priority
												onError={() => {
													console.error("[UI] Image failed to load:", generatedImages[activeTab]);
													setImageLoadFailed((prev) => ({ ...prev, [activeTab]: true }));
												}}
											/>
										) : (
											<div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3">
												<p className="text-sm">{imageLoadFailed[activeTab] ? "Image failed to load" : "Image unavailable"}</p>
                                                <Tooltip text="Generate Outfit Image">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            console.log("[UI] Generate button clicked");
                                                            setImageLoadFailed((prev) => ({ ...prev, [activeTab]: false }));
                                                            handleGenerateImage();
                                                        }}
                                                        disabled={isGeneratingImage}
                                                    >
                                                        <RefreshCw className={cn("w-4 h-4 mr-2", isGeneratingImage && "animate-spin")} />
                                                        {isGeneratingImage ? "Generating..." : "Try Again"}
                                                    </Button>
                                                </Tooltip>
											</div>
										)}
									</>
								) : (
									<FlatLayGrid garments={currentOutfit.garments} />
								)}
							</Card>
						</div>

						<div>
							<h2 className="text-xl font-serif mb-2 text-center">{currentOutfit.name}</h2>
							<p className="text-sm text-muted-foreground mb-6 text-center leading-relaxed px-2">{currentOutfit.description}</p>

							<div className="space-y-2">
								{/* Używamy deduplicateGarments także tutaj, by lista była czysta */}
								{deduplicateGarments(currentOutfit.garments).map((g) => (
									<div
										key={g.id}
										onClick={() => setCheckedItems((p) => ({ ...p, [g.id]: !p[g.id] }))}
										className={cn(
											"flex items-center gap-3 p-3 bg-card rounded-lg border cursor-pointer hover:border-primary/50 transition-all active:scale-[0.99]",
											checkedItems[g.id] && "opacity-60 bg-muted"
										)}
									>
										<div
											className={cn(
												"w-5 h-5 rounded-full border-2 flex items-center justify-center",
												checkedItems[g.id] ? "bg-primary border-primary" : "border-muted"
											)}
										>
											{checkedItems[g.id] && <CheckCircle2 className="w-3 h-3 text-white" />}
										</div>
										<div className="flex-1">
											<div className={cn("text-sm font-medium", checkedItems[g.id] && "line-through")}>
												{g.main_color_name} {g.subcategory || g.name}
											</div>
											<div className="text-[10px] text-muted-foreground uppercase tracking-wider">
												{g.brand || "Basic"} • {g.category}
											</div>
										</div>
										{g.image_url && (
											<div className="w-10 h-10 bg-white rounded border relative overflow-hidden shrink-0">
												<Image
													src={g.image_url}
													alt=""
													fill
													className="object-cover"
												/>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					</>
				)}
			</main>

			<BottomNavigationBar
				dict={dict}
				lang={lang}
			/>
		</div>
	);
}
