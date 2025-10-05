import WeatherWidget from "@/components/WeatherWidget";
import OutfitGenerator from "@/components/OutfitGenerator";
import { loadDictionary } from "@/lib/i18n/dictionary";

type DashboardProps = {
	params: {
		lang: string;
	};
};

export default async function Dashboard({ params }: DashboardProps) {
	const { lang } = params;
	const dict = await loadDictionary(lang);
	return (
		<main className="p-4 pb-24">
			<div className="text-center space-y-2 mt-2">
				<p className="text-sm opacity-80">London, 18°C</p>
				<h1 className="text-2xl font-serif tracking-wide">{dict.home.title}</h1>
			</div>
			<div className="mt-6">
				<OutfitGenerator dict={dict} />
			</div>
			<div className="mt-6">
				<WeatherWidget lang={lang} />
			</div>
		</main>
	);
}
