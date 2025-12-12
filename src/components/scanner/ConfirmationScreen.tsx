"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, X, Plus, Check, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";
import { DuplicateWarningModal } from "./DuplicateWarningModal";
import { findDuplicates, type DuplicateMatch } from "@/lib/utils/duplicateDetection";
import { fetchWardrobe } from "@/lib/supabase/loaders";
import { tryGetSupabaseBrowser } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type GarmentRow = Database["public"]["Tables"]["garments"]["Row"];

export interface DetectedItem {
	id: string;
	imageUrl: string;
	cropped_image_url?: string | null;
	detectedCategory: string; // translated base category
	detectedColor: string; // translated main color name
	colorName?: string | null;
	colorHex?: string | null;
	secondaryColors?: { name?: string; hex?: string }[];
	subType?: string | null;
	styleContext?: string[]; // Changed to array for multi-select
	pattern?: string | null;
	keyFeatures?: string[];
	materials?: string[]; // Array of materials (dominant first)
	brand?: string | null; // Brand name detected from label or style
	description?: string | null; // AI-generated description about pairing and occasions
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
		brand: string;
		addAllToCloset: string;
		addOneToCloset: string;
		name: string;
		exampleShirt: string;
	};
}

const CATEGORIES = [
	"Shirt",
	"T-Shirt",
	"Polo",
	"Tank Top",
	"Jeans",
	"Pants",
	"Shorts",
	"Chinos",
	"Sneakers",
	"Dress Shoes",
	"Boots",
	"Sandals",
	"Sweatshirt",
	"Hoodie",
	"Jacket",
	"Blazer",
	"Coat",
	"Sweater",
	"Cardigan",
	"Dress",
	"Skirt",
	"Other",
] as const;

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

const MATERIAL_OPTIONS = [
	"Cotton",
	"Denim",
	"Wool",
	"Leather",
	"Linen",
	"Silk",
	"Synthetic",
	"Polyester",
	"Nylon",
	"Fleece",
	"Suede",
	"Canvas",
	"Blend",
];

