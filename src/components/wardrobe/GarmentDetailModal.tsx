"use client";

import { X, Calendar, Tag, Palette, Shirt } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Database } from "@/lib/supabase/types";

type GarmentRow = Database["public"]["Tables"]["garments"]["Row"];

interface GarmentDetailModalProps {
	garment: GarmentRow;
	onClose: () => void;
}

export function GarmentDetailModal({ garment, onClose }: GarmentDetailModalProps) {
	const categoryMap: Record<string, string> = {
		tops: "Tops",
		bottoms: "Bottoms",
		shoes: "Shoes",
		outerwear: "Outerwear",
		accessories: "Accessories",
		underwear: "Underwear",
		other: "Other",
	};

	const displayCategory = categoryMap[garment.category] || garment.category;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
			onClick={onClose}
		>
			<div
				className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background rounded-lg shadow-xl"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-6 py-4">
					<h2 className="text-xl font-semibold text-foreground">{garment.full_name}</h2>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="h-8 w-8 p-0"
					>
						<X className="w-5 h-5" />
					</Button>
				</div>

				{/* Content */}
				<div className="p-6 space-y-6">
					{/* Image */}
					{garment.image_url && (
						<div className="relative aspect-[4/5] w-full max-w-md mx-auto rounded-lg overflow-hidden bg-muted">
							<Image
								src={garment.image_url}
								alt={garment.full_name}
								fill
								className="object-cover"
							/>
						</div>
					)}

					{/* Basic Info */}
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1">
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Shirt className="w-4 h-4" />
									<span>Category</span>
								</div>
								<p className="text-base font-medium text-foreground">{displayCategory}</p>
							</div>

							{garment.subcategory && (
								<div className="space-y-1">
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Tag className="w-4 h-4" />
										<span>Style</span>
									</div>
									<p className="text-base font-medium text-foreground">{garment.subcategory}</p>
								</div>
							)}

							{garment.main_color_name && (
								<div className="space-y-1">
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Palette className="w-4 h-4" />
										<span>Color</span>
									</div>
									<p className="text-base font-medium text-foreground">{garment.main_color_name}</p>
								</div>
							)}

							{garment.brand && (
								<div className="space-y-1">
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Tag className="w-4 h-4" />
										<span>Brand</span>
									</div>
									<p className="text-base font-medium text-foreground">{garment.brand}</p>
								</div>
							)}
						</div>
						{/* Material */}
						{garment.material && garment.material.length > 0 && (
							<div className="space-y-2">
								<p className="text-sm font-medium text-muted-foreground">Materials</p>
								<div className="flex flex-wrap gap-2">
									{garment.material.map((m) => (
										<Badge
											key={m}
											variant="outline"
										>
											{m}
										</Badge>
									))}
								</div>
							</div>
						)}
						{/* Extra Features for Trousers (adjusters/gurkha from key_features) */}
						{garment.category === 'bottoms' && garment.key_features && (garment.key_features as string[]).some(f => ['adjusters', 'gurkha'].includes(f.toLowerCase())) && (
							<div className="space-y-2">
								<p className="text-sm font-medium text-muted-foreground">Extra Feature</p>
								<div className="flex items-center gap-2">
									<Badge variant="outline" className="capitalize">
										{(garment.key_features as string[]).find(f => f.toLowerCase() === 'adjusters') ? 'Adjusters' : 'Gurkha'}
									</Badge>
									<span className="text-xs text-muted-foreground">(No belt)</span>
								</div>
							</div>
						)}
						{/* Tags */}
						{garment.tags && garment.tags.length > 0 && (
							<div className="space-y-2">
								<p className="text-sm font-medium text-muted-foreground">Tags</p>
								<div className="flex flex-wrap gap-2">
									{garment.tags.map((tag, idx) => (
										<Badge
											key={idx}
											variant="outline"
										>
											{tag}
										</Badge>
									))}
								</div>
							</div>
						)}
						{/* Notes */}
						{garment.notes && (
							<div className="space-y-2">
								<p className="text-sm font-medium text-muted-foreground">Notes</p>
								<p className="text-base text-foreground whitespace-pre-wrap">{garment.notes}</p>
							</div>
						)}
					</div>

					{/* Statistics */}
					<div className="border-t border-border pt-6">
						<h3 className="text-lg font-semibold text-foreground mb-4">Statistics</h3>
						<div className="grid grid-cols-2 gap-4">
							<div className="p-4 rounded-lg bg-muted/50">
								<div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
									<Calendar className="w-4 h-4" />
									<span>Last Worn</span>
								</div>
								<p className="text-lg font-semibold text-foreground">
									{garment.last_worn_date ? new Date(garment.last_worn_date).toLocaleDateString() : "Never"}
								</p>
							</div>

							<div className="p-4 rounded-lg bg-muted/50">
								<div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
									<Tag className="w-4 h-4" />
									<span>Wear Count</span>
								</div>
								<p className="text-lg font-semibold text-foreground">{garment.wear_count || 0} times</p>
							</div>

							{garment.purchase_date && (
								<div className="p-4 rounded-lg bg-muted/50">
									<div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
										<Calendar className="w-4 h-4" />
										<span>Purchased</span>
									</div>
									<p className="text-lg font-semibold text-foreground">{new Date(garment.purchase_date).toLocaleDateString()}</p>
								</div>
							)}

							{garment.purchase_price && (
								<div className="p-4 rounded-lg bg-muted/50">
									<div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
										<Tag className="w-4 h-4" />
										<span>Price</span>
									</div>
									<p className="text-lg font-semibold text-foreground">${garment.purchase_price.toFixed(2)}</p>
								</div>
							)}
						</div>
					</div>

					{/* Metadata */}
					<div className="border-t border-border pt-4 text-xs text-muted-foreground">
						<p>Added: {new Date(garment.created_at).toLocaleDateString()}</p>
						{garment.updated_at !== garment.created_at && <p>Updated: {new Date(garment.updated_at).toLocaleDateString()}</p>}
					</div>
				</div>

				{/* Footer */}
				<div className="sticky bottom-0 border-t border-border bg-background px-6 py-4">
					<Button
						onClick={onClose}
						variant="outline"
						className="w-full"
					>
						Close
					</Button>
				</div>
			</div>
		</div>
	);
}
