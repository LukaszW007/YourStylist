"use client";

import { LayoutGrid, List, Home, ArrowLeft, Camera, Sun, MoreHorizontal, Shirt, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import GarmentGrid from "@/components/wardrobe/GarmentGrid";
import type { WardrobeItem } from "@/components/wardrobe/types";
import { cn } from "@/lib/utils";

type WardrobePageClientProps = {
	lang: string;
};

// Mock data based on the screenshot
const mockItems: WardrobeItem[] = [
	{
		id: "1",
		name: "Navy Wool Blazer",
		category: "Outerwear",
		brand: "Hugo Boss",
		lastWorn: "2 days ago",
		imageUrl: "/api/placeholder/300/400",
	},
	{
		id: "2",
		name: "White Oxford Shirt",
		category: "Tops",
		brand: "Uniqlo",
		lastWorn: "1 week ago",
		imageUrl: "/api/placeholder/300/400",
	},
	{
		id: "3",
		name: "Dark Wash Jeans",
		category: "Bottoms",
		brand: "Zara",
		lastWorn: "3 days ago",
		imageUrl: "/api/placeholder/300/400",
	},
	{
		id: "4",
		name: "Brown Leather Boots",
		category: "Shoes",
		brand: "H&M",
		lastWorn: "1 week ago",
		imageUrl: "/api/placeholder/300/400",
	},
	{
		id: "5",
		name: "Tops",
		category: "Tops",
		brand: "Unknown",
		lastWorn: "Recently",
		imageUrl: "/api/placeholder/300/400",
	},
	{
		id: "6",
		name: "Shoes",
		category: "Shoes",
		brand: "Unknown",
		lastWorn: "Recently",
		imageUrl: "/api/placeholder/300/400",
	},
];

export default function WardrobePageClient({ lang }: WardrobePageClientProps) {
	const [primaryFilter, setPrimaryFilter] = useState<string>("Category");
	const [subFilter, setSubFilter] = useState<string>("All");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	const filteredItems = mockItems.filter((item) => {
		if (subFilter === "All") return true;
		return item.category === subFilter;
	});

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
				<h1 className="text-lg font-semibold text-foreground">My Wardrobe</h1>
				<Link
					href={`/${lang}`}
					className="text-muted-foreground hover:text-foreground"
				>
					<Home className="h-5 w-5" />
				</Link>
			</header>

			{/* Primary Filters */}
			<div className="border-b border-border bg-background px-5 py-3">
				<div className="flex gap-2 overflow-x-auto">
					{["Category", "Color", "Season", "Brand"].map((filter) => (
						<Button
							key={filter}
							variant={primaryFilter === filter ? "default" : "outline"}
							size="sm"
							onClick={() => setPrimaryFilter(filter)}
							className={cn(
								"whitespace-nowrap rounded-full text-sm",
								primaryFilter === filter
									? "bg-primary text-primary-foreground"
									: "bg-card text-foreground"
							)}
						>
							{filter}
						</Button>
					))}
				</div>
			</div>

			{/* Sub-Category Filters */}
			{primaryFilter === "Category" && (
				<div className="border-b border-border bg-background px-5 py-3">
					<div className="flex gap-2 overflow-x-auto">
						{["All", "Tops", "Bottoms", "Shoes", "Outerwear"].map((sub) => (
							<Button
								key={sub}
								variant={subFilter === sub ? "default" : "outline"}
								size="sm"
								onClick={() => setSubFilter(sub)}
								className={cn(
									"whitespace-nowrap rounded-full text-sm",
									subFilter === sub
										? "bg-primary text-primary-foreground"
										: "bg-card text-foreground"
								)}
							>
								{sub}
							</Button>
						))}
					</div>
				</div>
			)}

			{/* Item Count and View Toggle */}
			<div className="flex items-center justify-between px-5 py-3">
				<p className="text-sm text-foreground">{filteredItems.length} items</p>
				<div className="flex gap-2">
					<Button
						variant={viewMode === "grid" ? "default" : "outline"}
						size="icon"
						onClick={() => setViewMode("grid")}
						className={cn(
							"h-8 w-8",
							viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
						)}
					>
						<LayoutGrid className="h-4 w-4" />
					</Button>
					<Button
						variant={viewMode === "list" ? "default" : "outline"}
						size="icon"
						onClick={() => setViewMode("list")}
						className={cn(
							"h-8 w-8",
							viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
						)}
					>
						<List className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Clothing Grid */}
			<div className="px-5">
				<GarmentGrid items={filteredItems} viewMode={viewMode} />
			</div>

			{/* Bottom Navigation */}
			<footer className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background">
				<nav className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-6">
					<Link
						href={`/${lang}/wardrobe`}
						className="flex flex-col items-center gap-1 text-primary"
					>
						<Shirt className="h-5 w-5" />
						<span className="text-xs">Wardrobe</span>
					</Link>
					<Link
						href={`/${lang}/wardrobe/scan`}
						className="flex flex-col items-center gap-1 text-muted-foreground"
					>
						<Camera className="h-5 w-5" />
						<span className="text-xs">Scanner</span>
					</Link>
					<Link
						href={`/${lang}`}
						className="flex flex-col items-center gap-1 text-muted-foreground"
					>
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold">
							<Sun className="h-5 w-5 text-gold-foreground" />
						</div>
						<span className="text-xs">Today</span>
					</Link>
					<Link
						href={`/${lang}/shopping`}
						className="flex flex-col items-center gap-1 text-muted-foreground"
					>
						<Search className="h-5 w-5" />
						<span className="text-xs">Shopping</span>
					</Link>
					<Link
						href={`/${lang}/features`}
						className="flex flex-col items-center gap-1 text-muted-foreground"
					>
						<MoreHorizontal className="h-5 w-5" />
						<span className="text-xs">Menu</span>
					</Link>
				</nav>
			</footer>
		</main>
	);
}

