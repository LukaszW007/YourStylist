/**
 * Style Filter Component
 * Allows filtering wardrobe by style context
 */

import { Check } from "lucide-react";
import { STYLE_CONTEXT_OPTIONS } from "@/lib/constants/styles";

interface StyleFilterProps {
	availableStyles: string[];
	selectedStyle: string | null;
	onSelect: (style: string | null) => void;
}

export function StyleFilter({ availableStyles, selectedStyle, onSelect }: StyleFilterProps) {
	return (
		<div className="space-y-2">
			{STYLE_CONTEXT_OPTIONS.map((style) => {
				const isAvailable = availableStyles.includes(style);
				const isSelected = selectedStyle === style;

				return (
					<button
						key={style}
						onClick={() => onSelect(isSelected ? null : style)}
						disabled={!isAvailable}
						className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
							isSelected
								? "border-primary bg-primary/10 text-primary"
								: isAvailable
								? "border-border bg-card text-foreground hover:bg-muted"
								: "border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50"
						}`}
					>
						<span className="font-medium">{style}</span>
						{isSelected && <Check className="h-5 w-5" />}
					</button>
				);
			})}
		</div>
	);
}
