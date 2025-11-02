import Image from "next/image";
import type { WardrobeItem } from "./types";

type GarmentCardProps = {
	garment: WardrobeItem;
	viewMode?: "grid" | "list";
};

export default function GarmentCard({ garment, viewMode = "grid" }: GarmentCardProps) {
	if (viewMode === "list") {
		return (
			<div className="flex gap-4 rounded-lg border border-border bg-card p-4">
				<div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
					{garment.imageUrl ? (
						<Image
							src={garment.imageUrl}
							alt={garment.name}
							fill
							className="object-cover"
						/>
					) : null}
					<div className="absolute top-2 left-2 rounded bg-black/70 px-2 py-1">
						<span className="text-xs font-medium text-white">{garment.category}</span>
					</div>
				</div>
				<div className="flex-1 space-y-1">
					<h3 className="font-semibold text-foreground">{garment.name}</h3>
					<p className="text-sm text-muted-foreground">{garment.brand}</p>
					<p className="text-xs text-muted-foreground">Last worn: {garment.lastWorn}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="relative overflow-hidden rounded-lg border border-border bg-card">
			<div className="relative aspect-[3/4] w-full bg-muted">
				{garment.imageUrl ? (
					<Image
						src={garment.imageUrl}
						alt={garment.name}
						fill
						className="object-cover"
					/>
				) : null}
				<div className="absolute top-2 left-2 rounded bg-black/80 px-2 py-1">
					<span className="text-xs font-medium text-white">{garment.category}</span>
				</div>
			</div>
			<div className="space-y-1 p-3">
				<h3 className="text-sm font-semibold text-foreground">{garment.name}</h3>
				<p className="text-xs text-muted-foreground">{garment.brand}</p>
				<p className="text-xs text-muted-foreground">Last worn: {garment.lastWorn}</p>
			</div>
		</div>
	);
}
