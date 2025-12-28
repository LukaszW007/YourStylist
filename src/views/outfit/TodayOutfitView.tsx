"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Home, User, Layers, CheckCircle2, RefreshCw } from "lucide-react";
import type { GarmentBase } from "@/types/garment";
import { generateLook } from "@/actions/generate-look";
import Image from "next/image";
import WeatherWidget from "@/components/WeatherWidget";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { BottomNavigationBar } from "@/components/navigation/BottomNavigationBar";
import { cn } from "@/lib/utils";

interface Outfit {
	id?: string;
	name: string;
	description: string;
	garments: GarmentBase[];
}

interface TodayOutfitViewProps {
	initialOutfits: Outfit[];
	lang: string;
	dict: any;
}

// --- FLAT LAY (Grid Style) ---
const FlatLayGrid = ({ garments }: { garments: GarmentBase[] }) => {
	const valid = garments.filter((g) => g.image_url);

	if (valid.length === 0) return <div className="h-full flex items-center justify-center text-muted-foreground text-xs">No garments available</div>;

	return (
		<div className="w-full h-full bg-[#f8f8f8] p-4 relative overflow-hidden">
			<div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />

			<div className="grid grid-cols-2 gap-4 h-full content-center">
				{/* Lewa: Wierzchnie + Góra */}
				<div className="flex flex-col gap-4 justify-center items-center">
					{valid
						.filter((g) => ["Outerwear", "Jacket", "Coat", "Blazer"].some((cat) => g.category?.includes(cat)))
						.map((g, i) => (
							<div
								key={g.id}
								className="relative z-10 w-32 h-32"
								style={{ transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)` }}
							>
								<Image
									src={g.image_url!}
									alt={g.name}
									fill
									className="object-contain drop-shadow-xl"
								/>
							</div>
						))}
					{valid
						.filter((g) => ["Top", "Shirt", "Tops", "Sweater"].some((cat) => g.category?.includes(cat)))
						.map((g) => (
							<div
								key={g.id}
								className="relative z-0 w-28 h-28 -mt-6"
							>
								<Image
									src={g.image_url!}
									alt={g.name}
									fill
									className="object-contain drop-shadow-lg"
								/>
							</div>
						))}
				</div>

				{/* Prawa: Dół + Buty */}
				<div className="flex flex-col gap-4 justify-center items-center">
					{valid
						.filter((g) => ["Bottom", "Bottoms", "Pants", "Jeans"].some((cat) => g.category?.includes(cat)))
						.map((g) => (
							<div
								key={g.id}
								className="relative w-24 h-40"
							>
								<Image
									src={g.image_url!}
									alt={g.name}
									fill
									className="object-contain drop-shadow-md"
								/>
							</div>
						))}
					<div className="flex gap-2">
						{valid
							.filter((g) => ["Shoes", "Footwear", "Sneakers"].some((cat) => g.category?.includes(cat)))
							.map((g) => (
								<div
									key={g.id}
									className="relative w-20 h-16 transform -rotate-12"
								>
									<Image
										src={g.image_url!}
										alt={g.name}
										fill
										className="object-contain drop-shadow-md"
									/>
								</div>
							))}
					</div>
				</div>
			</div>
		</div>
	);
};

export function TodayOutfitView({ initialOutfits, lang, dict }: TodayOutfitViewProps) {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState(0);
	const [viewMode, setViewMode] = useState<"model" | "flatlay">("model");
	const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
	const [isGenerating, setIsGenerating] = useState(false);
	const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

	const currentOutfit = initialOutfits?.[activeTab];

	// Funkcja generująca wywołana w useEffect lub ręcznie
	const handleGenerate = async () => {
		if (!currentOutfit || generatedImages[activeTab] || isGenerating) return;

		setIsGenerating(true);
		console.log("🚀 [VIEW] Triggering generation for outfit:", currentOutfit.name);

		try {
			const res = await generateLook(currentOutfit);

			if (res.imageUrl) {
				console.log("✅ [VIEW] Image received successfully.");
				setGeneratedImages((prev) => ({ ...prev, [activeTab]: res.imageUrl! }));
			} else {
				console.error("❌ [VIEW] No image URL returned:", res.error);
			}
		} catch (e) {
			console.error("❌ [VIEW] Generation failed:", e);
		} finally {
			setIsGenerating(false);
		}
	};

	useEffect(() => {
		if (viewMode === "model") {
			handleGenerate();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTab, viewMode]);

	if (!currentOutfit) return <div className="p-8 text-center">No outfits available.</div>;

	return (
		<div className="min-h-screen bg-background pb-24">
			{/* Header */}
			<header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex justify-between items-center">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.back()}
				>
					<ArrowLeft className="w-5 h-5" />
				</Button>
				<h1 className="text-base font-semibold">Today&apos;s Outfit</h1>
				<Link href={`/${lang}/home`}>
					<Button
						variant="ghost"
						size="icon"
					>
						<Home className="w-5 h-5" />
					</Button>
				</Link>
			</header>

			<main className="max-w-md mx-auto p-4 space-y-6">
				<WeatherWidget
					lang={lang}
					variant="minimal"
				/>

				{/* Taby */}
				<div className="flex justify-center gap-2">
					{initialOutfits.map((_, idx) => (
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

				{/* Wizualizer */}
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
								{isGenerating ? (
									<div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-neutral-50">
										<Skeleton className="w-full h-full absolute inset-0" />
										<div className="z-10 bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-sm flex flex-col items-center gap-2">
											<div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
											<span className="text-xs font-bold tracking-widest text-primary">CREATING LOOK...</span>
										</div>
									</div>
								) : generatedImages[activeTab] ? (
									// FIX: Ten warunek zapewnia, że src nigdy nie jest pusty
									<Image
										src={generatedImages[activeTab]}
										alt="AI Generated Outfit"
										fill
										className="object-cover animate-in fade-in duration-700"
										//unoptimized // Ważne dla base64 z Pollinations/HF
									/>
								) : (
									<div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-3">
										<p className="text-sm">Image unavailable</p>
										<Button
											size="sm"
											variant="outline"
											onClick={handleGenerate}
										>
											<RefreshCw className="w-4 h-4 mr-2" /> Try Again
										</Button>
									</div>
								)}
							</>
						) : (
							<FlatLayGrid garments={currentOutfit.garments} />
						)}
					</Card>
				</div>

				{/* Opis */}
				<div>
					<h2 className="text-xl font-serif mb-2 text-center">{currentOutfit.name}</h2>
					<p className="text-sm text-muted-foreground mb-6 text-center leading-relaxed px-2">{currentOutfit.description}</p>

					<div className="space-y-2">
						{currentOutfit.garments.map((g) => (
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
										"w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
										checkedItems[g.id] ? "bg-primary border-primary" : "border-muted"
									)}
								>
									{checkedItems[g.id] && <CheckCircle2 className="w-3 h-3 text-white" />}
								</div>

								<div className="flex-1">
									<div className={cn("text-sm font-medium", checkedItems[g.id] && "line-through decoration-muted-foreground")}>
										{g.main_color_name} {g.subcategory || g.name}
									</div>
									<div className="text-xs text-muted-foreground uppercase tracking-wider text-[10px]">
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
			</main>

			<BottomNavigationBar
				dict={dict}
				lang={lang}
			/>
		</div>
	);
}
