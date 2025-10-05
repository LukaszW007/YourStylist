import GarmentCard from "./GarmentCard";
import type { WardrobeItem } from "./types";

type GarmentGridProps = {
	items: WardrobeItem[];
};

export default function GarmentGrid({ items }: GarmentGridProps) {
	if (!items.length) {
		return <div className="text-center py-12 opacity-70">No garments yet.</div>;
	}
	return (
		<div className="grid grid-cols-2 gap-3">
			{items.map((g) => (
				<GarmentCard
					key={g.id}
					garment={g}
				/>
			))}
		</div>
	);
}
