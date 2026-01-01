import ScanPageClient from "./ScanPageClient";
import { loadWardrobeDictionary } from "@/lib/i18n/wardrobeTranslations";
import { loadDictionary } from "@/lib/i18n/dictionary";

type ScanPageProps = {
	params: Promise<{
		lang: string;
	}>;
};

export default async function ScanPage({ params }: ScanPageProps) {
	const { lang } = await params;
	const wardrobeDict = await loadWardrobeDictionary(lang as "en" | "pl" | "no");
    const fullDict = await loadDictionary(lang);

	return (
		<ScanPageClient
			lang={lang}
			translations={wardrobeDict.scanner}
            dict={fullDict}
		/>
	);
}
