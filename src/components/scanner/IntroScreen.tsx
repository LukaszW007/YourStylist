"use client";

import { Camera, Image as ImageIcon, Shirt } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface IntroScreenProps {
	onScanClick: () => void;
	onGalleryClick: () => void;
}

export function IntroScreen({ onScanClick, onGalleryClick }: IntroScreenProps) {
	return (
		<div className="min-h-screen bg-background">
			<div className="flex flex-col items-center justify-center px-6 py-8">
				<div className="max-w-sm w-full text-center space-y-8">
					{/* Visual Icon */}
					<div className="relative mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
						<Camera className="w-8 h-8 text-primary" />
						<Shirt className="w-6 h-6 text-primary absolute -top-1 -right-1" />
					</div>

					{/* Headlines */}
					<div className="space-y-4">
						<h2 className="text-xl font-brand text-primary">DODAJ KILKA UBRAŃ NARAZ</h2>
						<p className="text-muted-foreground leading-relaxed">Nasze AI rozpozna i skategoryzuje ubrania z jednego zdjęcia</p>
					</div>

					{/* Instructions */}
					<div className="text-left space-y-4">
						<div className="flex items-start gap-4 p-4 rounded-lg bg-card">
							<span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
								1
							</span>
							<p className="text-sm pt-1 leading-relaxed">Rozłóż do 5 elementów odzieży na kontrastującym tle (np. łóżku)</p>
						</div>
						<div className="flex items-start gap-4 p-4 rounded-lg bg-card">
							<span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
								2
							</span>
							<p className="text-sm pt-1 leading-relaxed">Upewnij się, że są dobrze oświetlone</p>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="space-y-3 mt-8">
						<Button
							onClick={onScanClick}
							className="w-full h-14 text-lg"
							size="lg"
						>
							<Camera className="w-5 h-5 mr-2" />
							Scan items
						</Button>
						<Button
							onClick={onGalleryClick}
							variant="outline"
							className="w-full h-14 text-lg"
							size="lg"
						>
							<ImageIcon className="w-5 h-5 mr-2" />
							Choose from gallery
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
