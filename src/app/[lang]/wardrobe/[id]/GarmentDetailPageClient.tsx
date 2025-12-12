"use client";

import { Edit, Trash2, Eye, ArrowLeft, ChevronRight, TrendingUp, Calendar, Home, Droplet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Database } from "@/lib/supabase/types";
import { GarmentEditModal } from "@/components/wardrobe/GarmentEditModal";
import { updateGarment as updateGarmentQuery } from "@/lib/supabase/queries";
import { tryGetSupabaseBrowser } from "@/lib/supabase/client";
import { BottomNavigationBar } from "@/components/navigation/BottomNavigationBar";
import { useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

// Fallback parser for legacy rows where AI fields are embedded inside notes (e.g. "Pattern: Solid | Features: A, B | Style: Sportswear")
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

type GarmentRow = Database["public"]["Tables"]["garments"]["Row"];

interface GarmentDetailPageClientProps {
	garmentId: string;
	lang: string;
	dict: any; // Using any for now to avoid complexity with dictionary types
}

// Mock statistics data - będzie później pobierane z bazy
const mockWearData = [
	{ month: "Jul", wears: 8 },
	{ month: "Aug", wears: 12 },
	{ month: "Sep", wears: 15 },
	{ month: "Oct", wears: 10 },
	{ month: "Nov", wears: 14 },
];

export function GarmentDetailPageClient({ garmentId, lang, dict }: GarmentDetailPageClientProps) {
	const router = useRouter();
	const [isEditing, setIsEditing] = useState(false);
	const [garment, setGarment] = useState<GarmentRow | null>(null);
	const [loading, setLoading] = useState(true);

	// Fetch garment data on mount
	useEffect(() => {
		async function loadGarment() {
			const supabase = tryGetSupabaseBrowser();
			if (!supabase) {
				router.push(`/${lang}/wardrobe`);
				return;
			}

			const { data, error } = await supabase.from("garments").select("*").eq("id", garmentId).single();

			if (error || !data) {
				console.error("Error loading garment:", error);
				router.push(`/${lang}/wardrobe`);
				return;
			}

			setGarment(data);
			setLoading(false);
		}

		loadGarment();
	}, [garmentId, lang, router]);

	if (loading || !garment) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	// Compute dynamic display name (color + subtype/category)
	const computedName = (() => {
		const color = garment.main_color_name?.toLowerCase();
		const subtype = garment.subcategory?.toLowerCase() || garment.category?.toLowerCase();
		if (color && subtype) return `${color} ${subtype}`;
		return garment.name;
	})();

	// Statistics from database
	const stats = {
		timesWorn: garment.wear_count || 0,
		lastWorn: garment.last_worn_date ? formatRelativeDate(garment.last_worn_date) : "Never",
		lastLaundered: garment.last_laundered_date ? formatRelativeDate(garment.last_laundered_date) : "—",
		addedDate: new Date(garment.created_at).toLocaleDateString(),
		wearFrequency: calculateWearFrequency(garment.wear_count || 0, garment.created_at),
	};

	// Legacy fallback extraction
	const legacy = parseLegacyNotes(garment.notes || undefined);

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to remove this item?")) return;

		// TODO: Implement delete functionality
		console.log("Delete garment:", garment.id);
		router.push(`/${lang}/wardrobe`);
	};

	const handleSeeOutfits = () => {
		// TODO: Navigate to outfits page with this garment
		console.log("See outfits with:", garment.id);
	};

	const handleSaveEdit = async (updatedData: Partial<GarmentRow>) => {
		const result = await updateGarmentQuery(garment.id, updatedData);

		if (!result) {
			throw new Error("Failed to update garment");
		}

		setGarment(result);
		router.refresh();
	};

	return (
		<div className="min-h-screen bg-background pb-24">
			{/* Header */}
			<header className="flex items-center justify-between border-b border-border bg-background px-5 py-4">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.back()}
					className="text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<h1 className="text-lg font-semibold text-foreground">Item Details</h1>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.push(`/${lang}`)}
					className="text-muted-foreground hover:text-foreground"
				>
					<Home className="h-5 w-5" />
				</Button>
			</header>{" "}
			<div className="px-5 py-6 space-y-6">
				{/* Item Image */}
				<Card className="overflow-hidden">
					<div className="relative aspect-square bg-muted">
						{garment.image_url ? (
							<Image
								src={garment.image_url}
								alt={garment.name}
								fill
								className="object-cover"
								sizes="(max-width: 768px) 100vw, 672px"
								priority
							/>
						) : (
							<div className="flex items-center justify-center h-full text-muted-foreground">No image available</div>
						)}
					</div>
				</Card>

				{/* Edit Button */}
				<Button
					variant="outline"
					size="lg"
					onClick={() => setIsEditing(true)}
					className="w-full gap-2"
				>
					<Edit className="h-4 w-4" />
					Edit Item
				</Button>

				{/* Item Name & Quick Info */}
				<div className="text-center space-y-1">
					<h1 className="text-2xl font-semibold">{computedName}</h1>
					<p className="text-muted-foreground capitalize">{garment.subcategory || garment.category}</p>
				</div>

				{/* Description Section */}
				<Card className="p-5 space-y-4">
					<div>
						<h3 className="mb-3 font-semibold">Description</h3>
						<p className="text-muted-foreground leading-relaxed">{garment.description || "No description provided."}</p>
					</div>

					<div className="pt-2 border-t border-border space-y-3">
						{/* Style Context */}
						{(() => {
							const styleCtx = (garment.style_context || "").trim();
							return styleCtx.length > 0 ? (
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Style</span>
									<Badge variant="outline">{styleCtx}</Badge>
								</div>
							) : null;
						})()}
						{/* Main Color */}
						{garment.main_color_name && (
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Main Color</span>
								<div className="flex items-center gap-2">
									{garment.main_color_hex && (
										<div
											className="w-5 h-5 rounded-full border-2 border-border"
											style={{ backgroundColor: garment.main_color_hex }}
										/>
									)}
									<span>{garment.main_color_name}</span>
								</div>
							</div>
						)}
						{/* Secondary Colors */}
						{garment.secondary_colors && garment.secondary_colors.length > 0 && (
							<div className="flex items-start justify-between">
								<span className="text-muted-foreground">Accents</span>
								<div className="flex flex-wrap gap-1.5 justify-end max-w-[280px]">
									{garment.secondary_colors.map((color: { name?: string; hex?: string }, index: number) => (
										<div
											key={index}
											className="flex items-center gap-1.5"
										>
											<div
												className="w-4 h-4 rounded-full border border-border"
												style={{ backgroundColor: color.hex }}
											/>
											<span className="text-sm">{color.name}</span>
										</div>
									))}
								</div>
							</div>
						)}
						{/* Pattern */}
						{(garment.pattern || legacy.pattern) && (
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Pattern</span>
								<span>{garment.pattern || legacy.pattern}</span>
							</div>
						)}
						{/* Fabric(s) */}
						{garment.material && garment.material.length > 0 && (
							<div className="flex items-start justify-between">
								<span className="text-muted-foreground">Fabric</span>
								<div className="flex flex-wrap gap-1.5 justify-end max-w-[280px]">
									{garment.material.map((m: string, idx: number) => (
										<Badge
											key={idx}
											variant="outline"
											className="text-xs"
										>
											{m}
										</Badge>
									))}
								</div>
							</div>
						)}
						{/* Key Features */}
						{(garment.key_features && garment.key_features.length > 0) || (legacy.key_features && legacy.key_features.length > 0) ? (
							<div className="flex items-start justify-between">
								<span className="text-muted-foreground">Features</span>
								<div className="flex flex-wrap gap-1.5 justify-end max-w-[280px]">
									{(garment.key_features && garment.key_features.length > 0 ? garment.key_features : legacy.key_features || []).map(
										(feature: string, index: number) => (
											<Badge
												key={index}
												variant="outline"
												className="text-xs"
											>
												{feature}
											</Badge>
										)
									)}
								</div>
							</div>
						) : null}
					</div>
				</Card>

				{/* Statistics Section */}
				<Card className="p-5 space-y-4">
					<h3 className="flex items-center gap-2 font-semibold">
						<TrendingUp className="h-5 w-5 text-primary" />
						<span>Wearing Statistics</span>
					</h3>

					{/* Key Stats Grid */}
					<div className="grid grid-cols-2 gap-3">
						<div className="text-center p-3 bg-secondary/50 rounded-lg">
							<div className="text-2xl font-bold text-amber-400 mb-1">{stats.timesWorn}</div>
							<div className="text-xs text-muted-foreground">Times Worn</div>
						</div>
						<div className="text-center p-3 bg-secondary/50 rounded-lg">
							<div className="text-xs text-muted-foreground mb-1">Last Worn</div>
							<div className="text-sm font-medium">{stats.lastWorn}</div>
						</div>
					</div>

					{/* Wear Frequency Chart */}
					<div className="pt-2">
						<div className="flex items-center justify-between mb-3">
							<span className="text-sm text-muted-foreground">Last 5 Months</span>
							<span className="text-sm font-medium">{stats.wearFrequency}</span>
						</div>
						<div className="h-[140px] w-full">
							<ResponsiveContainer
								width="100%"
								height="100%"
							>
								<BarChart data={mockWearData}>
									<XAxis
										dataKey="month"
										tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
										axisLine={false}
										tickLine={false}
									/>
									<YAxis hide />
									<Bar
										dataKey="wears"
										fill="#7a2f2f"
										radius={[4, 4, 0, 0]}
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Additional Details */}
					<div className="pt-2 border-t border-border space-y-2.5">
						<div className="flex items-center gap-3 text-sm">
							<Calendar className="h-4 w-4 text-muted-foreground" />
							<span className="text-muted-foreground">Added to wardrobe:</span>
							<span className="ml-auto font-medium">{stats.addedDate}</span>
						</div>
						<div className="flex items-center gap-3 text-sm">
							<Droplet className="h-4 w-4 text-muted-foreground" />
							<span className="text-muted-foreground">Last laundered:</span>
							<span className="ml-auto font-medium">{stats.lastLaundered}</span>
						</div>
					</div>
				</Card>

				{/* Action Buttons */}
				<Card className="p-4 space-y-3">
					<div className="flex items-center justify-center">
						<Button
							onClick={handleSeeOutfits}
							className="w-full"
							variant="outline"
						>
							<div className="flex items-center gap-2">
								<Eye className="h-4 w-4" />
								<span>See Outfits with This Item</span>
							</div>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
					<div className="flex items-center justify-center">
						<Button
							onClick={handleDelete}
							variant="ghost"
							className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Remove
						</Button>
					</div>
				</Card>
			</div>
			{/* Bottom Navigation */}
			<BottomNavigationBar dict={dict} lang={lang} />

			{/* Edit Modal */}
			{isEditing && (
				<GarmentEditModal
					garment={garment}
					onClose={() => setIsEditing(false)}
					onSave={handleSaveEdit}
				/>
			)}
		</div>
	);
}

// Helper function to format relative dates
function formatRelativeDate(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffTime = Math.abs(now.getTime() - date.getTime());
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return "Today";
	if (diffDays === 1) return "Yesterday";
	if (diffDays < 7) return `${diffDays} days ago`;
	if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
	if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
	return `${Math.floor(diffDays / 365)} years ago`;
}

// Helper function to calculate wear frequency
function calculateWearFrequency(wearCount: number, createdAt: string): string {
	const created = new Date(createdAt);
	const now = new Date();
	const diffTime = Math.abs(now.getTime() - created.getTime());
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays === 0 || wearCount === 0) return "Not worn yet";

	const wearsPerWeek = (wearCount / diffDays) * 7;

	if (wearsPerWeek < 0.5) return "Rarely worn";
	if (wearsPerWeek < 1) return "Once a week";
	if (wearsPerWeek < 2) return "1-2 times per week";
	if (wearsPerWeek < 3) return "2-3 times per week";
	return "3+ times per week";
}
