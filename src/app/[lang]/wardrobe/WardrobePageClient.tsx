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
    X,
} from "lucide-react";
import { findColorEntry, translateCanonicalColor, type Lang } from "@/lib/i18n/colorDictionary";
import { FilterDrawer } from "@/components/wardrobe/filters/FilterDrawer";
import { TemperatureFilter } from "@/components/wardrobe/filters/TemperatureFilter";
import { ColorFilter } from "@/components/wardrobe/filters/ColorFilter";
import { BrandFilter } from "@/components/wardrobe/filters/BrandFilter";
import { Tooltip } from "@/components/ui/Tooltip";
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
	
    // Advanced Filter State
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [activeDrawer, setActiveDrawer] = useState<"temperature" | "color" | "brand" | null>(null);
    const [activeFilters, setActiveFilters] = useState<{
        temperature: string | null;
        color: string | null;
        brand: string | null;
    }>({
        temperature: null,
        color: null,
        brand: null,
    });
    
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    
    // Bulk Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
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
                        name: garment.full_name || "",  // Use full_name for display (DB has only full_name)
                        full_name: garment.full_name || "",
                        category: categoryMap[garment.category] || garment.category,
                        brand: garment.brand || undefined,
                        lastWorn: garment.last_worn_date ? new Date(garment.last_worn_date).toLocaleDateString() : undefined,
                        imageUrl: garment.image_url || undefined,
						colorFamily: garment.main_color_name || undefined,
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


	const filteredItems = items.filter((item) => {
		const garment = rawGarments.find((g) => g.id === item.id);
		if (!garment) return false;

        // 1. Category Filter
        if (activeCategory !== "All" && item.category !== activeCategory) return false;

        // 2. Temperature Filter
        if (activeFilters.temperature) {
             if (typeof garment.comfort_min_c !== "number" || typeof garment.comfort_max_c !== "number") return false;
             const range = activeFilters.temperature;
             const min = garment.comfort_min_c;
             const max = garment.comfort_max_c;
             
             // Ranges: <0, 0-10, 10-20, 20-25, >25
             if (range === "<0") {
                 if (min >= 0) return false; // Overlap? simplistic check: if garment range overlaps with filter
                 // Strict check: if garment feels like it belongs? 
                 // Let's assume garment range must effectively OVERLAP with filter range significantly?
                 // Simpler: If ANY part of garment range is in filter range.
                 if (max < -50) return false; // sanity
                 return max < 0; // Strict: max is below 0. 
                 // Wait, if item is -5 to 5, it covers <0 and 0-10. 
                 // Let's use simplified logic: Midpoint?
                 // Or overlap logic: (ItemMin <= FilterMax) && (ItemMax >= FilterMin)
                 // <0: Min=-inf, Max=0
                 // 0-10: Min=0, Max=10
                 // ...
             }
             
             // Define filter ranges
             let fMin = -100, fMax = 100;
             if (range === "<0") { fMax = 0; }
             else if (range === "0-10") { fMin = 0; fMax = 10; }
             else if (range === "10-20") { fMin = 10; fMax = 20; }
             else if (range === "20-25") { fMin = 20; fMax = 25; }
             else if (range === ">25") { fMin = 25; }
             
             // Check overlap
             return (min < fMax) && (max > fMin);
        }

        // 3. Color Filter
        if (activeFilters.color) {
            const garmentColorEntry = findColorEntry(garment.main_color_name || "");
            const filterColorEntry = findColorEntry(activeFilters.color); // activeFilters.color is now an ID, but findColorEntry handles it if it looks like a key
            // Ideally activeFilters.color IS the ID.
            if (!garmentColorEntry || garmentColorEntry.id !== activeFilters.color) return false;
        }

        // 4. Brand Filter
        if (activeFilters.brand && garment.brand !== activeFilters.brand) return false;

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
			<header className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-border bg-background px-5 py-4">
				<div className="flex justify-start">
					<Link
						href={`/${lang}`}
						className="text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft className="h-5 w-5" />
					</Link>
				</div>
				<h1 className="text-lg font-semibold text-foreground text-center truncate px-2">My Wardrobe</h1>
				<div className="flex justify-end">
					<Link
						href={`/${lang}`}
						className="text-muted-foreground hover:text-foreground"
					>
						<Home className="h-5 w-5" />
					</Link>
				</div>
			</header>
			{/* Filter Trigger Bar (New) */}
			<div className="static top-0 z-20 border-b border-border bg-background px-5 py-3 shadow-sm sticky">
				<div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {/* Category Filter (Horizontal Scroll - kept as is for quick access or moved to drawer? Keeping distinct) */}
                    {/* Actually, let's keep Category as the main view selector and use icons for specific attributes */}
                    
                    <div className="flex gap-2">
                        <Tooltip text="Filter by Temperature">
                            <Button
                                variant={activeDrawer === "temperature" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveDrawer("temperature")}
                                className={cn("rounded-full gap-2", activeFilters.temperature ? "border-primary text-primary bg-primary/10" : "")}
                            >
                                <Thermometer className="h-4 w-4" />
                                {activeFilters.temperature ? <span className="text-xs font-bold">{activeFilters.temperature}</span> : <span className="text-xs">Temp</span>}
                            </Button>
                        </Tooltip>

                        <Tooltip text="Filter by Color">
                            <Button
                                variant={activeDrawer === "color" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveDrawer("color")}
                                className={cn("rounded-full gap-2", activeFilters.color ? "border-primary text-primary bg-primary/10" : "")}
                            >
                                <Palette className="h-4 w-4" />
                                {activeFilters.color ? (
                                    <span className="text-xs font-bold">
                                        {/* Display localized name of selected color ID */}
                                        {translateCanonicalColor(activeFilters.color, lang as Lang)}
                                    </span>
                                ) : (
                                    <span className="text-xs">Color</span>
                                )}
                            </Button>
                        </Tooltip>

                        <Tooltip text="Filter by Brand">
                            <Button
                                variant={activeDrawer === "brand" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveDrawer("brand")}
                                className={cn("rounded-full gap-2", activeFilters.brand ? "border-primary text-primary bg-primary/10" : "")}
                            >
                                <Store className="h-4 w-4" />
                                {activeFilters.brand ? <span className="text-xs font-bold">{activeFilters.brand}</span> : <span className="text-xs">Brand</span>}
                            </Button>
                        </Tooltip>

                        {(activeFilters.temperature || activeFilters.color || activeFilters.brand) && (
                            <Tooltip text="Clear Filters">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActiveFilters({ temperature: null, color: null, brand: null })}
                                    className="rounded-full px-2 text-muted-foreground hover:text-destructive"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </Tooltip>
                        )}
                    </div>
				</div>
                
                {/* Category Pills (Secondary level) */}
                 <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                     {["All", "Tops", "Bottoms", "Shoes", "Outerwear", "Accessories", "Underwear", "Other"].map(cat => (
                         <Tooltip key={cat} text={`Filter by ${cat}`}>
                            <button
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
                                    activeCategory === cat 
                                        ? "bg-foreground text-background" 
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                            >
                                {getCategoryIcon(cat)}
                                {/* <span>{cat}</span> */}
                            </button>
                         </Tooltip>
                     ))}
                 </div>
			</div>

            {/* Filter Drawers */}
            <FilterDrawer 
                isOpen={activeDrawer === "temperature"} 
                onClose={() => setActiveDrawer(null)} 
                title="Wybierz temperaturę"
            >
                <TemperatureFilter 
                    selectedRange={activeFilters.temperature} 
                    onSelect={(range) => {
                        setActiveFilters(prev => ({ ...prev, temperature: range }));
                        setActiveDrawer(null);
                    }} 
                />
            </FilterDrawer>

            <FilterDrawer 
                isOpen={activeDrawer === "color"} 
                onClose={() => setActiveDrawer(null)} 
                title="Wybierz kolor"
            >
                <ColorFilter 
 
                    availableColors={Array.from(
                        rawGarments
                            .reduce((acc, g) => {
                                const entry = findColorEntry(g.main_color_name || "");
                                if (entry) {
                                    if (!acc.has(entry.id)) {
                                        acc.set(entry.id, {
                                            id: entry.id,
                                            label: translateCanonicalColor(entry.id, lang as Lang),
                                            hex: entry.hex || "#ccc"
                                        });
                                    }
                                }
                                return acc;
                            }, new Map<string, { id: string; label: string; hex: string }>())
                            .values()
                    ).sort((a, b) => a.label.localeCompare(b.label))}
                    selectedColorId={activeFilters.color} 
                    onSelect={(colorId) => {
                        setActiveFilters(prev => ({ ...prev, color: colorId }));
                        setActiveDrawer(null);
                    }} 
                />
            </FilterDrawer>

            <FilterDrawer 
                isOpen={activeDrawer === "brand"} 
                onClose={() => setActiveDrawer(null)} 
                title="Wybierz markę"
            >
                <BrandFilter 
                    availableBrands={rawGarments
                        .map((g) => g.brand)
                        .filter((brand): brand is string => Boolean(brand))
                        .filter((value, index, self) => self.indexOf(value) === index)
                        .sort()}
                    selectedBrand={activeFilters.brand} 
                    onSelect={(brand) => {
                        setActiveFilters(prev => ({ ...prev, brand: brand }));
                        setActiveDrawer(null);
                    }} 
                />
            </FilterDrawer>

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
                    <Tooltip text="Grid View">
                        <Button
                            variant={viewMode === "grid" ? "default" : "outline"}
                            size="icon"
                            onClick={() => setViewMode("grid")}
                            className={cn("h-8 w-8", viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-card text-foreground")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </Tooltip>
                    <Tooltip text="List View">
                        <Button
                            variant={viewMode === "list" ? "default" : "outline"}
                            size="icon"
                            onClick={() => setViewMode("list")}
                            className={cn("h-8 w-8", viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-card text-foreground")}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </Tooltip>
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
