/**
 * Style Preferences Component
 * Allows users to select up to 3 preferred styles for outfit generation
 */
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { X, Check } from "lucide-react";

// 8 Defined Styles (canonical list)
const DEFINED_STYLES = [
	"British Country / Heritage",
	"Smart casual",
	"Business casual",
	"Casual/streetwear/workwear",
	"Ivy League (Preppy)",
	"Sporty (rugby/cricket)",
	"Western/country",
	"Formal",
] as const;

type StylePreferences = string[];

interface StylePreferencesSelectorProps {
	userId: string;
	initialPreferences?: StylePreferences;
	onSave?: (preferences: StylePreferences) => Promise<void>;
}

export function StylePreferencesSelector({
	userId,
	initialPreferences = ["Casual/streetwear/workwear", "Smart casual", "Business casual"],
	onSave,
}: StylePreferencesSelectorProps) {
	const [selectedStyles, setSelectedStyles] = useState<StylePreferences>(initialPreferences);
	const [isSaving, setIsSaving] = useState(false);

	// Sync with parent state when initialPreferences prop changes
	useEffect(() => {
		console.log("📥 [SELECTOR] Syncing with initialPreferences:", initialPreferences);
		setSelectedStyles(initialPreferences);
	}, [initialPreferences]);

	const toggleStyle = (style: string) => {
		setSelectedStyles((prev) => {
			if (prev.includes(style)) {
				// Remove if already selected
				return prev.filter((s) => s !== style);
			} else if (prev.length < 3) {
				// Add if less than 3 selected
				return [...prev, style];
			}
			// If already 3 selected, ignore
			return prev;
		});
	};

	const handleSave = async () => {
		if (selectedStyles.length === 0) {
			alert("Please select at least 1 style");
			return;
		}

		setIsSaving(true);
		try {
			if (onSave) {
				await onSave(selectedStyles);
			}
		} catch (error) {
			console.error("Failed to save style preferences:", error);
			alert("Failed to save preferences");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Card className="w-full rounded-xl border border-border bg-card p-4">
			<div className="mb-4">
				<h3 className="mb-1 font-medium text-foreground">Style Preferences</h3>
				<p className="text-sm text-muted-foreground">
					Select up to 3 styles for outfit generation ({selectedStyles.length}/3 selected)
				</p>
			</div>

			<div className="mb-4 flex flex-wrap gap-2">
				{DEFINED_STYLES.map((style) => {
					const isSelected = selectedStyles.includes(style);
					return (
						<button
							key={style}
							onClick={() => toggleStyle(style)}
							className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
								isSelected
									? "border-primary bg-primary text-white"
									: "border-border bg-card text-foreground hover:bg-muted"
							}`}
							disabled={!isSelected && selectedStyles.length >= 3}
						>
							<span>{style}</span>
							{isSelected && <Check className="h-3 w-3" />}
						</button>
					);
				})}
			</div>

			<Button onClick={handleSave} disabled={isSaving || selectedStyles.length === 0} className="w-full">
				{isSaving ? "Saving..." : "Save Preferences"}
			</Button>
		</Card>
	);
}
