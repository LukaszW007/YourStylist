"use client";

import { LayoutGrid, List, Home, ArrowLeft, Camera, Sun, MoreHorizontal, Shirt, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/Button";
import GarmentGrid from "@/components/wardrobe/GarmentGrid";
import type { WardrobeItem } from "@/components/wardrobe/types";
import { cn } from "@/lib/utils";
import { fetchWardrobe } from "@/lib/supabase/loaders";
import { tryGetSupabaseBrowser } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type WardrobePageClientProps = {
	lang: string;
};

type GarmentRow = Database["public"]["Tables"]["garments"]["Row"];

export default function WardrobePageClient({ lang }: WardrobePageClientProps) {
	const router = useRouter();
	const [primaryFilter, setPrimaryFilter] = useState<string>("Category");
	const [subFilter, setSubFilter] = useState<string>("All");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	// Reset subFilter when primaryFilter changes
	useEffect(() => {
		setSubFilter("All");
	}, [primaryFilter]);
	const [items, setItems] = useState<WardrobeItem[]>([]);
	const [rawGarments, setRawGarments] = useState<GarmentRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [userId, setUserId] = useState<string | null>(null);

	// Fetch user ID
	useEffect(() => {
		async function getUserId() {
			const supabase = tryGetSupabaseBrowser();
			if (!supabase) return;

			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) {
				setUserId(user.id);
			}
		}
		getUserId();
	}, []);

	// Fetch garments from Supabase
	useEffect(() => {
		async function loadGarments() {
			if (!userId) return;

			setLoading(true);
			try {
				const result = await fetchWardrobe(userId);

				if (result.configured && result.data) {
					// Store raw data for filtering
					setRawGarments(result.data as GarmentRow[]);

					// Map Supabase garments to WardrobeItem format
					const mappedItems: WardrobeItem[] = (result.data as GarmentRow[]).map((garment: GarmentRow) => {
						// Map database category to display category
						const categoryMap: Record<string, string> = {
							tops: "Tops",
							bottoms: "Bottoms",
							shoes: "Shoes",
							outerwear: "Outerwear",
							accessories: "Accessories",
							underwear: "Underwear",
							other: "Other",
						};

						return {
							id: garment.id,
							name: garment.name,
							category: categoryMap[garment.category] || garment.category,
							brand: garment.brand || undefined,
							lastWorn: garment.last_worn_date ? new Date(garment.last_worn_date).toLocaleDateString() : undefined,
							imageUrl: garment.image_url || undefined,
							colorFamily: garment.color_family || undefined,
							comfortMinC: garment.comfort_min_c ?? undefined,
							comfortMaxC: garment.comfort_max_c ?? undefined,
						};
					});
					setItems(mappedItems);
				}
			} catch (error) {
				console.error("Error loading wardrobe:", error);
			} finally {
				setLoading(false);
			}
		}

		loadGarments();
	}, [userId]);

	// Get available options for the current primary filter
	const getSubFilterOptions = () => {
		if (primaryFilter === "Category") {
			return ["All", "Tops", "Bottoms", "Shoes", "Outerwear", "Accessories", "Underwear", "Other"];
		}
		if (primaryFilter === "Color Family") {
			const families = rawGarments
				.map((g) => g.color_family)
				.filter((fam): fam is string => Boolean(fam))
				.filter((value, index, self) => self.indexOf(value) === index)
				.sort();
			return ["All", ...families];
		}
		if (primaryFilter === "Temperature Range") {
			// Group by comfort_min_c/comfort_max_c buckets
			const ranges = rawGarments
				.map((g) => {
					if (typeof g.comfort_min_c === "number" && typeof g.comfort_max_c === "number") {
						return `${g.comfort_min_c}–${g.comfort_max_c}°C`;
					}
					return undefined;
				})
				.filter((r): r is string => Boolean(r))
				.filter((value, index, self) => self.indexOf(value) === index)
				.sort();
			return ["All", ...ranges];
		}
		if (primaryFilter === "Brand") {
			const brands = rawGarments
				.map((g) => g.brand)
				.filter((brand): brand is string => Boolean(brand))
				.filter((value, index, self) => self.indexOf(value) === index)
				.sort();
			return ["All", ...brands];
		}
		return ["All"];
	};

	const filteredItems = items.filter((item) => {
		if (subFilter === "All") return true;
		const garment = rawGarments.find((g) => g.id === item.id);
		if (!garment) return false;
		if (primaryFilter === "Category") return item.category === subFilter;
		if (primaryFilter === "Color Family") return garment.color_family === subFilter;
		if (primaryFilter === "Temperature Range") {
			if (typeof garment.comfort_min_c === "number" && typeof garment.comfort_max_c === "number") {
				return `${garment.comfort_min_c}–${garment.comfort_max_c}°C` === subFilter;
			}
			return false;
		}
		if (primaryFilter === "Brand") return garment.brand === subFilter;
		return true;
	});
	// Navigation handler
	const handleItemClick = (item: WardrobeItem) => {
		// Navigate to detail page using Next.js router
		router.push(`/${lang}/wardrobe/${item.id}`);
	};

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
					{["Category", "Color Family", "Temperature Range", "Brand"].map((filter) => (
						<Button
							key={filter}
							variant={primaryFilter === filter ? "default" : "outline"}
							size="sm"
							onClick={() => setPrimaryFilter(filter)}
							className={cn(
								"whitespace-nowrap rounded-full text-sm",
								primaryFilter === filter ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
							)}
						>
							{filter}
						</Button>
					))}
				</div>
			</div>
			{/* Sub-Category Filters */}
			<div className="border-b border-border bg-background px-5 py-3">
				<div className="flex gap-2 overflow-x-auto">
					{getSubFilterOptions().map((sub) => (
						<Button
							key={sub}
							variant={subFilter === sub ? "default" : "outline"}
							size="sm"
							onClick={() => setSubFilter(sub)}
							className={cn(
								"whitespace-nowrap rounded-full text-sm",
								subFilter === sub ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
							)}
						>
							{sub}
						</Button>
					))}
				</div>
			</div>
			{/* Item Count and View Toggle */}
			<div className="flex items-center justify-between px-5 py-3">
				<p className="text-sm text-foreground">{filteredItems.length} items</p>
				<div className="flex gap-2">
					<Button
						variant={viewMode === "grid" ? "default" : "outline"}
						size="icon"
						onClick={() => setViewMode("grid")}
						className={cn("h-8 w-8", viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-card text-foreground")}
					>
						<LayoutGrid className="h-4 w-4" />
					</Button>
					<Button
						variant={viewMode === "list" ? "default" : "outline"}
						size="icon"
						onClick={() => setViewMode("list")}
						className={cn("h-8 w-8", viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-card text-foreground")}
					>
						<List className="h-4 w-4" />
					</Button>
				</div>
			</div>
			{/* Clothing Grid */}
			<div className="px-5">
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<p className="text-muted-foreground">Loading wardrobe...</p>
					</div>
				) : filteredItems.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<p className="text-muted-foreground">No items found</p>
						<p className="mt-2 text-sm text-muted-foreground">Start by scanning some garments!</p>
					</div>
				) : (
					<GarmentGrid
						items={filteredItems}
						viewMode={viewMode}
						onItemClick={handleItemClick}
					/>
				)}
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
