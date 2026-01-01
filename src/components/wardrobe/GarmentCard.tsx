import Image from "next/image";
import { Heart, Check } from "lucide-react";
import type { WardrobeItem } from "./types";
import { cn } from "@/lib/utils";

type GarmentCardProps = {
	garment: WardrobeItem;
	viewMode?: "grid" | "list";
	onClick?: () => void;
	isSelected?: boolean;
	onToggleSelect?: (e: React.MouseEvent) => void;
	onToggleFavorite?: (e: React.MouseEvent) => void;
};

export default function GarmentCard({
	garment,
	viewMode = "grid",
	onClick,
	isSelected = false,
	onToggleSelect,
	onToggleFavorite
}: GarmentCardProps) {
	// Common Overlay Component
	const SelectionOverlay = () => (
		<>
			{/* Selection Checkbox (Top-Left) */}
			<div 
				className={cn(
					"absolute top-2 left-2 z-10 flex h-4 w-4 items-center justify-center rounded-full border border-garmentcard-checkbox transition-all hover:bg-black/10 hover:scale-110",
					isSelected && "bg-primary border-primary hover:bg-primary"
				)}
				onClick={onToggleSelect}
			>
				{isSelected && <Check className="h-3 w-3 text-white" />}
			</div>

			{/* Favorite Button (Top-Right) */}
			<div 
				className="absolute top-2 right-2 z-10 flex h-4 w-4 items-center justify-center rounded-full transition-all hover:scale-110"
				onClick={onToggleFavorite}
			>
				<Heart 
					className={cn(
						"h-4 w-4 transition-colors",
						garment.favorite ? "fill-red-500 text-red-500" : "text-[var(--garmentcard-checkbox)]"
					)} 
				/>
			</div>
		</>
	);

	if (viewMode === "list") {
		return (
			<div
				className={cn(
					"relative flex gap-4 rounded-lg border border-border bg-card p-4 cursor-pointer transition-all",
					isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"
				)}
				onClick={onClick}
			>
				<div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-zinc-100">
					{garment.imageUrl ? (
						<Image
							src={garment.imageUrl}
							alt={garment.name}
							fill
							className="object-cover"
						/>
					) : null}
					
					{/* Category Badge (Bottom-Left in List View) */}
					<div className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5">
						<span className="text-[10px] font-medium text-white">{garment.category}</span>
					</div>

					<SelectionOverlay />
				</div>
				<div className="flex-1 space-y-1 py-1">
					<div className="flex justify-between items-start">
						<h3 className="font-semibold text-foreground">{garment.name}</h3>
					</div>
					<p className="text-sm text-muted-foreground">{garment.brand}</p>
					{garment.lastWorn && (
						<p className="text-xs text-muted-foreground pt-1">Last worn: {garment.lastWorn}</p>
					)}
				</div>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-lg border border-border bg-card cursor-pointer transition-all hover:shadow-lg",
				isSelected ? "border-primary ring-2 ring-primary shadow-md" : ""
			)}
			onClick={onClick}
		>
			<div className="relative aspect-[3/4] w-full bg-zinc-100">
				{garment.imageUrl ? (
					<Image
						src={garment.imageUrl}
						alt={garment.name}
						fill
						className="object-cover"
					/>
				) : null}
				
				{/* Category Badge (Bottom-Left) */}
				<div className="absolute bottom-2 left-2 rounded bg-black/80 px-2 py-1">
					<span className="text-xs font-medium text-white">{garment.category}</span>
				</div>

				<SelectionOverlay />
			</div>
			
			<div className="space-y-1 p-3">
				<h3 className="text-sm font-semibold text-foreground truncate pr-4">{garment.name}</h3>
				<p className="text-xs text-muted-foreground truncate">{garment.brand}</p>
				{garment.lastWorn && (
					<p className="text-xs text-muted-foreground">Last worn: {garment.lastWorn}</p>
				)}
			</div>
		</div>
	);
}
