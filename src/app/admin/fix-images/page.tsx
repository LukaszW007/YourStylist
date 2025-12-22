"use client";

import { useState, useEffect, useRef } from "react";
import { tryGetSupabaseBrowser } from "@/lib/supabase/client";
import { removeBackground } from "@imgly/background-removal";
import { Loader2, CheckCircle, AlertTriangle, Play, RefreshCw, Image as ImageIcon, ArrowRight, Ban } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";

interface Garment {
	id: string;
	name: string;
	image_url: string;
	user_id: string;
	category?: string;
}

interface ProcessLog {
	id: string;
	name: string;
	status: "pending" | "processing" | "success" | "error";
	message: string;
}

export default function AdminFixImagesPage() {
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

			const { data, error } = await supabase.from("garments").select("*").order("created_at", { ascending: false });

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

	// Categorize
	const isBase64 = (url: string) => url?.startsWith("data:image");
	const base64Items = garments.filter((g) => isBase64(g.image_url));
	const hostedItems = garments.filter((g) => !isBase64(g.image_url));

	// Processing Logic
	const processGarment = async (garment: Garment) => {
		const supabase = tryGetSupabaseBrowser();
		if (!supabase) throw new Error("Supabase client not available");

		try {
			// Step A: Conversion to Blob
			let imageBlob: Blob;
			if (isBase64(garment.image_url)) {
				const res = await fetch(garment.image_url);
				imageBlob = await res.blob();
			} else {
				// Handle CORS: If direct fetch fails, we might need a proxy or backend helper.
				// Assuming Supabase URLs are accessible or configured with CORS.
				const res = await fetch(garment.image_url, { mode: "cors" });
				if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
				imageBlob = await res.blob();
			}

			// Step B: Background Removal
			// removeBackground accepts Blob or URL. We pass the blob.
			const cleanBlob = await removeBackground(imageBlob);

			// Step C: Upload to Supabase Storage
			const fileName = `clean/${garment.id}.png`;
			const { error: uploadError } = await supabase.storage.from("garments").upload(fileName, cleanBlob, {
				contentType: "image/png",
				upsert: true,
			});

			if (uploadError) throw uploadError;

			// Step D: Update DB
			const {
				data: { publicUrl },
			} = supabase.storage.from("garments").getPublicUrl(fileName);

			const { error: updateError } = await supabase.from("garments").update({ image_url: publicUrl }).eq("id", garment.id);

			if (updateError) throw updateError;

			return publicUrl;
		} catch (error) {
			console.error(`Error processing ${garment.name}:`, error);
			throw error;
		}
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

			// Update log to processing
			setLogs((prev) => prev.map((l) => (l.id === item.id ? { ...l, status: "processing", message: "Removing background..." } : l)));

			try {
				const newUrl = await processGarment(item);

				// Update local state to reflect change immediately
				setGarments((prev) => prev.map((g) => (g.id === item.id ? { ...g, image_url: newUrl } : g)));

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
						<h1 className="text-2xl font-bold">Wardrobe Cleanup Tool</h1>
						<p className="text-muted-foreground">Migrate Base64 images and remove backgrounds.</p>
					</div>
					<Button
						variant="outline"
						onClick={loadGarments}
						disabled={processing || loading}
					>
						<RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
						Refresh Data
					</Button>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Card className="p-4 border-destructive/50 bg-destructive/5">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<AlertTriangle className="w-5 h-5 text-destructive" />
								<h3 className="font-semibold text-destructive">Needs Migration (Base64)</h3>
							</div>
							<Badge variant="destructive">{base64Items.length}</Badge>
						</div>
						<p className="text-sm text-muted-foreground mb-4">
							These items are stored as huge text strings in the database. They slow down the app and need to be moved to Storage.
						</p>
						<Button
							className="w-full"
							variant="destructive"
							disabled={base64Items.length === 0 || processing}
							onClick={() => runBatch(base64Items)}
						>
							{processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
							Fix {base64Items.length} Items
						</Button>
					</Card>

					<Card className="p-4 border-primary/20 bg-primary/5">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<CheckCircle className="w-5 h-5 text-primary" />
								<h3 className="font-semibold text-primary">Hosted (URL)</h3>
							</div>
							<Badge variant="secondary">{hostedItems.length}</Badge>
						</div>
						<p className="text-sm text-muted-foreground mb-4">
							These items are already hosted. You can re-process them to ensure they have transparent backgrounds.
						</p>
						<Button
							className="w-full"
							variant="outline"
							disabled={hostedItems.length === 0 || processing}
							onClick={() => runBatch(hostedItems)}
						>
							{processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
							Re-process All
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
						<Button
							variant="destructive"
							size="sm"
							onClick={stopProcessing}
						>
							<Ban className="w-4 h-4 mr-2" /> Stop
						</Button>
					</Card>
				)}

				{/* Logs */}
				{logs.length > 0 && (
					<Card className="p-4 max-h-[400px] overflow-y-auto space-y-2">
						<h3 className="font-semibold mb-2 sticky top-0 bg-card pb-2 border-b">Process Logs</h3>
						{logs.map((log) => (
							<div
								key={log.id}
								className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted/50"
							>
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
