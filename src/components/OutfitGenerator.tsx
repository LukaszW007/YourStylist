import Image from "next/image";

import type { Dictionary } from "@/lib/i18n/dictionary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type OutfitGeneratorProps = {
	dict: Dictionary;
	className?: string;
	imageSrc?: string;
	imageAlt?: string;
};

const DEFAULT_IMAGE =
	"https://images.unsplash.com/photo-1626872640220-e5f4454198b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVucyUyMGJ1c2luZXNzJTIwY2FzdWFsfGVufDF8fHx8MTc1ODgzMDM3OXww&ixlib=rb-4.1.0&q=80&w=1080";

export default function OutfitGenerator({ dict, className, imageSrc = DEFAULT_IMAGE, imageAlt = dict.home.outfitOfTheDay }: OutfitGeneratorProps) {
	return (
		<Card className={cn("border-primary/15 bg-background/90 dark:bg-white/5", className)}>
			<CardHeader className="px-6 pt-6 text-center">
				<CardTitle className="font-brand text-xs uppercase tracking-[0.35em] text-primary">{dict.home.outfitOfTheDay}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6 px-6 pb-6 text-center">
				<div className="relative mx-auto h-40 w-40 overflow-hidden rounded-2xl border border-primary/20 shadow-sm">
					<Image
						src={imageSrc}
						alt={imageAlt}
						fill
						sizes="160px"
						className="object-cover"
						priority
					/>
				</div>
				<p className="text-sm leading-relaxed text-muted-foreground md:text-base">{dict.home.outfitDescription}</p>
			</CardContent>
		</Card>
	);
}
