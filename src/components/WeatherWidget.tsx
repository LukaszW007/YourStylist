export default async function WeatherWidget({ lang }: { lang: string }) {
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

	return (
		<section className="rounded-xl border border-slate-300/60 dark:border-white/10 p-4 bg-white/80 dark:bg-white/5">
			<div className="text-sm opacity-80">
				London • {temp}°C • {lang.toUpperCase()}
			</div>
		</section>
	);
}
