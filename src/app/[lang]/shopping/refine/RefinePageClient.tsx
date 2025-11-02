"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";

type RefinePageClientProps = {
	lang: string;
	item: string;
};

const styleOptions = ["Minimalist", "Classic", "Vintage", "Modern", "Casual", "Formal"];
const featureOptions = ["Good Quality", "Polish Brand", "Made in Europe", "Sustainable", "Organic", "Eco-Friendly"];

export default function RefinePageClient({ lang, item }: RefinePageClientProps) {
	const router = useRouter();
	const [priceRange, setPriceRange] = useState({ min: 50, max: 420 });
	const [selectedStyle, setSelectedStyle] = useState<string>("Casual");
	const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["Good Quality"]);

	const handleFeatureToggle = (feature: string) => {
		setSelectedFeatures((prev) =>
			prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
		);
	};

	const handleShowRecommendations = () => {
		const params = new URLSearchParams({
			item,
			priceMin: priceRange.min.toString(),
			priceMax: priceRange.max.toString(),
			style: selectedStyle,
			features: selectedFeatures.join(","),
		});
		router.push(`/${lang}/shopping/recommendations?${params.toString()}`);
	};

	return (
		<main className="min-h-screen bg-background pb-24">
			{/* Header */}
			<header className="border-b border-border bg-background px-5 py-4">
				<Link
					href={`/${lang}/shopping`}
					className="mb-2 inline-block text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="h-5 w-5" />
				</Link>
				<h1 className="text-lg font-bold text-foreground">Refine your search</h1>
				{item && <p className="mt-1 text-sm text-muted-foreground">{item}</p>}
			</header>

			<div className="space-y-6 px-5 py-6">
				{/* Price Range */}
				<section>
					<h2 className="mb-4 text-base font-bold text-foreground">Price Range</h2>
					<div className="space-y-4">
						<input
							type="range"
							min="50"
							max="420"
							value={priceRange.max}
							onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
							className="w-full accent-primary"
						/>
						<div className="flex justify-between text-sm text-muted-foreground">
							<span>${priceRange.min}</span>
							<span>${priceRange.max}</span>
						</div>
					</div>
				</section>

				{/* Style */}
				<section>
					<h2 className="mb-4 text-base font-bold text-foreground">Style</h2>
					<div className="grid grid-cols-3 gap-2">
						{styleOptions.map((style) => (
							<Button
								key={style}
								variant={selectedStyle === style ? "default" : "outline"}
								size="sm"
								onClick={() => setSelectedStyle(style)}
								className={
									selectedStyle === style
										? "bg-primary text-primary-foreground"
										: "bg-card text-foreground"
								}
							>
								{style}
							</Button>
						))}
					</div>
				</section>

				{/* Features */}
				<section>
					<h2 className="mb-4 text-base font-bold text-foreground">Features</h2>
					<div className="grid grid-cols-3 gap-2">
						{featureOptions.map((feature) => {
							const isSelected = selectedFeatures.includes(feature);
							return (
								<Button
									key={feature}
									variant={isSelected ? "default" : "outline"}
									size="sm"
									onClick={() => handleFeatureToggle(feature)}
									className={
										isSelected
											? "bg-primary text-primary-foreground"
											: "bg-card text-foreground"
									}
								>
									{feature}
								</Button>
							);
						})}
					</div>
				</section>
			</div>

			{/* Show Recommendations Button */}
			<div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background p-5">
				<Button
					onClick={handleShowRecommendations}
					className="h-12 w-full rounded-xl bg-primary text-primary-foreground"
					size="lg"
				>
					Show Recommendations
				</Button>
			</div>
		</main>
	);
}

