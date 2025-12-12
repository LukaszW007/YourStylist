import WardrobePageClient from "./WardrobePageClient";
import { loadDictionary } from "@/lib/i18n/dictionary";

type WardrobePageProps = {
	params: Promise<{
		lang: string;
	}>;
};

export default async function WardrobePage({ params }: WardrobePageProps) {
	const { lang } = await params;
	const dict = await loadDictionary(lang);
	return <WardrobePageClient lang={lang} dict={dict} />;
}
