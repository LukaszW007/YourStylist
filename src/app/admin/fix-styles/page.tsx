"use client";

import { useState, useEffect, useRef } from "react";
import { tryGetSupabaseBrowser } from "@/lib/supabase/client";
import { Loader2, CheckCircle, AlertTriangle, Play, RefreshCw, Ban, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Garment {
	id: string;
	name: string;
	tags: string[] | null;
	style_context: string[] | null;
	notes: string | null;
}

interface ProcessLog {
	id: string;
	name: string;
	status: "pending" | "processing" | "success" | "error";
	message: string;
}

const STYLE_KEYWORDS = [
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

export default function AdminFixStylesPage() {
	const [garments, setGarments] = useState<Garment[]>([]);
	const [loading, setLoading] = useState(true);
	const [processing, setProcessing] = useState(false);
	const [logs, setLogs] = useState<ProcessLog[]>([]);
	const [progress, setProgress] = useState({ current: 0, total: 0 });
	const abortControllerRef = useRef<AbortController | null>(null);

	// Load Data
	const loadGarments = async () => {
		setLoading(true);
		try {
			const supabase = tryGetSupabaseBrowser();
			if (!supabase) throw new Error("Supabase client not available");

			const { data, error } = await supabase.from("garments").select("id, name, tags, style_context, notes").order("created_at", { ascending: false });

			if (error) throw error;
			setGarments(data || []);
		} catch (error) {
			console.error("Failed to load garments:", error);
			alert("Failed to load garments. Check console for details.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadGarments();
	}, []);

	// Logic to detect styles in tags or notes
	const detectStyles = (garment: Garment): string[] => {
		const foundStyles: string[] = [];

		// Check tags
		if (garment.tags) {
			garment.tags.forEach((tag) => {
				const match = STYLE_KEYWORDS.find((style) => style.toLowerCase() === tag.toLowerCase());
				if (match && !foundStyles.includes(match)) {
					foundStyles.push(match);
				}
			});
		}

		// Check notes (legacy format: "Style: Smart Casual")
		if (garment.notes) {
			const lowerNotes = garment.notes.toLowerCase();
			if (lowerNotes.includes("style:")) {
				STYLE_KEYWORDS.forEach((style) => {
					if (lowerNotes.includes(style.toLowerCase()) && !foundStyles.includes(style)) {
						foundStyles.push(style);
					}
				});
			}
		}

		return foundStyles;
	};

	// Categorize
	// Logic to find styles that are in tags/notes but NOT in style_context
	const getMissingStyles = (garment: Garment): string[] => {
		const detected = detectStyles(garment);
		const current = garment.style_context || [];
		// Return detected styles that are NOT already in current style_context
		return detected.filter((s) => !current.includes(s));
	};

	// Categorize
	const needsFixItems = garments.filter((g) => {
		const missing = getMissingStyles(g);
		return missing.length > 0;
	});

	// Processing Logic
	const processGarment = async (garment: Garment) => {
		const supabase = tryGetSupabaseBrowser();
		if (!supabase) throw new Error("Supabase client not available");

		const missing = getMissingStyles(garment);

		if (missing.length === 0) {
			throw new Error("No new styles to add");
		}

		const current = garment.style_context || [];
		const merged = Array.from(new Set([...current, ...missing]));

		const { error } = await supabase.from("garments").update({ style_context: merged }).eq("id", garment.id);

		if (error) throw error;

		return merged;
	};

	const runBatch = async (itemsToProcess: Garment[]) => {
		setProcessing(true);
		setLogs([]);
		setProgress({ current: 0, total: itemsToProcess.length });
		abortControllerRef.current = new AbortController();

		const newLogs = itemsToProcess.map((g) => ({
			id: g.id,
			name: g.name,
			status: "pending" as const,
			message: "Waiting...",
		}));
		setLogs(newLogs);

		for (let i = 0; i < itemsToProcess.length; i++) {
			if (abortControllerRef.current?.signal.aborted) break;

			const item = itemsToProcess[i];
			const missing = getMissingStyles(item);
			
			// New merged array
			const current = item.style_context || [];
			const merged = Array.from(new Set([...current, ...missing]));

			setLogs((prev) => prev.map((l) => (l.id === item.id ? { ...l, status: "processing", message: `Adding: ${missing.join(", ")}` } : l)));

			try {
				await processGarment(item);

				// Update local state
				setGarments((prev) => prev.map((g) => (g.id === item.id ? { ...g, style_context: merged } : g)));

				setLogs((prev) => prev.map((l) => (l.id === item.id ? { ...l, status: "success", message: "Done" } : l)));
			} catch (err) {
				const msg = err instanceof Error ? err.message : "Unknown error";
				setLogs((prev) => prev.map((l) => (l.id === item.id ? { ...l, status: "error", message: msg } : l)));
			}

			setProgress((prev) => ({ ...prev, current: i + 1 }));
		}

		setProcessing(false);
		abortControllerRef.current = null;
	};

	const stopProcessing = () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			setProcessing(false);
		}
	};

	return (
		<div className="min-h-screen bg-background p-6 pb-24">
			<div className="max-w-4xl mx-auto space-y-8">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">Style Context Migrator</h1>
						<p className="text-muted-foreground">Migrate styles from Tags/Notes to the new Array field.</p>
					</div>
					<Button variant="outline" onClick={loadGarments} disabled={processing || loading}>
						<RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
						Refresh Data
					</Button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Card className="p-4 border-amber-500/50 bg-amber-500/5">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<Tag className="w-5 h-5 text-amber-500" />
								<h3 className="font-semibold text-amber-500">Needs Migration</h3>
							</div>
							<Badge variant="outline" className="text-amber-500 border-amber-500">{needsFixItems.length}</Badge>
						</div>
						<p className="text-sm text-muted-foreground mb-4">
							Items with styles in Tags/Notes that are missing from `style_context`.
						</p>
						<Button
							className="w-full"
							variant="default" // Changed from destructive/amber to default/primary for better contrast or styling
							disabled={needsFixItems.length === 0 || processing}
							onClick={() => runBatch(needsFixItems)}
						>
							{processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
							Fix {needsFixItems.length} Items
						</Button>
					</Card>
				</div>

				{/* Progress Section */}
				{processing && (
					<Card className="p-6">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium">Processing Queue...</span>
							<span className="text-sm text-muted-foreground">
								{progress.current} / {progress.total}
							</span>
						</div>
						<div className="w-full bg-secondary h-2 rounded-full overflow-hidden mb-4">
							<div
								className="bg-primary h-full transition-all duration-300"
								style={{ width: `${(progress.current / progress.total) * 100}%` }}
							/>
						</div>
						<Button variant="destructive" size="sm" onClick={stopProcessing}>
							<Ban className="w-4 h-4 mr-2" /> Stop
						</Button>
					</Card>
				)}

				{/* Logs */}
				{logs.length > 0 && (
					<Card className="p-4 max-h-[400px] overflow-y-auto space-y-2">
						<h3 className="font-semibold mb-2 sticky top-0 bg-card pb-2 border-b">Process Logs</h3>
						{logs.map((log) => (
							<div key={log.id} className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted/50">
								<span className="font-medium truncate max-w-[200px]">{log.name}</span>
								<div className="flex items-center gap-2">
									<span className="text-muted-foreground">{log.message}</span>
									{log.status === "processing" && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
									{log.status === "success" && <CheckCircle className="w-3 h-3 text-green-500" />}
									{log.status === "error" && <AlertTriangle className="w-3 h-3 text-red-500" />}
								</div>
							</div>
						))}
					</Card>
				)}
			</div>
		</div>
	);
}
