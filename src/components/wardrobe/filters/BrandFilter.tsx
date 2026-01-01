"use client";

import { cn } from "@/lib/utils";
import { Store } from "lucide-react";

interface BrandFilterProps {
	availableBrands: string[];
	selectedBrand: string | null;
	onSelect: (brand: string | null) => void;
}

export function BrandFilter({ availableBrands, selectedBrand, onSelect }: BrandFilterProps) {
	return (
		<div className="flex flex-col gap-2">
             <button
				onClick={() => onSelect(null)}
				className={cn(
					"flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
					selectedBrand === null
						? "bg-primary text-primary-foreground border-primary"
						: "bg-card hover:bg-muted/50 border-border"
				)}
			>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background/20 backdrop-blur-sm">
				    <Store className="h-4 w-4" />
                </div>
				<span className="font-medium">Wszystkie marki</span>
			</button>

			<div className="grid grid-cols-2 gap-2">
				{availableBrands.map((brand) => (
					<button
						key={brand}
						onClick={() => onSelect(selectedBrand === brand ? null : brand)}
						className={cn(
							"rounded-lg border px-4 py-3 text-sm font-medium transition-all text-center truncate",
							selectedBrand === brand
								? "bg-primary text-primary-foreground border-primary"
								: "bg-card hover:bg-muted/50 border-border text-foreground"
						)}
					>
						{brand}
					</button>
				))}
			</div>
            {availableBrands.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                    Brak marek w Twojej szafie.
                </div>
            )}
		</div>
	);
}
