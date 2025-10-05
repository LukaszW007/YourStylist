import type { WardrobeItem } from "./types";

type GarmentCardProps = {
	garment: WardrobeItem;
};

export default function GarmentCard({ garment }: GarmentCardProps) {
	return (
		<div className="rounded-lg border p-3 bg-white/70 dark:bg-white/5">
			<div className="aspect-[3/4] w-full rounded-md bg-neutral-200 dark:bg-white/10" />
			<div className="mt-2 text-sm font-medium">{garment.name ?? "Item"}</div>
			<div className="text-xs opacity-70">{garment.category ?? "Unknown"}</div>
		</div>
	);
}
