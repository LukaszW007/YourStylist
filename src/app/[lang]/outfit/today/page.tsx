import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDictionary } from "@/lib/i18n/dictionary";
import { TodayOutfitView } from "@/views/outfit/TodayOutfitView";
import { generateDailyOutfits } from "@/app/actions/generate-outfit";

export const dynamic = 'force-dynamic';

type TodayOutfitPageProps = {
	params: Promise<{
		lang: string;
	}>;
};

/**
 * The page component for the "Today's Outfit" view.
 * This is a Next.js Server Component that fetches data and passes it to a Client Component.
 */
export default async function TodayOutfitPage({ params }: TodayOutfitPageProps) {
	const { lang } = await params;
	const dict = await loadDictionary(lang);
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(`/${lang}/login`);
	}

	// TODO: Fetch real weather data here based on user location
	const weatherDescription = "Sunny and warm";
	const temperature = 24;

	// Fetch 3 outfit suggestions
	const outfits = await generateDailyOutfits(user.id, weatherDescription, temperature);

	return (
		<TodayOutfitView
			initialOutfits={outfits}
			lang={lang}
			dict={dict}
		/>
	);
}
