import { loadDictionary } from "@/lib/i18n/dictionary";
import TodayOutfitView from "@/views/outfit/TodayOutfitView";

type TodayOutfitPageProps = {
	params: Promise<{
		lang: string;
	}>;
};

export default async function TodayOutfitPage({ params }: TodayOutfitPageProps) {
	const { lang } = await params;
	const dict = await loadDictionary(lang);
	return (
		<TodayOutfitView
			dict={dict}
			lang={lang}
		/>
	);
}
