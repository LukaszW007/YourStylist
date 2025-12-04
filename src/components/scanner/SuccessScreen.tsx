"use client";

import { CheckCircle2, Camera, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface SuccessScreenProps {
	itemCount: number;
	onScanMore: () => void;
	lang: string;
}

export function SuccessScreen({ itemCount, onScanMore, lang }: SuccessScreenProps) {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-6">
			<div className="max-w-sm w-full px-6 text-center space-y-8">
				{/* Success Icon */}
				<div className="relative mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
					<CheckCircle2 className="w-12 h-12 text-primary" />
				</div>

				{/* Success Message */}
				<div className="space-y-3">
					<h2 className="text-2xl font-brand text-primary">GOTOWE!</h2>
					<p className="text-muted-foreground leading-relaxed">
						{itemCount === 1 ? "Dodałeś 1 element do swojej szafy" : `Dodałeś ${itemCount} elementów do swojej szafy`}
					</p>
				</div>

				{/* Action Buttons */}
				<div className="space-y-3">
					<Button
						onClick={onScanMore}
						className="w-full h-14 text-lg"
						size="lg"
					>
						<Camera className="w-5 h-5 mr-2" />
						Scan more items
					</Button>
					<Link
						href={`/${lang}/wardrobe`}
						className="block"
					>
						<Button
							variant="outline"
							className="w-full h-14 text-lg"
							size="lg"
						>
							View my closet
						</Button>
					</Link>
					<Link
						href={`/${lang}`}
						className="block"
					>
						<Button
							variant="ghost"
							className="w-full h-14 text-lg"
							size="lg"
						>
							<Home className="w-5 h-5 mr-2" />
							Back to menu
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
