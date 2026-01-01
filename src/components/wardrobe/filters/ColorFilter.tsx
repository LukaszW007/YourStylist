"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ColorOption {
    id: string; // Canonical ID (e.g., "blue", "royal-blue")
    label: string; // Display name (e.g., "Niebieski")
    hex: string; // Hex code
}

interface ColorFilterProps {
	availableColors: ColorOption[]; 
	selectedColorId: string | null; // Changed from selectedColor string to ID
	onSelect: (colorId: string | null) => void;
}

export function ColorFilter({ availableColors, selectedColorId: selectedColor, onSelect }: ColorFilterProps) {
	return (
		<div className="grid grid-cols-4 gap-4 sm:grid-cols-5">
            {/* 'All' Option */}
             <button
                onClick={() => onSelect(null)}
                className={cn(
                    "flex flex-col items-center gap-2 rounded-lg p-2 transition-all hover:bg-muted/50",
                    selectedColor === null ? "opacity-100" : "opacity-70"
                )}
            >
                <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border-2 bg-gradient-to-br from-white to-gray-200",
                    selectedColor === null ? "border-primary" : "border-border"
                )}>
                   {selectedColor === null && <div className="h-3 w-3 rounded-full bg-primary" />}
                </div>
                <span className="text-xs font-medium text-center">Wszystkie</span>
            </button>

			{availableColors.map((option) => {
                const isSelected = selectedColor === option.id;

				return (
					<button
						key={option.id}
						onClick={() => onSelect(isSelected ? null : option.id)}
						className="flex flex-col items-center gap-2 group"
					>
						<div
							className={cn(
								"relative flex h-12 w-12 items-center justify-center rounded-full border transition-all shadow-sm",
                                isSelected ? "ring-2 ring-primary ring-offset-2 border-transparent scale-110" : "border-border group-hover:scale-105"
							)}
							style={{ backgroundColor: option.hex }}
						>
							{isSelected && (
								<Check className={cn(
                                    "h-5 w-5 stroke-[3]", 
                                    // Use black check for light colors, white for dark (simplified heuristic)
                                    ["white", "yellow", "beige", "off-white", "light-blue", "lavender", "mint", "cream"].includes(option.id) ? "text-black" : "text-white"
                                )} />
							)}
						</div>
						<span className={cn(
                            "text-xs font-medium text-center truncate w-full px-1",
                            isSelected ? "text-primary font-bold" : "text-muted-foreground"
                        )}>
                            {option.label}
                        </span>
					</button>
				);
			})}
		</div>
	);
}
