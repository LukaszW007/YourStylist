import GarmentCard from "./GarmentCard";
import type { WardrobeItem } from "./types";
import { isSupabaseConfigured } from "@/lib/supabase/config-check";

type GarmentGridProps = {
	items: WardrobeItem[];
	viewMode?: "grid" | "list";
	onItemClick?: (item: WardrobeItem) => void;
};

export default function GarmentGrid({ items, viewMode = "grid", onItemClick }: GarmentGridProps) {
	const configured = isSupabaseConfigured();
	if (!items.length) {
		return (
			<div className="text-center py-12 opacity-70 space-y-3">
				<p>No garments yet.</p>
				{!configured && (
					<p className="text-xs text-muted-foreground">
						You are in offline demo mode. Add, edit, and wear tracking features are disabled until cloud sync (Supabase) is configured.
					</p>
				)}
			</div>
		);
	}

	if (viewMode === "list") {
		return (
			<div className="space-y-3">
				{items.map((g) => (
					<GarmentCard
						key={g.id}
						garment={g}
						viewMode="list"
						onClick={() => onItemClick?.(g)}
					/>
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 gap-3">
			{items.map((g) => (
				<GarmentCard
					key={g.id}
					garment={g}
					viewMode="grid"
					onClick={() => onItemClick?.(g)}
				/>
			))}
		</div>
	);
}
