"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";
import type { Database } from "@/lib/supabase/types";

type GarmentRow = Database["public"]["Tables"]["garments"]["Row"];

interface GarmentEditModalProps {
	garment: GarmentRow;
	onClose: () => void;
	onSave: (updatedGarment: Partial<GarmentRow>) => Promise<void>;
}

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

export function GarmentEditModal({ garment, onClose, onSave }: GarmentEditModalProps) {
	// Legacy fallback parser (mirrors detail page)
	function parseLegacyNotes(notes?: string) {
		if (!notes) return {} as { pattern?: string; style_context?: string; key_features?: string[] };
		const parts = notes.split("|").map((p) => p.trim());
		const out: { pattern?: string; style_context?: string; key_features?: string[] } = {};
		for (const part of parts) {
			const [label, rest] = part.split(":").map((s) => s.trim());
			if (!rest) continue;
			const lower = label.toLowerCase();
			if (lower === "pattern") out.pattern = rest;
			else if (lower === "features")
				out.key_features = rest
					.split(",")
					.map((f) => f.trim())
					.filter(Boolean);
			else if (lower === "style") out.style_context = rest;
		}
		return out;
	}

	const legacy = parseLegacyNotes(garment.notes || undefined);
	const [formData, setFormData] = useState({
		name: garment.name,
		subcategory: garment.subcategory || "",
		style_context: garment.style_context || legacy.style_context || "",
		main_color_name: garment.main_color_name || "",
		main_color_hex: garment.main_color_hex || "#000000",
		color_temperature: garment.color_temperature || "",
		secondary_colors: garment.secondary_colors || [],
		pattern: garment.pattern || legacy.pattern || "",
		key_features: garment.key_features || legacy.key_features || [],
		material: garment.material || (legacy.key_features ? [] : []),
		brand: garment.brand || "",
		description: garment.description || "",
		last_laundered_date: garment.last_laundered_date || "",
	});

	const [isSaving, setIsSaving] = useState(false);
	const [newFeature, setNewFeature] = useState("");
	const [newSecondary, setNewSecondary] = useState({ name: "", hex: "#000000" });

	const addFeature = () => {
		const val = newFeature.trim();
		if (!val) return;
		setFormData((prev) => ({ ...prev, key_features: [...prev.key_features, val] }));
		setNewFeature("");
	};

	const removeFeature = (idx: number) => {
		setFormData((prev) => ({ ...prev, key_features: prev.key_features.filter((_, i) => i !== idx) }));
	};

	const addSecondaryColor = () => {
		if (!newSecondary.hex.trim()) return;
		const colorName = newSecondary.name.trim() || newSecondary.hex;
		setFormData((prev) => ({
			...prev,
			secondary_colors: [...prev.secondary_colors, { name: colorName, hex: newSecondary.hex }],
		}));
		setNewSecondary({ name: "", hex: "#000000" });
	};

	const removeSecondaryColor = (idx: number) => {
		setFormData((prev) => ({ ...prev, secondary_colors: prev.secondary_colors.filter((_, i) => i !== idx) }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSaving(true);

		try {
			const updatedData: Partial<GarmentRow> = {
				name: formData.name,
				subcategory: formData.subcategory || null,
				style_context: formData.style_context || null,
				main_color_name: formData.main_color_name || null,
				main_color_hex: formData.main_color_hex || null,
				color_temperature: formData.color_temperature || null,
				secondary_colors: formData.secondary_colors,
				pattern: formData.pattern || null,
				key_features: formData.key_features,
				material: formData.material || null,
				brand: formData.brand || null,
				description: formData.description || null,
				last_laundered_date: formData.last_laundered_date ? formData.last_laundered_date : null,
			};

			await onSave(updatedData);
			onClose();
		} catch (error) {
			console.error("Error saving garment:", error);
			alert("Failed to save changes. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 bg-background flex flex-col">
			<form
				onSubmit={handleSubmit}
				className="flex flex-col h-full"
			>
				{/* Header */}
				<div className="flex items-center justify-between border-b border-border bg-background px-5 py-4">
					<h2 className="text-xl font-brand">Edit Item</h2>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={onClose}
					>
						<X className="w-5 h-5" />
					</Button>
				</div>

				{/* Scrollable Content */}
				<div className="flex-1 overflow-y-auto p-6">
					<div className="max-w-md mx-auto space-y-4">
						{/* Image Preview */}
						{garment.image_url && (
							<Card className="overflow-hidden">
								<div className="relative aspect-square bg-muted">
									<Image
										src={garment.image_url}
										alt={garment.name}
										fill
										className="object-cover"
									/>
								</div>
							</Card>
						)}

						{/* Form Fields - similar to ConfirmationScreen */}
						<Card className="p-4 space-y-4 text-sm">
							{/* Name */}
							<div className="space-y-1">
								<Label>Item Name</Label>
								<Input
									value={formData.name}
									onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
									placeholder="White Oxford Shirt"
								/>
							</div>

							{/* Style Subtype */}
							<div className="space-y-1">
								<Label>Style Subtype</Label>
								<Input
									value={formData.subcategory}
									onChange={(e) => setFormData((prev) => ({ ...prev, subcategory: e.target.value }))}
									placeholder="Oxford Shirt, Polo, etc."
								/>
							</div>

							{/* Style Context */}
							<div className="space-y-1">
								<Label>Style Context</Label>
								<select
									value={formData.style_context}
									onChange={(e) => setFormData((prev) => ({ ...prev, style_context: e.target.value }))}
									className="w-full appearance-none bg-input-background border border-border rounded-md px-3 py-2 cursor-pointer"
								>
									<option value="">—</option>
									{STYLE_CONTEXT_OPTIONS.map((o) => (
										<option
											key={o}
											value={o}
										>
											{o}
										</option>
									))}
								</select>
							</div>

							{/* Main Color */}
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1">
									<Label>Color Name</Label>
									<Input
										value={formData.main_color_name}
										onChange={(e) => setFormData((prev) => ({ ...prev, main_color_name: e.target.value }))}
										placeholder="Navy Blue"
									/>
								</div>
								<div className="space-y-1">
									<Label>Hex</Label>
									<div className="flex gap-2">
										<Input
											type="color"
											value={formData.main_color_hex}
											onChange={(e) => setFormData((prev) => ({ ...prev, main_color_hex: e.target.value }))}
											className="w-12 h-10 p-1 cursor-pointer"
										/>
										<Input
											value={formData.main_color_hex}
											onChange={(e) => setFormData((prev) => ({ ...prev, main_color_hex: e.target.value }))}
											placeholder="#RRGGBB"
											className="flex-1"
										/>
									</div>
								</div>
							</div>

							{/* Color Temperature */}
							<div className="space-y-1">
								<Label>Color Temperature</Label>
								<select
									value={formData.color_temperature}
									onChange={(e) => setFormData((prev) => ({ ...prev, color_temperature: e.target.value }))}
									className="w-full appearance-none bg-input-background border border-border rounded-md px-3 py-2 cursor-pointer"
								>
									<option value="">—</option>
									<option value="Warm">Warm</option>
									<option value="Cool">Cool</option>
									<option value="Neutral">Neutral</option>
								</select>
							</div>

							{/* Secondary Colors */}
							<div className="space-y-2">
								<Label>Secondary Colors</Label>
								<div className="flex flex-wrap gap-2 mb-2">
									{formData.secondary_colors.map((c, i) => (
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
												type="button"
												onClick={() => removeSecondaryColor(i)}
												className="hover:bg-background/50 rounded-full p-0.5"
											>
												<X className="w-3 h-3" />
											</button>
										</Badge>
									))}
								</div>
								<div className="flex gap-2">
									<Input
										placeholder="Name"
										value={newSecondary.name}
										onChange={(e) => setNewSecondary((prev) => ({ ...prev, name: e.target.value }))}
										className="flex-1"
									/>
									<Input
										type="color"
										value={newSecondary.hex}
										onChange={(e) => setNewSecondary((prev) => ({ ...prev, hex: e.target.value }))}
										className="w-12 p-1 cursor-pointer"
									/>
									<Button
										type="button"
										size="sm"
										variant="outline"
										onClick={addSecondaryColor}
									>
										<Plus className="w-4 h-4" />
									</Button>
								</div>
							</div>

							{/* Pattern */}
							<div className="space-y-1">
								<Label>Pattern</Label>
								<select
									value={formData.pattern}
									onChange={(e) => setFormData((prev) => ({ ...prev, pattern: e.target.value }))}
									className="w-full appearance-none bg-input-background border border-border rounded-md px-3 py-2 cursor-pointer"
								>
									<option value="">—</option>
									{PATTERN_OPTIONS.map((p) => (
										<option key={p}>{p}</option>
									))}
								</select>
							</div>

							{/* Materials (multi-select) */}
							<div className="space-y-2">
								<Label>Fabric(s)</Label>
								<div className="flex flex-wrap gap-2 mb-2">
									{formData.material.map((m: string, i: number) => (
										<Badge
											key={i}
											variant="outline"
											className="flex items-center gap-1 pr-1"
										>
											<span>{m}</span>
											<button
												type="button"
												onClick={() =>
													setFormData((prev) => ({ ...prev, material: prev.material.filter((_, idx) => idx !== i) }))
												}
												className="hover:bg-background/50 rounded-full p-0.5"
											>
												<X className="w-3 h-3" />
											</button>
										</Badge>
									))}
								</div>
								<div className="flex gap-2">
									<select
										value=""
										onChange={(e) => {
											const val = e.target.value;
											if (val && !formData.material.includes(val)) {
												setFormData((prev) => ({ ...prev, material: [...prev.material, val] }));
											}
											e.target.value = ""; // reset
										}}
										className="flex-1 appearance-none bg-input-background border border-border rounded-md px-3 py-2 cursor-pointer"
									>
										<option value="">Add fabric…</option>
										{MATERIAL_OPTIONS.filter((m) => !formData.material.includes(m)).map((m) => (
											<option
												key={m}
												value={m}
											>
												{m}
											</option>
										))}
									</select>
									<Button
										type="button"
										variant="outline"
										onClick={() => setFormData((prev) => ({ ...prev, material: [...prev.material, "Blend"] }))}
										className="shrink-0"
									>
										<Plus className="w-4 h-4" />
									</Button>
								</div>
							</div>

							{/* Key Features */}
							<div className="space-y-2">
								<Label>Features</Label>
								<div className="flex flex-wrap gap-2 mb-2">
									{formData.key_features.map((f, i) => (
										<Badge
											key={i}
											variant="outline"
											className="flex items-center gap-1 pr-1"
										>
											<span>{f}</span>
											<button
												type="button"
												onClick={() => removeFeature(i)}
												className="hover:bg-background/50 rounded-full p-0.5"
											>
												<X className="w-3 h-3" />
											</button>
										</Badge>
									))}
								</div>
								<div className="flex gap-2">
									<Input
										placeholder="Add feature..."
										value={newFeature}
										onChange={(e) => setNewFeature(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												addFeature();
											}
										}}
									/>
									<Button
										type="button"
										size="sm"
										variant="outline"
										onClick={addFeature}
									>
										<Plus className="w-4 h-4" />
									</Button>
								</div>
							</div>

							{/* Brand */}
							<div className="space-y-1">
								<Label>Brand</Label>
								<Input
									value={formData.brand}
									onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
									placeholder="Nike, Adidas, Zara..."
								/>
							</div>

							{/* Last Laundered Date */}
							<div className="space-y-1">
								<Label>Last Laundered</Label>
								<Input
									type="date"
									value={formData.last_laundered_date}
									onChange={(e) => setFormData((prev) => ({ ...prev, last_laundered_date: e.target.value }))}
								/>
							</div>

							{/* Description */}
							<div className="space-y-1">
								<Label>Description</Label>
								<textarea
									value={formData.description}
									onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
									rows={3}
									placeholder="Describe pairing and occasions..."
									className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
								/>
							</div>
						</Card>
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-3 pt-4 border-t border-border">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						className="flex-1"
						disabled={isSaving}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						className="flex-1"
						disabled={isSaving}
					>
						{isSaving ? "Saving..." : "Save Changes"}
					</Button>
				</div>
			</form>
		</div>
	);
}
