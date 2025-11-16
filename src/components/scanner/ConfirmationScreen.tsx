"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, X, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";

export interface DetectedItem {
	id: string;
	imageUrl: string;
	detectedCategory: string; // translated base category
	detectedColor: string; // translated main color name
	colorName?: string | null;
	colorHex?: string | null;
	colorRgba?: string | null;
	secondaryColors?: { name?: string; hex?: string; rgba?: string }[];
	subType?: string | null;
	styleContext?: string | null;
	pattern?: string | null;
	keyFeatures?: string[];
	materialGuess?: string | null;
	confidence?: number; // 0-1 scale
	category?: string;
	color?: string;
}

interface ConfirmationScreenProps {
	items: DetectedItem[];
	onConfirm: (items: DetectedItem[]) => void;
	onCancel: () => void;
	translations: {
		confirmItems: string;
		reviewDetails: string;
		category: string;
		styleSubtype: string;
		styleContext: string;
		colorName: string;
		hex: string;
		secondaryColors: string;
		pattern: string;
		keyFeatures: string;
		addFeature: string;
		material: string;
		addAllToCloset: string;
		addOneToCloset: string;
		name: string;
		exampleShirt: string;
	};
}

const CATEGORIES = ["Koszulka", "Spodnie", "Bluza", "Kurtka", "Buty", "Sukienka", "Spódnica", "Sweter", "Marynarka", "Akcesoria", "Inne"] as const;

const STYLE_CONTEXT_OPTIONS = [
	"Formal",
	"Business Casual",
	"Smart Casual",
	"Streetwear",
	"Minimalist",
	"Sportswear",
	"Utility/Military",
	"Western/Country",
	"Vintage",
	"Outdoor",
	"Techwear",
];

const PATTERN_OPTIONS = [
	"Solid",
	"Chalk Stripe",
	"Pinstripe",
	"Houndstooth",
	"Herringbone",
	"Plaid",
	"Paisley",
	"Barleycorn",
	"Floral",
	"Windowpane",
	"Sharkskin",
	"Glen Check",
	"Nailhead",
	"Gingham",
	"Dot",
	"Twill",
	"Tartan",
	"Shepherd's Check",
	"Graph Check",
	"Tattersall",
	"Madras",
	"Birdseye",
	"Awning Stripe",
	"Bengal Stripe",
	"Candy Stripe",
	"Pencil Stripe",
	"Undefined",
];

const MATERIAL_OPTIONS = ["Cotton", "Denim", "Wool", "Leather", "Linen", "Silk", "Synthetic", "Polyester", "Nylon", "Fleece", "Suede", "Canvas"];

