import { cn } from "@/lib/utils";

type WeatherWidgetProps = {
	lang: string;
	variant?: "card" | "inline";
	className?: string;
};

export default async function WeatherWidget({ lang, variant = "card", className }: WeatherWidgetProps) {
	// Simple server-side fetch from Open-Meteo (London coords as placeholder)
	const url = "https://api.open-meteo.com/v1/forecast?latitude=51.5072&longitude=-0.1276&current=temperature_2m";
	let temp = 18;
	try {
		const res = await fetch(url, { next: { revalidate: 600 } });
		const data = await res.json();
		temp = Math.round(data?.current?.temperature_2m ?? temp);
	} catch {
		// ignore network failures, keep fallback temp
	}

	if (variant === "inline") {
		return (
			<p className={cn("flex items-center justify-center gap-2 text-sm text-muted-foreground", className)}>
				<span className="font-medium text-foreground">London</span>
				<span aria-hidden="true">•</span>
				<span>{temp}°C</span>
				<span aria-hidden="true">•</span>
				<span>{lang.toUpperCase()}</span>
			</p>
		);
	}

	return (
		<section className={cn("rounded-xl border border-slate-300/60 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5", className)}>
			<div className="text-sm opacity-80">
				London • {temp}°C • {lang.toUpperCase()}
			</div>
		</section>
	);
}
