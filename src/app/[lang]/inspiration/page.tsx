import BackButton from "@/components/navigation/BackButton";
import { loadDictionary } from "@/lib/i18n/dictionary";

type InspirationPageProps = {
	params: Promise<{
		lang: string;
	}>;
};

export default async function InspirationPage({ params }: InspirationPageProps) {
	const { lang } = await params;
	const dict = await loadDictionary(lang);
	return (
		<main className="flex min-h-[100svh] flex-col gap-6 bg-background px-5 pb-24 pt-8">
			<div className="flex items-center justify-between">
				<BackButton
					href={`/${lang}`}
					label="Dashboard"
				/>
				<h1 className="text-xl font-semibold">{dict.home.quickLinks.inspiration}</h1>
				<div
					className="w-16"
					aria-hidden="true"
				/>
			</div>
			<section className="space-y-3 text-sm text-muted-foreground">
				<p>Curated lookbooks, AI moodboards, and community outfits are arriving soon.</p>
				<p className="text-xs uppercase tracking-[0.25em]">Stay tuned.</p>
			</section>
		</main>
	);
}