export function ConfirmationScreen({ items, onConfirm, onCancel, translations }: ConfirmationScreenProps) {
	const [edited, setEdited] = useState<DetectedItem[]>(
		items.map((i) => ({
			...i,
			category: i.category || i.detectedCategory,
			color: i.color || i.detectedColor,
			keyFeatures: i.keyFeatures || [],
			secondaryColors: i.secondaryColors || [],
		}))
	);
	const [expanded, setExpanded] = useState<Set<string>>(new Set());
	const [newFeature, setNewFeature] = useState<Record<string, string>>({});
	const [newSecondary, setNewSecondary] = useState<Record<string, { name: string; hex: string }>>({});

	const toggleExpanded = (id: string) => {
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const updateItem = (id: string, patch: Partial<DetectedItem>) => {
		setEdited((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
	};

	const addFeature = (id: string) => {
		const val = (newFeature[id] || "").trim();
		if (!val) return;
		updateItem(id, { keyFeatures: [...(edited.find((i) => i.id === id)?.keyFeatures || []), val] });
		setNewFeature((nf) => ({ ...nf, [id]: "" }));
	};
	const removeFeature = (id: string, idx: number) => {
		const item = edited.find((i) => i.id === id);
		if (!item) return;
		updateItem(id, { keyFeatures: item.keyFeatures?.filter((_, i) => i !== idx) });
	};

	const addSecondaryColor = (id: string) => {
		const sc = newSecondary[id];
		if (!sc?.name?.trim() || !sc?.hex?.trim()) return;
		const item = edited.find((i) => i.id === id);
		updateItem(id, { secondaryColors: [...(item?.secondaryColors || []), { name: sc.name.trim(), hex: sc.hex }] });
		setNewSecondary((ns) => ({ ...ns, [id]: { name: "", hex: "#000000" } }));
	};
	const removeSecondaryColor = (id: string, idx: number) => {
		const item = edited.find((i) => i.id === id);
		if (!item) return;
		updateItem(id, { secondaryColors: item.secondaryColors?.filter((_, i) => i !== idx) });
	};

	const handleConfirm = () => {
		onConfirm(edited);
	};

	return (
		<div className="min-h-screen bg-background p-6 pb-24">
			<div className="max-w-md mx-auto">
				<div className="flex items-start justify-between mb-6">
					<div>
						<h2 className="text-xl font-brand">{translations.confirmItems}</h2>
						<p className="text-sm text-muted-foreground">{translations.reviewDetails}</p>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={onCancel}
					>
						<X className="w-5 h-5" />
					</Button>
				</div>

				<div className="space-y-4 mb-6">
					{edited.map((item) => {
						const isOpen = expanded.has(item.id);
						return (
							<Card
								key={item.id}
								className="overflow-hidden"
							>
								<div
									className="p-4 flex items-center gap-4 cursor-pointer hover:bg-muted/40 transition-colors"
									onClick={() => toggleExpanded(item.id)}
								>
									<div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
										<Image
											src={item.imageUrl}
											alt={item.subType || item.detectedCategory}
											fill
											className="object-cover"
										/>
									</div>
									<div className="flex-1 min-w-0">
										<h3 className="truncate text-sm font-medium">{item.subType || item.detectedCategory}</h3>
										<p className="text-xs text-muted-foreground truncate">
											{item.colorName || item.detectedColor} {item.detectedCategory}
										</p>
										<div className="flex items-center gap-2 mt-1">
											{item.colorHex && (
												<div
													className="w-4 h-4 rounded-full border border-border"
													style={{ backgroundColor: item.colorHex }}
												/>
											)}
											{item.materialGuess && <span className="text-[10px] text-muted-foreground">{item.materialGuess}</span>}
											{typeof item.confidence === "number" && (
												<span className="text-[10px] text-muted-foreground ml-auto">
													{Math.round(item.confidence * 100)}%
												</span>
											)}
										</div>
									</div>
									{isOpen ? (
										<ChevronUp className="w-5 h-5 text-muted-foreground" />
									) : (
										<ChevronDown className="w-5 h-5 text-muted-foreground" />
									)}
								</div>
								{isOpen && (
									<div className="px-4 pb-4 space-y-4 border-t border-border pt-4 text-sm">
										<div className="space-y-1">
											<Label>{translations.category}</Label>
											<select
												value={item.category}
												onChange={(e) => updateItem(item.id, { category: e.target.value })}
												className="w-full appearance-none bg-input-background border border-border rounded-md px-3 py-2 cursor-pointer"
											>
												{CATEGORIES.map((c) => (
													<option key={c}>{c}</option>
												))}
											</select>
										</div>
										<div className="space-y-1">
											<Label>{translations.styleSubtype}</Label>
											<Input
												value={item.subType || ""}
												onChange={(e) => updateItem(item.id, { subType: e.target.value })}
												placeholder="Np. Oxford Shirt"
											/>
										</div>
										<div className="space-y-1">
											<Label>{translations.styleContext}</Label>
											<select
												value={item.styleContext || ""}
												onChange={(e) => updateItem(item.id, { styleContext: e.target.value })}
												className="w-full appearance-none bg-input-background border border-border rounded-md px-3 py-2 cursor-pointer"
											>
												<option value="">—</option>
												{STYLE_CONTEXT_OPTIONS.map((o) => (
													<option key={o}>{o}</option>
												))}
											</select>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-1">
												<Label>{translations.colorName}</Label>
												<Input
													value={item.colorName || item.color || ""}
													onChange={(e) => updateItem(item.id, { colorName: e.target.value, color: e.target.value })}
													placeholder="Navy Blue"
												/>
											</div>
											<div className="space-y-1">
												<Label>{translations.hex}</Label>
												<div className="flex gap-2">
													<Input
														type="color"
														value={item.colorHex || "#000000"}
														onChange={(e) => updateItem(item.id, { colorHex: e.target.value })}
														className="w-12 h-10 p-1 cursor-pointer"
													/>
													<Input
														value={item.colorHex || ""}
														onChange={(e) => updateItem(item.id, { colorHex: e.target.value })}
														placeholder="#RRGGBB"
														className="flex-1"
													/>
												</div>
											</div>
										</div>
										<div className="space-y-2">
											<Label>{translations.secondaryColors}</Label>
											<div className="flex flex-wrap gap-2 mb-2">
												{item.secondaryColors?.map((c, i) => (
													<Badge
														key={i}
														variant="muted"
														className="flex items-center gap-1 pl-2 pr-1 py-1"
													>
														{c.hex && (
															<span
																className="w-3 h-3 rounded-full border border-border"
																style={{ backgroundColor: c.hex }}
															/>
														)}
														<span>{c.name}</span>
														<button
															onClick={() => removeSecondaryColor(item.id, i)}
															className="hover:bg-background/50 rounded-full p-0.5"
														>
															<X className="w-3 h-3" />
														</button>
													</Badge>
												))}
											</div>
											<div className="flex gap-2">
												<Input
													placeholder={translations.name}
													value={newSecondary[item.id]?.name || ""}
													onChange={(e) =>
														setNewSecondary((ns) => ({
															...ns,
															[item.id]: { name: e.target.value, hex: ns[item.id]?.hex || "#000000" },
														}))
													}
													className="flex-1"
												/>
												<Input
													type="color"
													value={newSecondary[item.id]?.hex || "#000000"}
													onChange={(e) =>
														setNewSecondary((ns) => ({
															...ns,
															[item.id]: { name: ns[item.id]?.name || "", hex: e.target.value },
														}))
													}
													className="w-12 p-1 cursor-pointer"
												/>
												<Button
													size="sm"
													variant="outline"
													onClick={() => addSecondaryColor(item.id)}
												>
													<Plus className="w-4 h-4" />
												</Button>
											</div>
										</div>
										<div className="space-y-1">
											<Label>{translations.pattern}</Label>
											<select
												value={item.pattern || ""}
												onChange={(e) => updateItem(item.id, { pattern: e.target.value })}
												className="w-full appearance-none bg-input-background border border-border rounded-md px-3 py-2 cursor-pointer"
											>
												<option value="">—</option>
												{PATTERN_OPTIONS.map((p) => (
													<option key={p}>{p}</option>
												))}
											</select>
										</div>
										<div className="space-y-2">
											<Label>{translations.keyFeatures}</Label>
											<div className="flex flex-wrap gap-2 mb-2">
												{item.keyFeatures?.map((f, i) => (
													<Badge
														key={i}
														variant="outline"
														className="flex items-center gap-1 pr-1"
													>
														<span>{f}</span>
														<button
															onClick={() => removeFeature(item.id, i)}
															className="hover:bg-background/50 rounded-full p-0.5"
														>
															<X className="w-3 h-3" />
														</button>
													</Badge>
												))}
											</div>
											<div className="flex gap-2">
												<Input
													placeholder={translations.addFeature}
													value={newFeature[item.id] || ""}
													onChange={(e) => setNewFeature((nf) => ({ ...nf, [item.id]: e.target.value }))}
													onKeyDown={(e) => {
														if (e.key === "Enter") {
															e.preventDefault();
															addFeature(item.id);
														}
													}}
												/>
												<Button
													size="sm"
													variant="outline"
													onClick={() => addFeature(item.id)}
												>
													<Plus className="w-4 h-4" />
												</Button>
											</div>
										</div>
										<div className="space-y-1">
											<Label>{translations.material}</Label>
											<select
												value={item.materialGuess || ""}
												onChange={(e) => updateItem(item.id, { materialGuess: e.target.value })}
												className="w-full appearance-none bg-input-background border border-border rounded-md px-3 py-2 cursor-pointer"
											>
												<option value="">—</option>
												{MATERIAL_OPTIONS.map((m) => (
													<option key={m}>{m}</option>
												))}
											</select>
										</div>
									</div>
								)}
							</Card>
						);
					})}
				</div>

				<Button
					onClick={handleConfirm}
					className="w-full h-12"
					size="lg"
				>
					<Check className="w-5 h-5 mr-2" />
					{edited.length === 1 ? translations.addOneToCloset : `${translations.addAllToCloset} (${edited.length})`}
				</Button>
			</div>
		</div>
	);
}
