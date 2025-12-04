"use client";

import { AlertTriangle, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { DuplicateMatch } from "@/lib/utils/duplicateDetection";

interface DuplicateWarningModalProps {
	newGarmentName: string;
	newGarmentImage: string;
	duplicates: DuplicateMatch[];
	onAddAnyway: () => void;
	onCancel: () => void;
}

export function DuplicateWarningModal({ newGarmentName, newGarmentImage, duplicates, onAddAnyway, onCancel }: DuplicateWarningModalProps) {
	const topMatch = duplicates[0];

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-background">
				<div className="p-6 space-y-4">
					{/* Header */}
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-3">
							<div className="p-2 rounded-full bg-yellow-500/10">
								<AlertTriangle className="w-6 h-6 text-yellow-500" />
							</div>
							<div>
								<h2 className="text-lg font-semibold text-foreground">Możliwy duplikat</h2>
								<p className="text-sm text-muted-foreground">Znaleziono podobne ubranie w Twojej szafie</p>
							</div>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={onCancel}
							className="h-8 w-8 p-0"
						>
							<X className="w-4 h-4" />
						</Button>
					</div>

					{/* Comparison */}
					<div className="grid grid-cols-2 gap-4 py-4">
						{/* New garment */}
						<div className="space-y-2">
							<p className="text-xs font-medium text-muted-foreground uppercase">Nowe ubranie</p>
							<div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
								<Image
									src={newGarmentImage}
									alt={newGarmentName}
									fill
									className="object-cover"
								/>
							</div>
							<p className="text-sm font-medium text-foreground">{newGarmentName}</p>
						</div>

						{/* Existing garment */}
						<div className="space-y-2">
							<p className="text-xs font-medium text-muted-foreground uppercase">W Twojej szafie</p>
							<div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
								<Image
									src={topMatch.garment.image_url || "/api/placeholder/300/300"}
									alt={topMatch.garment.name}
									fill
									className="object-cover"
								/>
							</div>
							<p className="text-sm font-medium text-foreground">{topMatch.garment.name}</p>
						</div>
					</div>

					{/* Match details */}
					<div className="space-y-2 p-4 rounded-lg bg-muted/50">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-foreground">Stopień podobieństwa</span>
							<span className="text-lg font-bold text-yellow-600">{topMatch.matchScore}%</span>
						</div>

						<div className="space-y-1 pt-2 border-t border-border">
							<p className="text-xs font-medium text-muted-foreground">Powody podobieństwa:</p>
							<ul className="text-xs text-foreground space-y-1">
								{topMatch.matchReasons.map((reason, idx) => (
									<li
										key={idx}
										className="flex items-start gap-2"
									>
										<span className="text-yellow-500 mt-0.5">•</span>
										<span>{reason}</span>
									</li>
								))}
							</ul>
						</div>

						{topMatch.visualSimilarity !== undefined && (
							<div className="pt-2 border-t border-border">
								<p className="text-xs text-muted-foreground">
									Podobieństwo wizualne: <span className="font-semibold text-foreground">{topMatch.visualSimilarity}%</span>
								</p>
							</div>
						)}
					</div>

					{/* Additional duplicates */}
					{duplicates.length > 1 && (
						<div className="pt-2">
							<p className="text-xs text-muted-foreground">
								Znaleziono jeszcze <span className="font-semibold">{duplicates.length - 1}</span> podobne{" "}
								{duplicates.length - 1 === 1 ? "ubranie" : "ubrania"}
							</p>
						</div>
					)}

					{/* Actions */}
					<div className="flex flex-col gap-2 pt-4">
						<Button
							onClick={onCancel}
							variant="outline"
							className="w-full"
						>
							Anuluj i sprawdź ponownie
						</Button>
						<Button
							onClick={onAddAnyway}
							variant="default"
							className="w-full"
						>
							Dodaj mimo wszystko
						</Button>
					</div>

					<p className="text-xs text-center text-muted-foreground pt-2">Możesz mieć to samo ubranie w różnych kolorach lub wersjach</p>
				</div>
			</Card>
		</div>
	);
}