export function ConfirmationScreen({ items, onConfirm, onCancel, translations }: ConfirmationScreenProps) {
	const [edited, setEdited] = useState<DetectedItem[]>(
		items.map((i) => ({
			...i,
			category: i.category || i.detectedCategory,
			color: i.color || i.detectedColor,
			keyFeatures: i.keyFeatures || [],
			secondaryColors: i.secondaryColors || [],
			styleContext: Array.isArray(i.styleContext) ? i.styleContext : i.styleContext ? [i.styleContext] : [],
			materials: i.materials || [],
			brand: i.brand || "Unknown brand",
		}))
	);
	const [expanded, setExpanded] = useState<Set<string>>(new Set());
	const [newFeature, setNewFeature] = useState<Record<string, string>>({});
	const [newSecondary, setNewSecondary] = useState<Record<string, { name: string; hex: string }>>({});
	const [existingGarments, setExistingGarments] = useState<GarmentRow[]>([]);
	const [duplicateCheck, setDuplicateCheck] = useState<{
		item: DetectedItem;
		duplicates: DuplicateMatch[];
	} | null>(null);
	const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

	// Fetch existing garments on mount
	useEffect(() => {
		async function loadExistingGarments() {
			try {
				const supabase = tryGetSupabaseBrowser();
				if (!supabase) return;

				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (!user) return;

				const result = await fetchWardrobe(user.id);
				if (result.configured && result.data) {
					setExistingGarments(result.data);
				}
			} catch (error) {
				console.error("Failed to load existing garments:", error);
			}
		}

		loadExistingGarments();
	}, []);

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
		if (!sc?.hex?.trim()) return;
		const item = edited.find((i) => i.id === id);
		const colorName = sc.name?.trim() || sc.hex;
		updateItem(id, { secondaryColors: [...(item?.secondaryColors || []), { name: colorName, hex: sc.hex }] });
		setNewSecondary((ns) => ({ ...ns, [id]: { name: "", hex: "#000000" } }));
	};
	const removeSecondaryColor = (id: string, idx: number) => {
		const item = edited.find((i) => i.id === id);
		if (!item) return;
		updateItem(id, { secondaryColors: item.secondaryColors?.filter((_, i) => i !== idx) });
	};

	const handleConfirm = async () => {
		// Check for duplicates before confirming
		setIsCheckingDuplicates(true);

		try {
			// Check each item for duplicates
			for (const item of edited) {
				const duplicates = await findDuplicates(
					{
						category: item.category || item.detectedCategory,
						color: item.color || item.detectedColor,
						colorHex: item.colorHex,
						secondaryColors: item.secondaryColors,
						subType: item.subType,
						pattern: item.pattern,
						imageUrl: item.imageUrl,
					},
					existingGarments,
					70 // Visual check threshold
				);

				// If found significant duplicates (>60% match), show warning
				if (duplicates.length > 0 && duplicates[0].matchScore > 60) {
					setDuplicateCheck({ item, duplicates });
					setIsCheckingDuplicates(false);
					return; // Stop and wait for user decision
				}
			}

			// No duplicates found, proceed with confirmation
			setIsCheckingDuplicates(false);
			onConfirm(edited);
		} catch (error) {
			console.error("Duplicate check failed:", error);
			setIsCheckingDuplicates(false);
			// Proceed anyway if duplicate check fails
			onConfirm(edited);
		}
	};

	const handleAddAnyway = () => {
		// User decided to add despite duplicate warning
		setDuplicateCheck(null);
		onConfirm(edited);
	};

	const handleCancelDuplicate = () => {
		// User wants to review items again
		setDuplicateCheck(null);
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
						<Home className="w-5 h-5" />
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
											src={item.cropped_image_url || item.imageUrl}
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
											{item.materials && item.materials.length > 0 && (
												<span className="text-[10px] text-muted-foreground">{item.materials.join(", ")}</span>
											)}
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
											<div className="flex flex-wrap gap-2 mb-2">
												{item.styleContext?.map((style, i) => (
													<Badge
														key={i}
														variant="outline"
														className="flex items-center gap-1 pr-1"
													>
														<span>{style}</span>
														<button
															onClick={() => {
																const newStyles = item.styleContext?.filter((_, idx) => idx !== i) || [];
																updateItem(item.id, { styleContext: newStyles });
															}}
															className="hover:bg-background/50 rounded-full p-0.5"
														>
															<X className="w-3 h-3" />
														</button>
													</Badge>
												))}
											</div>
											<select
												value=""
												onChange={(e) => {
													if (e.target.value && !item.styleContext?.includes(e.target.value)) {
														updateItem(item.id, { styleContext: [...(item.styleContext || []), e.target.value] });
													}
												}}
												className="w-full appearance-none bg-input-background border border-border rounded-md px-3 py-2 cursor-pointer"
											>
												<option value="">+ Add style context...</option>
												{STYLE_CONTEXT_OPTIONS.filter((o) => !item.styleContext?.includes(o)).map((o) => (
													<option
														key={o}
														value={o}
													>
														{o}
													</option>
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
											<Label>Marka / Brand</Label>
											<Input
												value={item.brand || ""}
												onChange={(e) => updateItem(item.id, { brand: e.target.value })}
												placeholder="Nike, Adidas, Zara..."
											/>
										</div>
										<div className="space-y-2">
											<Label>{translations.material}</Label>
											<div className="flex flex-wrap gap-2 mb-2">
												{item.materials?.map((m, i) => (
													<Badge
														key={i}
														variant="outline"
														className="flex items-center gap-1 pr-1"
													>
														<span>{m}</span>
														<button
															onClick={() => {
																const newMaterials = item.materials?.filter((_, idx) => idx !== i) || [];
																updateItem(item.id, { materials: newMaterials });
															}}
															className="hover:bg-background/50 rounded-full p-0.5"
														>
															<X className="w-3 h-3" />
														</button>
													</Badge>
												))}
											</div>
											<select
												value=""
												onChange={(e) => {
													if (e.target.value && !item.materials?.includes(e.target.value)) {
														updateItem(item.id, { materials: [...(item.materials || []), e.target.value] });
													}
												}}
												className="w-full appearance-none bg-input-background border border-border rounded-md px-3 py-2 cursor-pointer"
											>
												<option value="">+ Dodaj materiał...</option>
												{MATERIAL_OPTIONS.filter((m) => !item.materials?.includes(m)).map((m) => (
													<option
														key={m}
														value={m}
													>
														{m}
													</option>
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
					disabled={isCheckingDuplicates}
				>
					{isCheckingDuplicates ? (
						<>
							<div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
							Sprawdzanie duplikatów...
						</>
					) : (
						<>
							<Check className="w-5 h-5 mr-2" />
							{edited.length === 1 ? translations.addOneToCloset : `${translations.addAllToCloset} (${edited.length})`}
						</>
					)}
				</Button>
			</div>

			{/* Duplicate warning modal */}
			{duplicateCheck && (
				<DuplicateWarningModal
					newGarmentName={duplicateCheck.item.subType || duplicateCheck.item.detectedCategory}
					newGarmentImage={duplicateCheck.item.cropped_image_url || duplicateCheck.item.imageUrl}
					duplicates={duplicateCheck.duplicates}
					onAddAnyway={handleAddAnyway}
					onCancel={handleCancelDuplicate}
				/>
			)}
		</div>
	);
}
