import { Flame, RefreshCcw, ThumbsUp } from "lucide-react";

import OutfitGenerator from "@/components/OutfitGenerator";
import WeatherWidget from "@/components/WeatherWidget";
import BackButton from "@/components/navigation/BackButton";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";

type TodayOutfitViewProps = {
	dict: Dictionary;
	lang: string;
	className?: string;
};

const detailBullets = [
	"Lightweight wool blend keeps you comfortable in unpredictable weather",
	"Neutral palette makes each item easy to remix with your capsule wardrobe",
	"Add a silk pocket square for colour when you need to stand out",
];

export function TodayOutfitView({ dict, lang, className }: TodayOutfitViewProps) {
	return (
		<section className={cn("flex min-h-[100svh] flex-col gap-8 bg-background px-5 pb-24 pt-8", className)}>
			<header className="flex items-center justify-between">
				<BackButton
					href={`/${lang}`}
					label="Dashboard"
				/>
				<span className="text-xs uppercase tracking-[0.35em] text-muted-foreground">{dict.home.title}</span>
				<div
					className="w-16"
					aria-hidden="true"
				/>
			</header>

			<div className="text-center space-y-2">
				<WeatherWidget
					lang={lang}
					variant="inline"
					className="justify-center"
				/>
				<h1 className="text-3xl font-serif text-primary">{dict.home.outfitOfTheDay}</h1>
				<p className="text-sm text-muted-foreground">{dict.home.outfitDescription}</p>
			</div>

			<OutfitGenerator
				dict={dict}
				className="mx-auto w-full max-w-md"
			/>

			<Card className="mx-auto w-full max-w-md border-primary/20 bg-card/90">
				<CardHeader className="gap-3 text-left">
					<CardTitle className="flex items-center gap-2 text-base text-foreground">
						<ThumbsUp className="h-4 w-4 text-primary" /> Why it works today
					</CardTitle>
					<CardDescription className="text-sm leading-relaxed text-muted-foreground">
						Curated with Merriweather&rsquo;s style heuristics for a business-ready silhouette that adapts from desk to dinner.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2 text-sm text-muted-foreground">
					<ul className="space-y-2 text-left">
						{detailBullets.map((detail) => (
							<li
								key={detail}
								className="flex gap-3"
							>
								<Flame className="mt-0.5 h-4 w-4 text-primary" />
								<span>{detail}</span>
							</li>
						))}
					</ul>
				</CardContent>
			</Card>

			<div className="mx-auto flex w-full max-w-md gap-3">
				<Button
					className="h-12 flex-1 rounded-xl"
					variant="secondary"
				>
					<RefreshCcw className="h-4 w-4" />
					Show another
				</Button>
				<Button className="h-12 flex-1 rounded-xl">Save outfit</Button>
			</div>
		</section>
	);
}

export default TodayOutfitView;
