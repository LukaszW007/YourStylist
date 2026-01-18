"use client";

import { Edit, Trash2, Eye, ArrowLeft, ChevronRight, TrendingUp, Calendar, Home, Droplet, Eraser, Ban, CheckCircle, Heart } from "lucide-react";
import { removeBackground } from "@imgly/background-removal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Database } from "@/lib/supabase/types";
import { GarmentEditModal } from "@/components/wardrobe/GarmentEditModal";
import { updateGarment as updateGarmentQuery } from "@/lib/supabase/queries";
import { tryGetSupabaseBrowser } from "@/lib/supabase/client";
import { BottomNavigationBar } from "@/components/navigation/BottomNavigationBar";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Tooltip } from "@/components/ui/Tooltip";
function parseLegacyNotes(notes?: string) {
    if (!notes) return {} as { pattern?: string; style_context?: string; key_features?: string[] };
    const parts = notes.split("|").map((p) => p.trim());
    const out: { pattern?: string; style_context?: string[]; key_features?: string[] } = {};
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
        else if (lower === "style") out.style_context = [rest];
    }
    return out;
}

type GarmentRow = Database["public"]["Tables"]["garments"]["Row"];

interface GarmentDetailPageClientProps {
    garmentId: string;
    lang: string;
    dict: any;
}

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
    const [removingBg, setRemovingBg] = useState(false);
    
    // Delete button logic
    const [deleteCountdown, setDeleteCountdown] = useState(3);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteBtnVisible, setIsDeleteBtnVisible] = useState(false); // New state for visibility
    const deleteBtnRef = useRef<HTMLButtonElement>(null); // Ref for IntersectionObserver
    
    // Confirmation modal state
    const [showBgModal, setShowBgModal] = useState(false);
    const [bgModalData, setBgModalData] = useState<{
        originalUrl: string;
        processedUrl: string;
        cleanBlob: Blob;
    } | null>(null);
    const bgModalDecisionRef = useRef<'pending' | 'accept' | 'reject'>('pending');
    
    // Progress tracking
    const [bgProgress, setBgProgress] = useState<{
        current: number;
        total: number;
        message: string;
    }>({ current: 0, total: 4, message: '' });

    // Fetch garment data
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

    // --- FIX 1: Intersection Observer for Delete Button ---
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsDeleteBtnVisible(true);
                }
            },
            {
                threshold: 0.5, // Trigger when 50% of the button is visible
            }
        );

        if (deleteBtnRef.current) {
            observer.observe(deleteBtnRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [loading]); // Re-run when loading finishes and button renders

    // --- FIX 1: Update Countdown logic ---
    useEffect(() => {
        // Only count down if the button has been seen AND countdown > 0
        if (isDeleteBtnVisible && deleteCountdown > 0) {
            const timer = setTimeout(() => setDeleteCountdown(deleteCountdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [deleteCountdown, isDeleteBtnVisible]);

    if (loading || !garment) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    const computedName = (() => {
        const color = garment.main_color_name?.toLowerCase();
        const fabric = garment.material?.[0]?.toLowerCase();
        const subtype = garment.subcategory?.toLowerCase() || garment.category?.toLowerCase();
        if (color && fabric && subtype) return `${color} ${fabric} ${subtype}`;
        return garment.name;
    })();

    const stats = {
        timesWorn: garment.wear_count || 0,
        lastWorn: garment.last_worn_date ? formatRelativeDate(garment.last_worn_date) : "Never",
        lastLaundered: garment.last_laundered_date ? formatRelativeDate(garment.last_laundered_date) : "—",
        addedDate: new Date(garment.created_at).toLocaleDateString(),
        wearFrequency: calculateWearFrequency(garment.wear_count || 0, garment.created_at),
    };

    const legacy = parseLegacyNotes(garment.notes || undefined);

    // Helper: Add padding
    async function addPaddingToImage(blob: Blob, padding: number): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            const url = URL.createObjectURL(blob);

            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }

                canvas.width = img.width + padding * 2;
                canvas.height = img.height + padding * 2;

                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, padding, padding);

                canvas.toBlob(
                    (paddedBlob) => {
                        URL.revokeObjectURL(url);
                        if (paddedBlob) {
                            resolve(paddedBlob);
                        } else {
                            reject(new Error("Failed to create padded blob"));
                        }
                    },
                    "image/png",
                    1.0
                );
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error("Failed to load image"));
            };

            // CORS workaround for canvas tainting if using proxy URL
            img.crossOrigin = "anonymous";
            img.src = url;
        });
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to permanently remove this item from your wardrobe?")) return;

        setIsDeleting(true);
        try {
            const supabase = tryGetSupabaseBrowser();
            if (!supabase) throw new Error("Supabase client not available");

            const { error } = await supabase.from("garments").delete().eq("id", garment.id);

            if (error) throw error;
            router.push(`/${lang}/wardrobe`);
        } catch (error) {
            console.error("Error deleting garment:", error);
            alert("Failed to delete item. Please try again.");
            setIsDeleting(false);
        }
    };

    const handleSeeOutfits = () => {
        console.log("See outfits with:", garment.id);
    };

    const handleSaveEdit = async (updatedData: Partial<GarmentRow>) => {
        const result = await updateGarmentQuery(garment.id, updatedData);
        if (!result) throw new Error("Failed to update garment");
        setGarment(result);
        router.refresh();
    };

    const handleToggleFavorite = async () => {
        if (!garment) return;
        const newStatus = !garment.favorite;
        
        // Optimistic update
        setGarment({ ...garment, favorite: newStatus });

        const supabase = tryGetSupabaseBrowser();
        if (!supabase) return;

        const { error } = await supabase.from("garments").update({ favorite: newStatus }).eq("id", garment.id);

        if (error) {
            console.error("Error updating favorite:", error);
            // Revert
            setGarment({ ...garment, favorite: !newStatus });
        }
    };

    const handleRemoveBackground = async () => {
        setRemovingBg(true);
        setBgProgress({ current: 0, total: 4, message: 'Starting...' });
        try {
            const supabase = tryGetSupabaseBrowser();
            if (!supabase) throw new Error("Supabase client not available");

            if (!garment.image_url) throw new Error("No image URL available");
            
            const originalImageUrl = garment.image_url;

            // Step 1: Download current image via Next.js Proxy
            setBgProgress({ current: 1, total: 4, message: 'Downloading' });
            
            const proxyUrl = `/_next/image?url=${encodeURIComponent(garment.image_url)}&w=1920&q=100`;
            const response = await fetch(proxyUrl);
            
            if (!response.ok) throw new Error("Failed to fetch image via proxy");
            const imageBlob = await response.blob();

            // Step 2: Add padding
            setBgProgress({ current: 2, total: 4, message: 'Preparing' });
            console.log("Adding padding...");
            const paddedBlob = await addPaddingToImage(imageBlob, 50);

            // Step 3: Remove background (CLIENT-SIDE)
            setBgProgress({ current: 3, total: 4, message: 'Processing' });
            console.log("Removing background...");
            
            const cleanBlob = await removeBackground(paddedBlob, {
                model: "isnet",
                output: { format: "image/png", quality: 1.0 },
                debug: true,
                progress: (key, current, total) => {
                    setBgProgress({ current: current, total: total, message: 'Processing' });
                },
            });

            // Step 4: Modal Confirmation
            const processedUrl = URL.createObjectURL(cleanBlob);
            setBgModalData({
                originalUrl: originalImageUrl,
                processedUrl,
                cleanBlob,
            });
            bgModalDecisionRef.current = 'pending';
            setShowBgModal(true);

            // Wait for decision
            await new Promise<void>((resolve, reject) => {
                const checkDecision = setInterval(() => {
                    if (bgModalDecisionRef.current === 'accept') {
                        clearInterval(checkDecision);
                        setShowBgModal(false);
                        URL.revokeObjectURL(processedUrl);
                        resolve();
                    } else if (bgModalDecisionRef.current === 'reject') {
                        clearInterval(checkDecision);
                        setShowBgModal(false);
                        URL.revokeObjectURL(processedUrl);
                        reject(new Error('User rejected background removal'));
                    }
                }, 100);
            });

            // Step 5: Upload
            setBgProgress({ current: 4, total: 4, message: 'Saving' });
            const fileName = `clean/${garment.id}.png`;
            const { error: uploadError } = await supabase.storage
                .from("garments")
                .upload(fileName, cleanBlob, {
                    contentType: "image/png",
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            // Step 6 & 7: Get URL and Update DB
            const { data: { publicUrl } } = supabase.storage.from("garments").getPublicUrl(fileName);

            const { error: updateError } = await supabase
                .from("garments")
                .update({ image_url: publicUrl, image_storage_path: fileName })
                .eq("id", garment.id);

            if (updateError) throw updateError;

            // Step 8: Update State
            setGarment((prev) => (prev ? { ...prev, image_url: publicUrl } : null));
            
            alert("Background removed successfully!");
        } catch (error) {
            console.error("Error removing background:", error);
            if (error instanceof Error && error.message === 'User rejected background removal') {
                console.log('Action cancelled by user');
            } else {
                alert(error instanceof Error ? error.message : "Failed to remove background");
            }
        } finally {
            setRemovingBg(false);
            setBgProgress({ current: 0, total: 4, message: '' });
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <header className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-border bg-background px-5 py-4">
                <div className="flex justify-start">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </div>
                
                <h1 className="text-lg font-semibold text-foreground text-center truncate px-2">Item Details</h1>
                
                <div className="flex justify-end gap-2">
                    <Tooltip text={garment.favorite ? "Remove from Favorites" : "Add to Favorites"} side="bottom">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleToggleFavorite}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <Heart className={`h-5 w-5 transition-colors ${garment.favorite ? "fill-red-500 text-red-500" : ""}`} />
                        </Button>
                    </Tooltip>
                    <Tooltip text="Back to Wardrobe" side="bottom">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/${lang}`)} className="text-muted-foreground hover:text-foreground">
                            <Home className="h-5 w-5" />
                        </Button>
                    </Tooltip>
                </div>
            </header>

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

                {/* Buttons */}
                <Tooltip text="Manually Edit Details" className="w-full">
                    <Button variant="outline" size="lg" onClick={() => setIsEditing(true)} className="w-full gap-2">
                        <Edit className="h-4 w-4" /> Edit Item
                    </Button>
                </Tooltip>

                <Tooltip text="AI Background Removal" className="w-full">
                    <Button variant="outline" size="lg" onClick={handleRemoveBackground} className="w-full gap-2 relative overflow-hidden" disabled={removingBg}>
                        {removingBg && (
                            <div className="absolute left-0 top-0 bottom-0 bg-blue-500/20 transition-all duration-500 ease-out" style={{ width: `${(bgProgress.current / bgProgress.total) * 100}%` }} />
                        )}
                        <div className="relative z-10 flex items-center gap-2">
                            {removingBg ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    <span>{bgProgress.message || 'Processing'}... ({bgProgress.current}/{bgProgress.total})</span>
                                </>
                            ) : (
                                <>
                                    <Eraser className="h-4 w-4" /> <span>Remove Background</span>
                                </>
                            )}
                        </div>
                    </Button>
                </Tooltip>

                {/* Info & Stats */}
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-semibold">{computedName}</h1>
                    <p className="text-muted-foreground capitalize">{garment.subcategory || garment.category}</p>
                </div>

                <Card className="p-5 space-y-4">
                    <div>
                        <h3 className="mb-3 font-semibold">Description</h3>
                        <p className="text-muted-foreground leading-relaxed">{garment.description || "No description provided."}</p>
                    </div>
                    <div className="pt-2 border-t border-border space-y-3">
                        {/* Tags / Details */}
                        {garment.brand && (
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Brand</span>
                                <span className="text-sm">{garment.brand}</span>
                            </div>
                        )}
                        {garment.style_context && garment.style_context.length > 0 && (
                            <div className="flex items-start justify-between">
                                <span className="text-muted-foreground">Style</span>
                                <div className="flex flex-wrap gap-1.5 justify-end max-w-[280px]">
                                    {garment.style_context.map((s: string, idx: number) => (
                                        <Badge key={idx} variant="outline" className="text-xs">{s}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        {garment.main_color_name && (
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Main Color</span>
                                <div className="flex items-center gap-2">
                                    {garment.main_color_hex && (
                                        <div className="w-5 h-5 rounded-full border-2 border-border" style={{ backgroundColor: garment.main_color_hex }} />
                                    )}
                                    <span>{garment.main_color_name}</span>
                                </div>
                            </div>
                        )}
                        {garment.color_temperature && (
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Color Tone</span>
                                <span className="text-sm">{garment.color_temperature}</span>
                            </div>
                        )}
                        {/* Secondary Colors */}
                        {garment.secondary_colors && garment.secondary_colors.length > 0 && (
                            <div className="flex items-start justify-between">
                                <span className="text-muted-foreground">Accents</span>
                                <div className="flex flex-wrap gap-1.5 justify-end max-w-[280px]">
                                    {garment.secondary_colors.map((color: any, index: number) => (
                                        <div key={index} className="flex items-center gap-1.5">
                                            <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: color.hex }} />
                                            <span className="text-sm">{color.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Fabric & Features */}
                        {garment.material && garment.material.length > 0 && (
                            <div className="flex items-start justify-between">
                                <span className="text-muted-foreground">Fabric</span>
                                <div className="flex flex-wrap gap-1.5 justify-end max-w-[280px]">
                                    {garment.material.map((m: string, idx: number) => (
                                        <Badge key={idx} variant="outline" className="text-xs">{m}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Extra Features for Trousers */}
                        {garment.category === 'bottoms' && garment.key_features && (garment.key_features as string[]).some(f => ['adjusters', 'gurkha'].includes(f.toLowerCase())) && (
                            <div className="flex items-start justify-between">
                                <span className="text-muted-foreground">Extra Feature</span>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="capitalize text-xs">
                                        {(garment.key_features as string[]).find(f => f.toLowerCase() === 'adjusters') ? 'Adjusters' : 'Gurkha'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">(No belt)</span>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Statistics */}
                <Card className="p-5 space-y-4">
                    <h3 className="flex items-center gap-2 font-semibold">
                        <TrendingUp className="h-5 w-5 text-primary" /> <span>Wearing Statistics</span>
                    </h3>
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
                    {/* Chart */}
                    <div className="h-[140px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockWearData}>
                                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Bar dataKey="wears" fill="#7a2f2f" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="pt-2 border-t border-border space-y-2.5">
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Added:</span>
                            <span className="ml-auto font-medium">{stats.addedDate}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Droplet className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Last laundered:</span>
                            <span className="ml-auto font-medium">{stats.lastLaundered}</span>
                        </div>
                    </div>
                </Card>

                {/* Actions */}
                <Card className="p-4 space-y-3">
                    <Button onClick={handleSeeOutfits} className="w-full" variant="outline">
                        <div className="flex items-center gap-2"><Eye className="h-4 w-4" /> <span>See Outfits</span></div> <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center justify-center">
                        <Button 
                            ref={deleteBtnRef} 
                            onClick={handleDelete} 
                            variant="ghost" 
                            className="w-full text-red-500 hover:text-red-600 hover:bg-red-500/10" 
                            disabled={deleteCountdown > 0 || isDeleting}
                        >
                            <Trash2 className="h-4 w-4 mr-2" /> 
                            {isDeleting ? "Removing..." : deleteCountdown > 0 ? `Remove (${deleteCountdown})` : "Remove"}
                        </Button>
                    </div>
                </Card>
            </div>

            <BottomNavigationBar dict={dict} lang={lang} />

            {isEditing && <GarmentEditModal garment={garment} onClose={() => setIsEditing(false)} onSave={handleSaveEdit} />}

            {/* Background Removal Modal - FIX 2: Responsive Width */}
            {showBgModal && bgModalData && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <Card className="w-[90vw] max-w-3xl p-4 md:p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">Confirm Background Removal</h2>
                        <p className="text-muted-foreground mb-6">Compare the original and processed images.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-center">Original (With Background)</h3>
                                <div className="relative aspect-square bg-muted rounded-lg overflow-hidden border-2 border-border">
                                    <Image
                                        src={bgModalData.originalUrl}
                                        alt="Original"
                                        fill
                                        className="object-contain"
                                        sizes="(max-width: 768px) 100vw, 500px"
                                        priority
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-center">Processed (Background Removed)</h3>
                                <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary" style={{ backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50% / 20px 20px' }}>
                                    <Image
                                        src={bgModalData.processedUrl}
                                        alt="Processed"
                                        fill
                                        className="object-contain"
                                        unoptimized // KEEP unoptimized for blob: URLs
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 justify-end">
                            <Button variant="outline" size="lg" onClick={() => bgModalDecisionRef.current = 'reject'} className="min-w-[120px]"><Ban className="w-4 h-4 mr-2" /> Reject</Button>
                            <Button variant="default" size="lg" onClick={() => bgModalDecisionRef.current = 'accept'} className="min-w-[120px]"><CheckCircle className="w-4 h-4 mr-2" /> Accept</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

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