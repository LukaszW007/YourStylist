"use client";

import {
	LayoutGrid,
	List,
	Home,
	ArrowLeft,
	Camera,
	Sun,
	MoreHorizontal,
	Shirt,
	Search,
	Tags,
	Palette,
	Thermometer,
	Store,
	Footprints,
	CloudRain,
	Watch,
	Infinity,
    Heart,
	Trash2,
} from "lucide-react";
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

import { BottomNavigationBar } from "@/components/navigation/BottomNavigationBar";


type WardrobePageClientProps = {
	lang: string;
	dict: any; // Using any for now to avoid complexity with dictionary types
};

type GarmentRow = Database["public"]["Tables"]["garments"]["Row"];

// Custom Icons
const PantsIcon = ({ className }: { className?: string }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="M16 2H8a2 2 0 0 0-2 2v18h4v-9h4v9h4V4a2 2 0 0 0-2-2z" />
	</svg>
);

const UnderwearIcon = ({ className }: { className?: string }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="M19 6H5a2 2 0 0 0-2 2v2c0 4.4 3.6 8 8 8s8-3.6 8-8V8a2 2 0 0 0-2-2z" />
	</svg>
);

export default function WardrobePageClient({ lang, dict }: WardrobePageClientProps) {
	const router = useRouter();
	const [primaryFilter, setPrimaryFilter] = useState<string>("Category");
	const [subFilter, setSubFilter] = useState<string>("All");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    
    // Bulk Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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
                            favorite: garment.favorite || false,
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

    // Selection Handlers
    const handleToggleSelection = (id: string) => {
        setSelectedItems((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleClearSelection = () => {
        setSelectedItems(new Set());
    };

    // Favorite Handlers
    const handleToggleFavorite = async (id: string) => {
        const item = items.find((i) => i.id === id);
        if (!item) return;

        const newStatus = !item.favorite;

        // Optimistic Update
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, favorite: newStatus } : i)));

        const supabase = tryGetSupabaseBrowser();
        if (!supabase) return;

        const { error } = await supabase.from("garments").update({ favorite: newStatus }).eq("id", id);

        if (error) {
            console.error("Error updating favorite:", error);
            // Revert on error
            setItems((prev) => prev.map((i) => (i.id === id ? { ...i, favorite: !newStatus } : i)));
        }
    };

    const handleBulkFavorite = async () => {
        const supabase = tryGetSupabaseBrowser();
        if (!supabase) return;

        const ids = Array.from(selectedItems);
        
        // Optimistic Update
        setItems((prev) => prev.map((i) => (selectedItems.has(i.id) ? { ...i, favorite: true } : i)));
        setSelectedItems(new Set()); // Clear selection

        const { error } = await supabase.from("garments").update({ favorite: true }).in("id", ids);

        if (error) {
            console.error("Error updating bulk favorites:", error);
            alert("Failed to update favorites");
        }
    };

    // Delete Handlers
    const handleBulkDelete = async () => {
        setIsDeleting(true);
        const supabase = tryGetSupabaseBrowser();
        if (!supabase) return;

        const ids = Array.from(selectedItems);

        const { error } = await supabase.from("garments").delete().in("id", ids);

        if (error) {
            console.error("Error deleting items:", error);
            alert("Failed to delete items");
        } else {
            // Remove from local state
            setItems((prev) => prev.filter((i) => !selectedItems.has(i.id)));
            setRawGarments((prev) => prev.filter((g) => !selectedItems.has(g.id)));
            setSelectedItems(new Set());
            setIsDeleteModalOpen(false);
        }
        setIsDeleting(false);
    };
	// Navigation handler
	const handleItemClick = (item: WardrobeItem) => {
		// Navigate to detail page using Next.js router
		router.push(`/${lang}/wardrobe/${item.id}`);
	};

	const getPrimaryFilterIcon = (filter: string) => {
		switch (filter) {
			case "Category":
				return <Tags className="h-4 w-4" />;
			case "Color Family":
				return <Palette className="h-4 w-4" />;
			case "Temperature Range":
				return <Thermometer className="h-4 w-4" />;
			case "Brand":
				return <Store className="h-4 w-4" />;
			default:
				return filter;
		}
	};

	const getCategoryIcon = (category: string) => {
		switch (category) {
			case "All":
				return <Infinity className="h-4 w-4" />;
			case "Tops":
				return <Shirt className="h-4 w-4" />;
			case "Bottoms":
				return <PantsIcon className="h-4 w-4" />;
			case "Shoes":
				return <Footprints className="h-4 w-4" />;
			case "Outerwear":
				return <CloudRain className="h-4 w-4" />;
			case "Accessories":
				return <Watch className="h-4 w-4" />;
			case "Underwear":
				return <UnderwearIcon className="h-4 w-4" />;
			case "Other":
				return <MoreHorizontal className="h-4 w-4" />;
			default:
				return category;
		}
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
								"whitespace-nowrap rounded-full text-sm min-w-[40px] px-3",
								primaryFilter === filter ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
							)}
							title={filter}
						>
							{getPrimaryFilterIcon(filter)}
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
								"whitespace-nowrap rounded-full text-sm min-w-[40px] px-3",
								subFilter === sub ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
							)}
							title={sub}
						>
							{primaryFilter === "Category" ? getCategoryIcon(sub) : sub === "All" ? <Infinity className="h-4 w-4" /> : sub}
						</Button>
					))}
				</div>
			</div>

            {/* Bulk Actions Bar */}
            {selectedItems.size > 0 && (
                <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-5">
                    <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4 shadow-lg">
                        <div className="flex items-center gap-4">
                            <span className="font-medium">{selectedItems.size} selected</span>
                            <Button variant="ghost" size="sm" onClick={handleClearSelection} className="text-muted-foreground">
                                Cancel
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={handleBulkFavorite}>
                                <Heart className="mr-2 h-4 w-4 fill-red-500 text-red-500" />
                                Add to Favorite
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4">
                    <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
                        <h2 className="text-xl font-bold">Delete Selected Items?</h2>
                        <p className="mt-2 text-muted-foreground">
                            Are you sure you want to delete {selectedItems.size} items? This action cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleBulkDelete} disabled={isDeleting}>
                                {isDeleting ? "Deleting..." : "Delete Permanently"}
                            </Button>
                        </div>
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
                        selectedItems={selectedItems}
                        onToggleSelection={handleToggleSelection}
                        onToggleFavorite={handleToggleFavorite}
					/>
				)}
			</div>

			{/* Bottom Navigation */}
			<BottomNavigationBar
				dict={dict}
				lang={lang}
			/>
		</main>
	);
}
