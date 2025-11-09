"use client";

import { useState } from "react";
import { Check, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Image from "next/image";

export interface DetectedItem {
	id: string;
	imageUrl: string;
	detectedCategory: string;
	detectedColor: string;
	category?: string;
	color?: string;
}

interface ConfirmationScreenProps {
	items: DetectedItem[];
	onConfirm: (items: DetectedItem[]) => void;
	onCancel: () => void;
}

const CATEGORIES = ["Koszulka", "Spodnie", "Bluza", "Kurtka", "Buty", "Akcesoria", "Bielizna", "Inne"] as const;

const COLORS = ["Czarny", "Biały", "Szary", "Niebieski", "Czerwony", "Zielony", "Żółty", "Różowy", "Brązowy", "Beżowy", "Wielokolorowy"] as const;

export function ConfirmationScreen({ items, onConfirm, onCancel }: ConfirmationScreenProps) {
	const [editedItems, setEditedItems] = useState<DetectedItem[]>(
		items.map((item) => ({
			...item,
			category: item.category || item.detectedCategory,
			color: item.color || item.detectedColor,
		}))
	);

	const handleCategoryChange = (itemId: string, category: string) => {
		setEditedItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, category } : item)));
	};

	const handleColorChange = (itemId: string, color: string) => {
		setEditedItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, color } : item)));
	};

	const handleConfirm = () => {
		onConfirm(editedItems);
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="flex flex-col px-6 py-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<div>
						<h2 className="text-xl font-brand text-primary">POTWIERDŹ UBRANIA</h2>
						<p className="text-sm text-muted-foreground mt-1">Sprawdź i popraw jeśli potrzeba</p>
					</div>
					<Button
						onClick={onCancel}
						variant="ghost"
						size="sm"
					>
						<X className="w-5 h-5" />
					</Button>
				</div>

				{/* Items Grid */}
				<div className="space-y-4 mb-6">
					{editedItems.map((item, index) => (
						<Card
							key={item.id}
							className="p-4"
						>
							<div className="flex gap-4">
								{/* Item Preview */}
								<div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-card">
									<Image
										src={item.imageUrl}
										alt={`Item ${index + 1}`}
										fill
										className="object-cover"
									/>
								</div>

								{/* Item Details */}
								<div className="flex-1 space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Przedmiot {index + 1}</span>
									</div>

									{/* Category Dropdown */}
									<div className="relative">
										<label className="text-xs text-muted-foreground block mb-1">Kategoria</label>
										<div className="relative">
											<select
												value={item.category}
												onChange={(e) => handleCategoryChange(item.id, e.target.value)}
												className="w-full h-10 px-3 pr-10 text-sm bg-background border border-input rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
											>
												{CATEGORIES.map((cat) => (
													<option
														key={cat}
														value={cat}
													>
														{cat}
													</option>
												))}
											</select>
											<ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
										</div>
									</div>

									{/* Color Dropdown */}
									<div className="relative">
										<label className="text-xs text-muted-foreground block mb-1">Kolor</label>
										<div className="relative">
											<select
												value={item.color}
												onChange={(e) => handleColorChange(item.id, e.target.value)}
												className="w-full h-10 px-3 pr-10 text-sm bg-background border border-input rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
											>
												{COLORS.map((color) => (
													<option
														key={color}
														value={color}
													>
														{color}
													</option>
												))}
											</select>
											<ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
										</div>
									</div>
								</div>
							</div>
						</Card>
					))}
				</div>

				{/* Confirm Button */}
				<div className="mt-auto">
					<Button
						onClick={handleConfirm}
						className="w-full h-14 text-lg"
						size="lg"
					>
						<Check className="w-5 h-5 mr-2" />
						Dodaj wszystko do mojej szafy ({editedItems.length})
					</Button>
				</div>
			</div>
		</div>
	);
}
