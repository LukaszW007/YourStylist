"use client";

import { ArrowLeft, ExternalLink, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type RecommendationsPageClientProps = {
	lang: string;
	searchParams: {
		item?: string;
		priceMin?: string;
		priceMax?: string;
		style?: string;
		features?: string;
	};
};

// Mock recommendations data
const recommendations = [
	{
		id: "1",
		name: "Classic Navy Wool Blazer",
		brand: "Hugo Boss",
		price: "$280",
		rating: 4.8,
		image: "/api/placeholder/200/200",
		why: "Perfect fit for smart casual style. High-quality wool blend that matches your capsule wardrobe aesthetic.",
		url: "https://www.hugoboss.com",
	},
	{
		id: "2",
		name: "Tailored Navy Blazer",
		brand: "Zara",
		price: "$129",
		rating: 4.5,
		image: "/api/placeholder/200/200",
		why: "Great value for money. Modern cut that works well for both office and casual settings.",
		url: "https://www.zara.com",
	},
	{
		id: "3",
		name: "Premium Navy Blazer",
		brand: "Uniqlo",
		price: "$89",
		rating: 4.6,
		image: "/api/placeholder/200/200",
		why: "Excellent quality-to-price ratio. Versatile design that pairs well with your existing wardrobe.",
		url: "https://www.uniqlo.com",
	},
];

export default function RecommendationsPageClient({ lang, searchParams }: RecommendationsPageClientProps) {
	return (
		<main className="min-h-screen bg-background pb-24">
			{/* Header */}
			<header className="border-b border-border bg-background px-5 py-4">
				<Link
					href={`/${lang}/shopping/refine?item=${encodeURIComponent(searchParams.item || "")}`}
					className="mb-2 inline-block text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="h-5 w-5" />
				</Link>
				<h1 className="text-lg font-bold text-foreground">Recommendations</h1>
				<p className="mt-1 text-sm text-muted-foreground">{recommendations.length} results</p>
			</header>

			<div className="space-y-4 px-5 py-6">
				{recommendations.map((rec) => (
					<Card
						key={rec.id}
						className="rounded-xl border border-border bg-card p-4"
					>
						<div className="mb-4 flex gap-4">
							{/* Product Image */}
							<div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
								<Image
									src={rec.image}
									alt={rec.name}
									fill
									className="object-cover"
								/>
							</div>

							{/* Product Info */}
							<div className="flex-1">
								<h3 className="mb-1 font-semibold text-foreground">{rec.name}</h3>
								<p className="mb-2 text-sm text-muted-foreground">{rec.brand}</p>
								<div className="flex items-center gap-4">
									<span className="font-bold text-foreground">{rec.price}</span>
									<div className="flex items-center gap-1">
										<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
										<span className="text-sm text-foreground">{rec.rating}</span>
									</div>
								</div>
							</div>
						</div>

						{/* Why we recommend */}
						<div className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
							<p className="text-sm text-blue-900 dark:text-blue-100">
								<strong>Why we recommend this:</strong> {rec.why}
							</p>
						</div>

						{/* Go to Store Button */}
						<Button
							variant="outline"
							className="w-full justify-between border border-border bg-card"
							asChild
						>
							<a
								href={rec.url}
								target="_blank"
								rel="noopener noreferrer"
							>
								<span className="flex items-center gap-2">
									<ExternalLink className="h-4 w-4" />
									<span>Go to {rec.brand} Official</span>
								</span>
							</a>
						</Button>
					</Card>
				))}

				{/* Back to menu */}
				<div className="pt-4 text-center">
					<Link
						href={`/${lang}`}
						className="text-sm font-medium text-foreground hover:underline"
					>
						Back to menu
					</Link>
				</div>
			</div>
		</main>
	);
}

